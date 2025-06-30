import { type NextRequest, NextResponse } from 'next/server'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase()
    const contentCollection = db.collection(COLLECTIONS.CONTENT)

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid content ID' }, { status: 400 })
    }

    const content = await contentCollection.findOne({ _id: new ObjectId(params.id) })

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: content })
  } catch (error) {
    console.error('Public content fetch error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
