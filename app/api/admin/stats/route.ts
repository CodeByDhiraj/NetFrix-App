import { type NextRequest, NextResponse } from "next/server"
import { getDatabase, COLLECTIONS } from "@/lib/mongodb"

export const dynamic   = "force-dynamic";
export const revalidate = 0;


export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()

    const [
      totalUsers,
      totalContent,
      totalViews,
      activeUsers
    ] = await Promise.all([
      db.collection(COLLECTIONS.USERS)   .countDocuments({ isActive: true }),
      db.collection(COLLECTIONS.CONTENT) .countDocuments({ status: "published" }),
      db.collection(COLLECTIONS.VIEWS)   .countDocuments(),
      db.collection(COLLECTIONS.USERS)   .countDocuments({
        lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
    ])

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: { totalUsers, totalContent, totalViews, activeUsers },
      }),
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },  
      }
    )
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    )
  }
}
