// lib/auth.ts
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'

/**
 *  Login-optional helper.
 *  - Agar user already login hai (next-auth use kar rahe ho) to uska id use kar lo
 *  - Nahi to ek anonymous UUID cookie bana do
 */
export function getOrCreateVisitor() {
  // Check if cookie already present
  const store = cookies()
  const saved = store.get('nfx-uid')?.value
  if (saved) return { _id: saved }           // anonymous visitor already tracked

  // First visit → create new UUID, set cookie 1 saal ke liye
  const uid = randomUUID()
  store.set({
    name: 'nfx-uid',
    value: uid,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,              // 1 year
  })
  return { _id: uid }
}
