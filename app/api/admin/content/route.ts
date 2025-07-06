import { type NextRequest, NextResponse } from "next/server"
import { getDatabase, COLLECTIONS } from "@/lib/mongodb"

/* ───── disable edge/browser cache ───── */
export const dynamic   = "force-dynamic";   // never prerender
export const revalidate = 0;                // no ISR
/* ─────────────────────────────────────── */

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const contentCollection = db.collection(COLLECTIONS.CONTENT)

    const { searchParams } = new URL(request.url)
    const page   = Number.parseInt(searchParams.get("page")  || "1")
    const limit  = Number.parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search")

    /* build query */
    const query: any = {}
    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { genre:       { $in: [new RegExp(search, "i")] } },
        { categories:  { $in: [new RegExp(search, "i")] } },
      ]
    }

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

    /* ⬇️  send 200 with no-store cache header */
    return new NextResponse(
      JSON.stringify({
        success: true,
        data: content,
        pagination: {
          currentPage: page,
          totalPages:  Math.ceil(total / limit),
          totalItems:  total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      }),
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    )
  } catch (error) {
    console.error("Admin content fetch error:", error)
    return NextResponse.json(
      {
        error:   "Failed to fetch content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// ---------- POST  :  create movie / series ----------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title, description, type = "movie", genre,
      rating = "PG-13", year, duration, thumbnail,
      hlsUrl, categories = [], seasons = []
    } = body;

    /* 1️⃣ validation */
    if (!title || !description)
      return NextResponse.json({ error: "Title & description required" }, { status: 400 });

    if (type === "movie") {
      if (!hlsUrl)
        return NextResponse.json({ error: "Movie needs an HLS URL" }, { status: 400 });
    } else {
      if (!Array.isArray(seasons) || seasons.length === 0)
        return NextResponse.json({ error: "Series must have ≥1 season" }, { status: 400 });

      for (const s of seasons) {
        if (!s.title || !s.episodes?.length)
          return NextResponse.json({ error: "Season needs title & episodes" }, { status: 400 });
        for (const e of s.episodes)
          if (!e.hlsUrl || !e.title)
            return NextResponse.json({ error: "Episode needs title & hlsUrl" }, { status: 400 });
      }
    }

    /* 2️⃣ doc तैयार करो */
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const doc  = {
      title: title.trim(),
      slug,
      description: description.trim(),
      type,
      genre: Array.isArray(genre) ? genre : genre.split(",").map((g: string) => g.trim()),
      rating,
      year  : year || new Date().getFullYear(),
      duration: duration || 120,
      thumbnail: thumbnail || "/placeholder.svg?height=300&width=200",
      hlsUrl : type === "movie" ? hlsUrl?.trim() : undefined,
      categories,
      seasons : type === "series" ? seasons : undefined,
      status: "published",
      views : 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date()
    };

    /* 3️⃣ DB insert */
    const db  = await getDatabase();
    const res = await db.collection(COLLECTIONS.CONTENT).insertOne(doc);

    return NextResponse.json({
      success: true,
      message: "Content created successfully",
      data: { ...doc, _id: res.insertedId }
    });
  } catch (err) {
    console.error("Admin content creation error:", err);
    return NextResponse.json(
      { error: "Failed to create content", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
