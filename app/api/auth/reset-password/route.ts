import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDatabase, COLLECTIONS } from "@/lib/mongodb";
import type { OTPCode } from "@/lib/models/User";
import { UserService } from "@/lib/services/userService";
import { rateLimit } from "@/lib/utils/rateLimiter";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const limit = rateLimit(ip, { limit: 5, timeWindow: 10 * 60 * 1000 });
  if (!limit.success) {
    return NextResponse.json({ error: "Too many attempts. Try later." }, { status: 429 });
  }

  try {
    const body = await req.json(); // ✅ Only once
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const db = await getDatabase();
    const otpCollection = db.collection<OTPCode>(COLLECTIONS.OTP);

    const otpRecord = await otpCollection.findOne({
      contact: email,
      code: otp,
      verified: true,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: "OTP not verified or expired" }, { status: 400 });
    }

    const user = await UserService.findUserByContact(email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await UserService.updateUser(user._id!, { password: hashed });

    // ✅ Delete OTP now
    await otpCollection.deleteOne({ contact: email, code: otp });

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });

  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
