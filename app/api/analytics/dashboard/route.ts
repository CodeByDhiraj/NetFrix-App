import { type NextRequest, NextResponse } from "next/server"
import { AnalyticsService } from "@/lib/services/analyticsService"

export async function GET(request: NextRequest) {
  try {
    const analytics = await AnalyticsService.getDashboardStats()

    return NextResponse.json({
      success: true,
      data: analytics,
    })
  } catch (error) {
    console.error("Analytics dashboard error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}
