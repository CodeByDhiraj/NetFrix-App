import { type NextRequest, NextResponse } from "next/server"
import { getDatabase, COLLECTIONS } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

/* 🆕  edge-cache off */
export const dynamic   = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDatabase()
    const contentCollection = db.collection(COLLECTIONS.CONTENT)

    if (!ObjectId.isValid(params.id))
      return NextResponse.json({ error: "Invalid content ID" }, { status: 400 })

    const content = await contentCollection.findOne({ _id: new ObjectId(params.id) })
    if (!content)
      return NextResponse.json({ error: "Content not found" }, { status: 404 })

    /* 🆕 send no-store header */
    return new NextResponse(
      JSON.stringify({ success: true, data: content }),
      { status: 200, headers: { "Cache-Control": "no-store" } }
    )
  } catch (err) {
    console.error("Admin content fetch error:", err)
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    )
  }
}

// ---------- PUT : update movie / series ----------
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!ObjectId.isValid(params.id))
      return NextResponse.json({ error: "Invalid content ID" }, { status: 400 });

    const body = await request.json();
    const {
      title, description, type,
      genre, rating, year, duration,
      thumbnail, hlsUrl, categories = [],
      seasons = []
    } = body;

    // 1️⃣ Validate input
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

    // 2️⃣ Build update objects
    const setOps: Record<string, any> = {
      title: title.trim(),
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: description.trim(),
      type,
      genre: genre
        ? Array.isArray(genre)
          ? genre
          : genre.split(",").map((g: string) => g.trim())
        : [],
      rating,
      year,
      duration,
      thumbnail,
      categories,
      updatedAt: new Date()
    };

    const unsetOps: Record<string, "" > = {};

    if (type === "movie") {
      setOps.hlsUrl = hlsUrl?.trim() || "";
      unsetOps.seasons = "";
    } else {
      setOps.seasons = seasons;
      unsetOps.hlsUrl = "";
    }

    // 3️⃣ Update DB
    const db = await getDatabase();
    const result = await db
      .collection(COLLECTIONS.CONTENT)
      .updateOne(
        { _id: new ObjectId(params.id) },
        {
          $set: setOps,
          ...(Object.keys(unsetOps).length ? { $unset: unsetOps } : {})
        }
      );

    if (result.matchedCount === 0)
      return NextResponse.json({ error: "Content not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Content updated successfully" });
  } catch (err) {
    console.error("Admin content update error:", err);
    return NextResponse.json(
      { error: "Failed to update content", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}



export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("Deleting content:", params.id)

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid content ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const contentCollection = db.collection(COLLECTIONS.CONTENT)

    // Actually delete the content instead of just archiving
    const result = await contentCollection.deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    console.log("Content deleted successfully")

    return NextResponse.json({
      success: true,
      message: "Content deleted successfully",
    })
  } catch (error) {
    console.error("Admin content delete error:", error)
    return NextResponse.json(
      {
        error: "Failed to delete content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
