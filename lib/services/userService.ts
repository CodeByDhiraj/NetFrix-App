import type { ObjectId } from "mongodb";
import { getDatabase, COLLECTIONS } from "@/lib/mongodb";
import type { User, OTPCode } from "@/lib/models/User";
import { sendOTP } from "@/lib/utils/sendOtp"; // Make sure this is implemented correctly
import Email from "next-auth/providers/email";

export class UserService {
  static async createUser(userData: Partial<User>): Promise<User> {
    const db = await getDatabase();
    const users = db.collection<User>(COLLECTIONS.USERS);

    const newUser: User = {
      ...userData,
      role: userData.role || "user",
      preferences: {
        genres: [],
        language: "en",
        autoplay: true,
        notifications: true,
        ...userData.preferences,
      },
      watchHistory: [],
      favorites: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    } as User;

    const result = await users.insertOne(newUser);
    return { ...newUser, _id: result.insertedId };
  }

  static async createOTP(contact: string, method: "email" | "phone"): Promise<string> {
    try {
      const db = await getDatabase();
      const otpCollection = db.collection<OTPCode>(COLLECTIONS.OTP);

      // Generate 6-digit OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Remove old OTPs for this contact
      await otpCollection.deleteMany({ contact });

      const otpData: OTPCode = {
        contact,
        method,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min expiry
        verified: false,
        attempts: 0,
        createdAt: new Date(),
      };

      await otpCollection.insertOne(otpData);

      // ✅ Send real OTP (not log or dummy)
      await sendOTP(contact, code);

      return code;
    } catch (error) {
      console.error("Error creating OTP:", error);
      throw new Error("Failed to generate OTP");
    }
  }

  static async verifyOTP(contact: string, code: string): Promise<boolean> {
    const db = await getDatabase();
    const otpCollection = db.collection<OTPCode>(COLLECTIONS.OTP);

    const otpRecord = await otpCollection.findOne({
     contact,
      code,
      verified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) return false;

    // Mark as verified
    await otpCollection.updateOne(
      { _id: otpRecord._id },
      { $set: { verified: true } }
    );

    return true;
  }

  static async findUserByContact(contact: string): Promise<User | null> {
    try {
      const db = await getDatabase();
      const users = db.collection<User>(COLLECTIONS.USERS);

      return await users.findOne({
        $or: [{ email: contact }, { phone: contact }],
      });
    } catch (error) {
      console.error("Error finding user:", error);
      return null;
    }
  }

  static async updateUser(userId: ObjectId, updates: Partial<User>): Promise<void> {
    const db = await getDatabase();
    const users = db.collection<User>(COLLECTIONS.USERS);

    await users.updateOne(
      { _id: userId },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      }
    );
  }

  static async addToWatchHistory(userId: ObjectId, contentId: ObjectId, progress: number): Promise<void> {
    const db = await getDatabase();
    const users = db.collection<User>(COLLECTIONS.USERS);

    await users.updateOne({ _id: userId }, { $pull: { watchHistory: { contentId } } });

    await users.updateOne(
      { _id: userId },
      {
        $push: {
          watchHistory: {
            $each: [
              {
                contentId,
                watchedAt: new Date(),
                progress,
                completed: progress >= 90,
              },
            ],
            $position: 0,
            $slice: 50,
          },
        },
        $set: { updatedAt: new Date() },
      }
    );
  }

  static async toggleFavorite(userId: ObjectId, contentId: ObjectId): Promise<boolean> {
    const db = await getDatabase();
    const users = db.collection<User>(COLLECTIONS.USERS);

    const user = await users.findOne({ _id: userId });
    if (!user) throw new Error("User not found");

    const isFavorite = user.favorites.some((id) => id.equals(contentId));

    if (isFavorite) {
      await users.updateOne({ _id: userId }, { $pull: { favorites: contentId } });
      return false;
    } else {
      await users.updateOne({ _id: userId }, { $push: { favorites: contentId } });
      return true;
    }
  }
}
