import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email?: string
  phone?: string
  password: string;
  name?: string
  role: "user" | "admin"
  avatar?: string
  preferences: {
    genres: string[]
    language: string
    autoplay: boolean
    notifications: boolean
  }
  watchHistory: Array<{
    contentId: ObjectId
    watchedAt: Date
    progress: number // percentage watched
    completed: boolean
  }>
  favorites: ObjectId[]
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  isActive: boolean
}

export interface OTPCode {
  _id?: ObjectId
  contact: string // email or phone
  method: "email" | "phone"
  code: string
  expiresAt: Date
  verified: boolean
  attempts: number
  createdAt: Date
}
