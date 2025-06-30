// ✅ app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getDatabase, COLLECTIONS } from "@/lib/mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET() {
  try {
    const token = cookies().get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ user: null, error: "Token missing" }, { status: 401 });
    }

    // ✅ Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ user: null, error: "Invalid or expired token" }, { status: 401 });
    }

    // ✅ Fetch user from DB
    const db = await getDatabase();
    const user = await db.collection(COLLECTIONS.USERS).findOne(
      { email: decoded.email },
      { projection: { _id: 0, name: 1, email: 1, role: 1 } } // Only safe fields
    );

    if (!user) {
      return NextResponse.json({ user: null, error: "User not found" }, { status: 400 });
    }

    return NextResponse.json({ user }); // returns { name, email, role }

  }
  catch (err) {
    return NextResponse.json({ user: null, error: "Session error" }, { status: 500 });
  }
  
}
