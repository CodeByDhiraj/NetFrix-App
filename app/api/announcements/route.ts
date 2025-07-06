import { type NextRequest, NextResponse } from "next/server"
import { getDatabase, COLLECTIONS } from "@/lib/mongodb"

export const dynamic = "force-dynamic";  // disables static caching
export const revalidate = 0;             // ensure always fresh

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const announcementsCollection = db.collection(COLLECTIONS.ANNOUNCEMENTS)

    const now = new Date()

    const announcements = await announcementsCollection
      .find({
        isActive: true,
        targetAudience: { $in: ["all", "users"] },
        startDate: { $lte: now },
        $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }],
      })
      .sort({ priority: -1, createdAt: -1 })
      .limit(5)
      .toArray()

    return new NextResponse(
      JSON.stringify({ success: true, data: announcements }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",         
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    )
  } catch (error) {
    console.error("Public announcements fetch error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch announcements",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
