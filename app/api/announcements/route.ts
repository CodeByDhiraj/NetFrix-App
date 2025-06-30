import { type NextRequest, NextResponse } from "next/server"
import { getDatabase, COLLECTIONS } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const announcementsCollection = db.collection(COLLECTIONS.ANNOUNCEMENTS)

    const now = new Date()

    // Get active announcements for users
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

    return NextResponse.json({
      success: true,
      data: announcements,
    })
  } catch (error) {
    console.error("Public announcements fetch error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch announcements",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
