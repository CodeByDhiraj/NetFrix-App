import { type NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import { getOrCreateVisitor } from '@/lib/auth/auth'



export async function POST (req: NextRequest) {
  try {
    const user = getOrCreateVisitor(); 
    const body   = await req.json()
    const { contentId, time } = body as { contentId?: string; time?: number }

    if (!contentId || time == null) {
      return NextResponse.json({ error: 'contentId & time required' }, { status: 400 })
    }
    if (!ObjectId.isValid(contentId)) {
      return NextResponse.json({ error: 'Invalid contentId' }, { status: 400 })
    }

    const db = await getDatabase()
    await db.collection(COLLECTIONS.PROGRESS).updateOne(
      { userId: new ObjectId(user._id), contentId: new ObjectId(contentId) },
      {
        $set: {
          time: Math.floor(time),                // seconds (int)
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('POST /progress error', err)
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}