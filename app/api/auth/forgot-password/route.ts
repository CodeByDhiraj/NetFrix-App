// ✅ File: app/api/auth/forgot-password/route.ts

import { NextResponse } from "next/server";
import { UserService } from "@/lib/services/userService";
import { sendOTP } from "@/lib/utils/sendOtp";
import { rateLimit } from "@/lib/utils/rateLimiter"; // ✅ Rate limit utility

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = rateLimit(ip, { limit: 5, timeWindow: 60 * 1000 }); // 5 requests per 60s

    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await UserService.findUserByContact(email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const otp = await UserService.createOTP(email, "email");
    await sendOTP(email, otp);

    return NextResponse.json({
      success: true,
      message: `Password reset OTP sent to ${email}`,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({
      error: "Internal server error",
    }, { status: 500 });
  }
}
