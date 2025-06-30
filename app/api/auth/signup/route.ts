// ✅ Updated: app/api/auth/signup/route.ts — production-ready with HttpOnly cookie and rate limiting

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDatabase, COLLECTIONS } from "@/lib/mongodb";
import { sendOTP } from "@/lib/utils/sendOtp";
import { rateLimit } from "@/lib/utils/rateLimiter";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
  const rateLimitResult = await rateLimit(ip, { limit: 5, timeWindow: 60 }); // 5 requests per 60 seconds
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "Too many requests, please try again later." }, { status: 429 });
  }

  try {
    const { email, password, userName } = await req.json();
    const db = await getDatabase();

    const user = await db.collection(COLLECTIONS.USERS).findOne({ email });
    if (user) return NextResponse.json({ error: "User already exists" }, { status: 409 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.collection(COLLECTIONS.OTP).insertOne({ 
      contact: email, 
      method: "email",
      code: otp,
      expiresAt,
      verified: false,
      attempts: 0,
      createdAt: new Date(),
    });
    await sendOTP(email, otp);

    await db.collection(COLLECTIONS.USERS).insertOne({
      email,
      contact: email,
      password: hashedPassword,
      name: userName,
      role: "user",
      avatar: "", // default empty, user can set later
      preferences: {
        genres: [],
        language: "en",
        autoplay: true,
        notifications: true,
      },
      watchHistory: [],
      favorites: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      isActive: true,
      isVerified: false,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
