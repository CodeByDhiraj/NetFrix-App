// lib/models/progress.ts
import { ObjectId } from 'mongodb';

export interface WatchProgress {
    _id?: ObjectId
    userId: ObjectId
    contentId: ObjectId
    time: number           // seconds
    createdAt?: Date
    updatedAt: Date
}
