import { ObjectId } from "mongodb"
import { getDatabase, COLLECTIONS } from "@/lib/mongodb"
import type { Content, ViewRecord } from "@/lib/models/Content"

export class ContentService {
  static async createContent(contentData: Partial<Content>): Promise<Content> {
    const db = await getDatabase()
    const content = db.collection<Content>(COLLECTIONS.CONTENT)

    const newContent: Content = {
      ...contentData,
      slug: contentData.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "",
      views: 0,
      likes: 0,
      dislikes: 0,
      avgRating: 0,
      totalRatings: 0,
      featured: false,
      trending: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Content

    const result = await content.insertOne(newContent)
    return { ...newContent, _id: result.insertedId }
  }

  static async getContent(
    filters: {
      page?: number
      limit?: number
      genre?: string
      type?: string
      search?: string
      featured?: boolean
      trending?: boolean
      status?: string
    } = {},
  ): Promise<{ content: Content[]; total: number }> {
    const db = await getDatabase()
    const contentCollection = db.collection<Content>(COLLECTIONS.CONTENT)

    const { page = 1, limit = 20, genre, type, search, featured, trending, status = "published" } = filters

    // Build query
    const query: any = { status }

    if (genre) {
      query.genre = { $in: [new RegExp(genre, "i")] }
    }

    if (type) {
      query.type = type
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { keywords: { $in: [new RegExp(search, "i")] } },
      ]
    }

    if (featured !== undefined) {
      query.featured = featured
    }

    if (trending !== undefined) {
      query.trending = trending
    }

    const skip = (page - 1) * limit

    const [content, total] = await Promise.all([
      contentCollection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      contentCollection.countDocuments(query),
    ])

    return { content, total }
  }

  static async getContentById(id: string): Promise<Content | null> {
    const db = await getDatabase()
    const content = db.collection<Content>(COLLECTIONS.CONTENT)

    return await content.findOne({ _id: new ObjectId(id) })
  }

  static async getContentBySlug(slug: string): Promise<Content | null> {
    const db = await getDatabase()
    const content = db.collection<Content>(COLLECTIONS.CONTENT)

    return await content.findOne({ slug, status: "published" })
  }

  static async updateContent(id: string, updates: Partial<Content>): Promise<void> {
    const db = await getDatabase()
    const content = db.collection<Content>(COLLECTIONS.CONTENT)

    await content.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    )
  }

  static async deleteContent(id: string): Promise<void> {
    const db = await getDatabase()
    const content = db.collection<Content>(COLLECTIONS.CONTENT)

    await content.updateOne({ _id: new ObjectId(id) }, { $set: { status: "archived", updatedAt: new Date() } })
  }

  static async recordView(viewData: Partial<ViewRecord>): Promise<void> {
    const db = await getDatabase()
    const views = db.collection<ViewRecord>(COLLECTIONS.VIEWS)
    const content = db.collection<Content>(COLLECTIONS.CONTENT)

    // Record the view
    const newView: ViewRecord = {
      ...viewData,
      startTime: new Date(),
    } as ViewRecord

    await views.insertOne(newView)

    // Update content view count
    await content.updateOne({ _id: viewData.contentId }, { $inc: { views: 1 } })
  }

  static async getRecommendations(userId: ObjectId, limit = 10): Promise<Content[]> {
    const db = await getDatabase()
    const users = db.collection(COLLECTIONS.USERS)
    const content = db.collection<Content>(COLLECTIONS.CONTENT)

    // Get user's watch history and preferences
    const user = await users.findOne({ _id: userId })
    if (!user) return []

    const watchedGenres = user.watchHistory?.map((item: any) => item.contentId).slice(0, 10) || []

    // Get content from similar genres
    const recommendations = await content
      .find({
        status: "published",
        _id: { $nin: watchedGenres },
        $or: [{ genre: { $in: user.preferences?.genres || [] } }, { trending: true }, { featured: true }],
      })
      .sort({ views: -1, avgRating: -1 })
      .limit(limit)
      .toArray()

    return recommendations
  }

  static async getTrendingContent(limit = 10): Promise<Content[]> {
    const db = await getDatabase()
    const content = db.collection<Content>(COLLECTIONS.CONTENT)

    // Get content with high views in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    return await content
      .find({
        status: "published",
        createdAt: { $gte: sevenDaysAgo },
      })
      .sort({ views: -1, avgRating: -1 })
      .limit(limit)
      .toArray()
  }
}
