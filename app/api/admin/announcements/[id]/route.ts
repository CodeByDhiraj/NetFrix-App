import { type NextRequest, NextResponse } from "next/server"
import { getDatabase, COLLECTIONS } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { title, message, type, priority, targetAudience, isActive, startDate, endDate } = body

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid announcement ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const announcementsCollection = db.collection(COLLECTIONS.ANNOUNCEMENTS)

    const updates = {
      title: title.trim(),
      message: message.trim(),
      type,
      priority,
      targetAudience,
      isActive,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      updatedAt: new Date(),
    }

    const result = await announcementsCollection.updateOne({ _id: new ObjectId(params.id) }, { $set: updates })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Announcement updated successfully",
    })
  } catch (error) {
    console.error("Announcement update error:", error)
    return NextResponse.json(
      {
        error: "Failed to update announcement",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid announcement ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const announcementsCollection = db.collection(COLLECTIONS.ANNOUNCEMENTS)

    const result = await announcementsCollection.deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Announcement deleted successfully",
    })
  } catch (error) {
    console.error("Announcement delete error:", error)
    return NextResponse.json(
      {
        error: "Failed to delete announcement",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
