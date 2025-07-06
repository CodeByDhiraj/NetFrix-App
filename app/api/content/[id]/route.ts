import { type NextRequest, NextResponse } from "next/server"
import { getDatabase, COLLECTIONS } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

/* ── no static/edge cache ── */
export const dynamic   = "force-dynamic"
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!ObjectId.isValid(params.id))
      return NextResponse.json({ error: "Invalid content ID" }, { status: 400 })

    const db   = await getDatabase()
    const doc  = await db
      .collection(COLLECTIONS.CONTENT)
      .findOne({ _id: new ObjectId(params.id) })

    if (!doc)
      return NextResponse.json({ error: "Content not found" }, { status: 404 })

    /* ⬇️ send with Cache-Control: no-store */
    return new NextResponse(
      JSON.stringify({ success: true, data: doc }),
      { status: 200, headers: { "Cache-Control": "no-store" } }
    )
  } catch (err) {
    console.error("Public content fetch error:", err)
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    )
  }
}
