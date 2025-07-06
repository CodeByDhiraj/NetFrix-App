import { type NextRequest, NextResponse } from "next/server"
import { getDatabase, COLLECTIONS } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

/* cache बिल्कुल बन्द */
export const dynamic   = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const db  = await getDatabase()
    const col = db.collection(COLLECTIONS.CONTENT)

    const { searchParams } = new URL(request.url)
    const page   = Number.parseInt(searchParams.get("page")   || "1")
    const limit  = Number.parseInt(searchParams.get("limit")  || "20")
    const genre  = searchParams.get("genre")
    const type   = searchParams.get("type")
    const search = searchParams.get("search")

    /* --- query build --- */
    const query: any = { status: "published" }
    if (genre)  query.genre = { $in: [new RegExp(genre, "i")] }
    if (type)   query.type  = type
    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { keywords:    { $in: [new RegExp(search, "i")] } },
      ]
    }

    const skip = (page - 1) * limit

    const [docs, total] = await Promise.all([
      col.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      col.countDocuments(query),
    ])

    /* transform */
    const data = docs.map(item => ({
      _id:         item._id,
      title:       item.title,
      slug:        item.slug,
      description: item.description,
      thumbnail:   item.thumbnail,
      genre:       item.genre,
      rating:      item.rating,
      year:        item.year,
      duration:    `${Math.floor(item.duration / 60)}h ${item.duration % 60}m`,
      type:        item.type,
      hlsUrl:      item.type === "movie"
                    ? item.hlsUrl
                    : item.seasons?.[0]?.episodes?.[0]?.hlsUrl || null,
      views:       item.views,
      featured:    item.featured,
      categories:  item.categories ?? [],
    }))

    /* send with no-store header */
    return new NextResponse(
      JSON.stringify({
        success: true,
        data,
        pagination: {
          currentPage: page,
          totalPages:  Math.ceil(total / limit),
          totalItems:  total,
          hasNextPage: skip + limit < total,
          hasPrevPage: page > 1,
        },
      }),
      { status: 200, headers: { "Cache-Control": "no-store" } }
    )
  } catch (err) {
    console.error("Content fetch error:", err)
    return NextResponse.json(
      { error: "Internal server error", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}
