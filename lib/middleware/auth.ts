import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

interface JWTPayload {
  userId: string
  email?: string
  role: string
}

export function getAuthUser(request: NextRequest): JWTPayload | null {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return null
    }

    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload
    return payload
  } catch (error) {
    return null
  }
}

export function requireAuth(request: NextRequest): JWTPayload {
  const user = getAuthUser(request)

  if (!user) {
    throw new Error("Authentication required")
  }

  return user
}

export function requireAdmin(request: NextRequest): JWTPayload {
  const user = requireAuth(request)

  if (user.role !== "admin") {
    throw new Error("Admin access required")
  }

  return user
}
