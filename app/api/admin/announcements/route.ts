import { type NextRequest, NextResponse } from "next/server"
import { getDatabase, COLLECTIONS } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const announcementsCollection = db.collection(COLLECTIONS.ANNOUNCEMENTS)

    const announcements = await announcementsCollection.find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      success: true,
      data: announcements,
    })
  } catch (error) {
    console.error("Announcements fetch error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch announcements",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, message, type, priority, targetAudience, startDate, endDate } = body

    if (!title || !message) {
      return NextResponse.json(
        {
          error: "Title and message are required",
        },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const announcementsCollection = db.collection(COLLECTIONS.ANNOUNCEMENTS)

    const announcementData = {
      title: title.trim(),
      message: message.trim(),
      type: type || "info",
      priority: priority || "medium",
      targetAudience: targetAudience || "all",
      isActive: true,
      startDate: new Date(startDate || Date.now()),
      endDate: endDate ? new Date(endDate) : undefined,
      createdBy: new ObjectId(), // In real app, get from auth
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await announcementsCollection.insertOne(announcementData)

    return NextResponse.json({
      success: true,
      message: "Announcement created successfully",
      data: { ...announcementData, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Announcement creation error:", error)
    return NextResponse.json(
      {
        error: "Failed to create announcement",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
