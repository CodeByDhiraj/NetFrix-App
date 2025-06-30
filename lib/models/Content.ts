import type { ObjectId } from "mongodb"

export interface Content {
  _id?: ObjectId
  title: string
  slug: string
  description: string
    categories: string[]  

  /** Cloudinary secure URL for card thumbnail (4∶3 or 3∶4) */
  thumbnail: string
  /** Optional 16∶9 hero image stored in Cloudinary */
  backdrop?: string
  /** Optional YouTube trailer embed or Cloudinary video */
  trailer?: string

  genre: string[]
  rating: string          // TV-MA, PG-13, etc.
  year: number
  duration: number        // in minutes
  type: "movie" | "series"
  status: "draft" | "published" | "archived"

  /* ──────────────── Series specific ─────────────── */
  seasons?: Array<{
    number: number
    title: string
    episodes: Array<{
      number: number
      title: string
      description: string
      duration: number
      /** NEW – direct Cloudflare R2 .m3u8 playlist */
      hlsUrl: string
      thumbnail?: string
      subtitles?: { language: string; url: string }[];
    }>
  }>

  /* ──────────────── Movie specific ─────────────── */
  /** NEW – direct Cloudflare R2 .m3u8 playlist */
  hlsUrl?: string

  /* ──────────────── Metadata ─────────────── */
  cast: string[]
  director: string[]
  producer: string[]
  languages: string[]
  subtitles: Array<{
    language: string
    url: string
  }>

  /* ──────────────── Analytics ─────────────── */
  views: number
  likes: number
  dislikes: number
  avgRating: number
  totalRatings: number

  /* ──────────────── SEO flags ─────────────── */
  keywords: string[]
  featured: boolean
  trending: boolean

  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

export interface ViewRecord {
  _id?: ObjectId
  userId: ObjectId
  contentId: ObjectId
  sessionId: string
  startTime: Date
  endTime?: Date
  duration: number         // seconds watched
  progress: number         // percentage
  quality: string
  device: string
  location?: {
    country: string
    city: string
    ip: string
  }
  completed: boolean
}
