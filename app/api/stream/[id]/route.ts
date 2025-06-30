import { NextResponse, type NextRequest } from "next/server"
import { getDatabase, COLLECTIONS } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

/* ─────────────────────────────────────────
   GET /api/stream/[id]?quality=hd
───────────────────────────────────────── */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    /* 1️⃣  auth check (same as before) */
    const authToken = request.cookies.get("auth-token")
    if (!authToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    /* 2️⃣  fetch content from DB */
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid content id" }, { status: 400 })
    }

    const db = await getDatabase()
    const content = await db
      .collection(COLLECTIONS.CONTENT)
      .findOne({ _id: new ObjectId(params.id) }, { projection: { hlsUrl: 1, title: 1 } })

    if (!content || !content.hlsUrl) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    /* 3️⃣  quality param (future use; for now we ignore) */
    const { searchParams } = new URL(request.url)
    const quality = searchParams.get("quality") || "hd"

    /* 4️⃣  log + respond */
    console.log(`User streaming ${content._id} (${quality})`)

    return NextResponse.json({
      success: true,
      data: {
        streamUrl: content.hlsUrl,   // ← सीधे Cloudflare R2 या जहां भी .m3u8 रखा है
        quality,
        title: content.title,
        subtitles: [],               // अगर बाद में जोड़ना हो तो यहीं push करो
      },
    })
  } catch (err) {
    console.error("Stream route error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
