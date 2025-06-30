import type { ObjectId } from "mongodb"

export interface Announcement {
  _id?: ObjectId
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  priority: "low" | "medium" | "high"
  targetAudience: "all" | "users" | "admins"
  isActive: boolean
  startDate: Date
  endDate?: Date
  createdBy: ObjectId
  createdAt: Date
  updatedAt: Date
}
