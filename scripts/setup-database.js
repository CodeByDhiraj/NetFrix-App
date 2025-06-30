require("dotenv").config({ path: ".env.local" })
const { MongoClient } = require("mongodb")

async function setupDatabase() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.error("❌ MONGODB_URI not found in .env.local file")
    console.log("Please check your .env.local file exists and has MONGODB_URI")
    return
  }

  console.log("🔗 Connecting to MongoDB Atlas...")
  console.log("Using URI:", uri.substring(0, 30) + "...")

  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB Atlas!")

    const db = client.db("netfrix")

    // Create collections with indexes
    console.log("📚 Creating collections and indexes...")

    // Users collection
    const users = db.collection("users")
    await users.createIndex({ email: 1 }, { unique: true, sparse: true })
    await users.createIndex({ phone: 1 }, { unique: true, sparse: true })
    await users.createIndex({ createdAt: 1 })
    await users.createIndex({ lastLoginAt: 1 })

    // Content collection
    const content = db.collection("content")
    await content.createIndex({ slug: 1 }, { unique: true })
    await content.createIndex({ status: 1 })
    await content.createIndex({ genre: 1 })
    await content.createIndex({ type: 1 })
    await content.createIndex({ featured: 1 })
    await content.createIndex({ trending: 1 })
    await content.createIndex({ views: -1 })
    await content.createIndex({ createdAt: -1 })

    // Create text index without language override to avoid the error
    try {
      await content.createIndex(
        {
          title: "text",
          description: "text",
          keywords: "text",
        },
        {
          name: "content_text_search",
        },
      )
      console.log("✅ Text search index created")
    } catch (indexError) {
      console.log("⚠️  Text index already exists or failed to create")
    }

    // Views collection
    const views = db.collection("views")
    await views.createIndex({ userId: 1, contentId: 1 })
    await views.createIndex({ contentId: 1 })
    await views.createIndex({ startTime: 1 })
    await views.createIndex({ sessionId: 1 })

    // OTP collection
    const otp = db.collection("otp_codes")
    await otp.createIndex({ contact: 1 })
    await otp.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })

    // Analytics collection
    const analytics = db.collection("analytics")
    await analytics.createIndex({ date: 1 })
    await analytics.createIndex({ type: 1 })

    // Announcements collection
    const announcements = db.collection("announcements")
    await announcements.createIndex({ isActive: 1 })
    await announcements.createIndex({ targetAudience: 1 })
    await announcements.createIndex({ startDate: 1 })
    await announcements.createIndex({ endDate: 1 })
    await announcements.createIndex({ priority: 1 })
    await announcements.createIndex({ createdAt: -1 })

    console.log("✅ Database setup completed!")

    // Insert sample data
    console.log("📝 Inserting sample data...")

    // Sample admin user
    const existingAdmin = await users.findOne({ email: "admin@netfrix.com" })
    if (!existingAdmin) {
      await users.insertOne({
        email: "admin@netfrix.com",
        role: "admin",
        preferences: {
          genres: [],
          language: "en",
          autoplay: true,
          notifications: true,
        },
        watchHistory: [],
        favorites: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      })
      console.log("👤 Created admin user")
    } else {
      console.log("👤 Admin user already exists")
    }

    // Sample content - only insert if collection is empty
    const existingContent = await content.countDocuments()
    if (existingContent === 0) {
      const sampleContent = [
        {
          title: "Stranger Things",
          slug: "stranger-things",
          description: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments.",
          thumbnail: "/placeholder.svg?height=300&width=200",
          genre: ["Sci-Fi", "Horror", "Drama"],
          rating: "TV-14",
          year: 2024,
          duration: 62,
          type: "series",
          status: "published",
          hlsUrl: "https://cdn.example.com/stranger-things/index.m3u8",
          cast: ["Millie Bobby Brown", "Finn Wolfhard", "David Harbour"],
          director: ["The Duffer Brothers"],
          producer: ["Shawn Levy"],
          // Changed from array to string to fix the language override error
          primaryLanguage: "English",
          availableLanguages: ["English", "Spanish", "French"],
          subtitles: [
            { language: "English", url: "/subtitles/stranger-things-en.vtt" },
            { language: "Spanish", url: "/subtitles/stranger-things-es.vtt" },
          ],
          views: 125000,
          likes: 8500,
          dislikes: 200,
          avgRating: 4.8,
          totalRatings: 5200,
          keywords: ["sci-fi", "supernatural", "netflix", "series"],
          featured: true,
          trending: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          publishedAt: new Date(),
        },
        {
          title: "The Crown",
          slug: "the-crown",
          description: "Follows the political rivalries and romance of Queen Elizabeth II's reign.",
          thumbnail: "/placeholder.svg?height=300&width=200",
          genre: ["Drama", "History"],
          rating: "TV-MA",
          year: 2024,
          duration: 65,
          type: "series",
          status: "published",
          hlsUrl: "https://cdn.example.com/stranger-things/index.m3u8",
          cast: ["Claire Foy", "Olivia Colman", "Imelda Staunton"],
          director: ["Peter Morgan"],
          producer: ["Left Bank Pictures"],
          primaryLanguage: "English",
          availableLanguages: ["English", "Spanish"],
          subtitles: [{ language: "English", url: "/subtitles/the-crown-en.vtt" }],
          views: 89000,
          likes: 6200,
          dislikes: 150,
          avgRating: 4.6,
          totalRatings: 3800,
          keywords: ["drama", "history", "royal", "british"],
          featured: false,
          trending: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          publishedAt: new Date(),
        },
        {
          title: "Breaking Bad",
          slug: "breaking-bad",
          description: "A high school chemistry teacher turned methamphetamine manufacturer.",
          thumbnail: "/placeholder.svg?height=300&width=200",
          genre: ["Crime", "Drama"],
          rating: "TV-MA",
          year: 2023,
          duration: 47,
          type: "series",
          status: "published",
          hlsUrl: "https://cdn.example.com/stranger-things/index.m3u8",
          cast: ["Bryan Cranston", "Aaron Paul", "Anna Gunn"],
          director: ["Vince Gilligan"],
          producer: ["High Bridge Entertainment"],
          primaryLanguage: "English",
          availableLanguages: ["English", "Spanish"],
          subtitles: [{ language: "English", url: "/subtitles/breaking-bad-en.vtt" }],
          views: 156000,
          likes: 12000,
          dislikes: 300,
          avgRating: 4.9,
          totalRatings: 8500,
          keywords: ["crime", "drama", "drugs", "chemistry"],
          featured: true,
          trending: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          publishedAt: new Date(),
        },
      ]

      await content.insertMany(sampleContent)
      console.log("🎬 Added sample content")
    } else {
      console.log("🎬 Content already exists")
    }

    console.log("🎉 Sample data inserted successfully!")
    console.log("👤 Admin user: admin@netfrix.com")
    console.log("🔑 Test OTP: 123456")
    console.log("🌐 Start your app: npm run dev")
  } catch (error) {
    console.error("❌ Database setup error:", error.message)
    if (error.message.includes("language override")) {
      console.log("💡 This error is related to text search indexing")
      console.log("💡 Your database is still functional for the app")
    }
  } finally {
    await client.close()
  }
}

setupDatabase()
