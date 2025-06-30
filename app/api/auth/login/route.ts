// ✅ Fixed: app/api/auth/login/route.ts with correct OTP schema

import { NextResponse } from "next/server";
import { getDatabase, COLLECTIONS } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { sendOTP } from "@/lib/utils/sendOtp";
import { rateLimit } from "@/lib/utils/rateLimiter";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const limitCheck = rateLimit(ip, { limit: 5, timeWindow: 60 * 1000 }); // 5 per minute

  if (!limitCheck.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const { email, password } = await req.json();
    const db = await getDatabase();

    const user = await db.collection(COLLECTIONS.USERS).findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "Email not found. Please sign up first." },
        { status: 404 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "This email is registered via Google. Please use Google Sign-In." },
        { status: 403 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Please enter your password." },
        { status: 400 }
      );
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    // ✅ Update lastLoginAt timestamp
    await db.collection(COLLECTIONS.USERS).updateOne(
      { email },
      { $set: { lastLoginAt: new Date() } }
    );


    // ✅ Generate OTP and store with correct schema
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.collection(COLLECTIONS.OTP).insertOne({
      contact: email,     // ✅ Must match "verify" logic
      code: otp,          // ✅ Must match "verify" logic
      verified: false,
      expiresAt
    });

    await sendOTP(email, otp);

    return NextResponse.json({ success: true, requireOtp: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
