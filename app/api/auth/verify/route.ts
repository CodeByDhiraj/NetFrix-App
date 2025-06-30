// ✅ Updated: app/api/auth/verify/route.ts (Production Ready)

import { NextResponse } from "next/server";
import { getDatabase, COLLECTIONS } from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/utils/rateLimiter"; import { Result } from "postcss";
; // ✅ rate limit

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = 7 * 24 * 60 * 60; // 7 days in seconds

export async function POST(req: Request) {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = await rateLimit(ip, { limit: 5, timeWindow: 60 }); // Add options if required, e.g. rateLimit(ip, { windowMs: 60000, max: 5 })
    if (!rateLimitResult.success) {
        return NextResponse.json({ error: "Too many requests, please try again later." }, { status: 429 });
    }

    try {
        const { email, otp } = await req.json();
        const otpStr = String(otp);
        const db = await getDatabase();

        const record = await db.collection(COLLECTIONS.OTP).findOne({
            contact: email,
            code: otpStr,
            expiresAt: { $gt: new Date() },
        });

        if (!record || record.expiresAt < new Date()) {
            return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
        }

        // ✅ Mark user as verified
        console.log("✅ OTP matched. Now updating user...");
        await db.collection(COLLECTIONS.USERS).updateOne(
            { contact: email },
            { $set: { isVerified: true } }
        );

        // ✅ Also update OTP record to mark it as verified
        await db.collection(COLLECTIONS.OTP).updateOne(
            { contact: email, code: otpStr },
            { $set: { verified: true } }
        );
        console.log("✅ User verified successfully, fetching user info...");

        // ✅ Fetch user info
        const user = await db.collection(COLLECTIONS.USERS).findOne({
            $or: [{ email }, { contact: email }]
        });
        if (!user) {
            return NextResponse.json({ error: "User not found after verification" }, { status: 404 });
        }

        // ✅ Sign JWT
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // ✅ Set HttpOnly cookie
        cookies().set("auth-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: JWT_EXPIRES_IN,
        });

        // ✅ Clean up OTP
        // await db.collection(COLLECTIONS.OTP).deleteOne({ contact: email, code: otpStr });
        console.log("✅ OTP verified and token set, responding to client...");
        return NextResponse.json({ success: true, role: user.role });
    } catch (error) {
        console.error("OTP Verify Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
