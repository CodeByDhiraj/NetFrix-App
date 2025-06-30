import { type NextRequest, NextResponse } from "next/server"
import { getDatabase, COLLECTIONS } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()

    // Get real-time statistics from database
    const [totalUsers, totalContent, totalViews, activeUsers] = await Promise.all([
      // Total users count
      db
        .collection(COLLECTIONS.USERS)
        .countDocuments({ isActive: true }),

      // Total published content count
      db
        .collection(COLLECTIONS.CONTENT)
        .countDocuments({ status: "published" }),

      // Total views from views collection
      db
        .collection(COLLECTIONS.VIEWS)
        .countDocuments(),

      // Active users (logged in last 30 days)
      db
        .collection(COLLECTIONS.USERS)
        .countDocuments({
          lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalContent,
        totalViews,
        activeUsers,
      },
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
