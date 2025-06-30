import { type NextRequest, NextResponse } from "next/server"
import { getDatabase, COLLECTIONS } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const contentCollection = db.collection(COLLECTIONS.CONTENT)

    const { searchParams } = new URL(request.url)
    const page   = Number.parseInt(searchParams.get("page")   || "1")
    const limit  = Number.parseInt(searchParams.get("limit")  || "20")
    const genre  = searchParams.get("genre")
    const type   = searchParams.get("type")
    const search = searchParams.get("search")

    /* ─── Query: केवल published दिखाओ ─── */
    const query: any = { status: "published" }

    if (genre) {
      query.genre = { $in: [new RegExp(genre, "i")] }
    }
    if (type) {
      query.type = type
    }
    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { keywords:    { $in: [new RegExp(search, "i")] } },
      ]
    }

    /* ─── Pagination ─── */
    const skip = (page - 1) * limit

    const [content, total] = await Promise.all([
      contentCollection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),

      contentCollection.countDocuments(query),
    ])

    /* ─── Transform for frontend ─── */
    const transformedContent = content.map((item) => ({
  id:          item._id,
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


    return NextResponse.json({
      success: true,
      data: transformedContent,
      pagination: {
        currentPage: page,
        totalPages:  Math.ceil(total / limit),
        totalItems:  total,
        hasNextPage: skip + limit < total,
        hasPrevPage: page > 1,
      },
    })
  } catch (error) {
    console.error("Content fetch error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
