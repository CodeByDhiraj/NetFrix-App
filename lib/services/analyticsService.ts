import { ObjectId } from "mongodb"
import { getDatabase, COLLECTIONS } from "@/lib/mongodb"

export interface AnalyticsData {
  totalUsers: number
  activeUsers: number
  totalContent: number
  totalViews: number
  avgWatchTime: number
  topGenres: Array<{ genre: string; count: number }>
  topContent: Array<{ title: string; views: number }>
  userGrowth: Array<{ date: string; users: number }>
  viewsGrowth: Array<{ date: string; views: number }>
}

export class AnalyticsService {
  static async getDashboardStats(): Promise<AnalyticsData> {
    const db = await getDatabase()

    const [totalUsers, activeUsers, totalContent, totalViews, topGenres, topContent, userGrowth, viewsGrowth] =
      await Promise.all([
        // Total users
        db
          .collection(COLLECTIONS.USERS)
          .countDocuments({ isActive: true }),

        // Active users (logged in last 30 days)
        db
          .collection(COLLECTIONS.USERS)
          .countDocuments({
            lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          }),

        // Total content
        db
          .collection(COLLECTIONS.CONTENT)
          .countDocuments({ status: "published" }),

        // Total views
        db
          .collection(COLLECTIONS.VIEWS)
          .countDocuments(),

        // Top genres
        db
          .collection(COLLECTIONS.CONTENT)
          .aggregate([
            { $match: { status: "published" } },
            { $unwind: "$genre" },
            { $group: { _id: "$genre", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $project: { genre: "$_id", count: 1, _id: 0 } },
          ])
          .toArray(),

        // Top content by views
        db
          .collection(COLLECTIONS.CONTENT)
          .aggregate([
            { $match: { status: "published" } },
            { $sort: { views: -1 } },
            { $limit: 10 },
            { $project: { title: 1, views: 1, _id: 0 } },
          ])
          .toArray(),

        // User growth (last 30 days)
        db
          .collection(COLLECTIONS.USERS)
          .aggregate([
            {
              $match: {
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
              },
            },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                users: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
            { $project: { date: "$_id", users: 1, _id: 0 } },
          ])
          .toArray(),

        // Views growth (last 30 days)
        db
          .collection(COLLECTIONS.VIEWS)
          .aggregate([
            {
              $match: {
                startTime: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
              },
            },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
                views: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
            { $project: { date: "$_id", views: 1, _id: 0 } },
          ])
          .toArray(),
      ])

    // Calculate average watch time
    const avgWatchTimeResult = await db
      .collection(COLLECTIONS.VIEWS)
      .aggregate([{ $group: { _id: null, avgDuration: { $avg: "$duration" } } }])
      .toArray()

    const avgWatchTime = avgWatchTimeResult[0]?.avgDuration || 0

    return {
      totalUsers,
      activeUsers,
      totalContent,
      totalViews,
      avgWatchTime: Math.round(avgWatchTime / 60), // Convert to minutes
      topGenres: topGenres as Array<{ genre: string; count: number }>,
      topContent: topContent as Array<{ title: string; views: number }>,
      userGrowth: userGrowth as Array<{ date: string; users: number }>,
      viewsGrowth: viewsGrowth as Array<{ date: string; views: number }>,
    }
  }

  static async getContentAnalytics(contentId: string) {
    const db = await getDatabase()

    const [viewStats, demographics, watchTime] = await Promise.all([
      // View statistics
      db
        .collection(COLLECTIONS.VIEWS)
        .aggregate([
          { $match: { contentId: new ObjectId(contentId) } },
          {
            $group: {
              _id: null,
              totalViews: { $sum: 1 },
              uniqueViewers: { $addToSet: "$userId" },
              avgWatchTime: { $avg: "$duration" },
              completionRate: {
                $avg: { $cond: [{ $eq: ["$completed", true] }, 1, 0] },
              },
            },
          },
        ])
        .toArray(),

      // Demographics
      db
        .collection(COLLECTIONS.VIEWS)
        .aggregate([
          { $match: { contentId: new ObjectId(contentId) } },
          {
            $group: {
              _id: "$location.country",
              views: { $sum: 1 },
            },
          },
          { $sort: { views: -1 } },
          { $limit: 10 },
        ])
        .toArray(),

      // Watch time distribution
      db
        .collection(COLLECTIONS.VIEWS)
        .aggregate([
          { $match: { contentId: new ObjectId(contentId) } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
              views: { $sum: 1 },
              totalWatchTime: { $sum: "$duration" },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray(),
    ])

    return {
      viewStats: viewStats[0] || {},
      demographics,
      watchTime,
    }
  }
}
