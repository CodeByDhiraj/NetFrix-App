import { type NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import { getOrCreateVisitor } from '@/lib/auth/auth'  // ↖️ helper that throws 401 if user not logged‑in

// Define the WatchProgress type if not already imported
type WatchProgress = {
  userId: ObjectId;
  contentId: ObjectId;
  time: number;
};



export async function GET (
  req: NextRequest,
  { params }: { params: { contentId: string } },
) {
  try {
    /* 1️⃣  Auth check  */
  const user = getOrCreateVisitor();            // returns { _id, email, … }

    /* 2️⃣  Validate param */
    if (!ObjectId.isValid(params.contentId)) {
      return NextResponse.json({ error: 'Invalid contentId' }, { status: 400 })
    }

    /* 3️⃣  Query Mongo  */
    const db  = await getDatabase()
    const doc = await db
      .collection(COLLECTIONS.PROGRESS)
      .findOne<WatchProgress>({
        userId: new ObjectId(user._id),
        contentId: new ObjectId(params.contentId),
      })

    return NextResponse.json({ success: true, time: doc?.time ?? 0 })
  } catch (err) {
    console.error('GET /progress error', err)
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}