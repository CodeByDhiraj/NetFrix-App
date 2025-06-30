// File: types/next-auth.d.ts
import NextAuth from "next-auth";

// Extend built-in session and user types

declare module "next-auth" {
  interface Session {
    user: {
      _id: any;
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      userName?: string;
      profilePic?: string;
      role?: "user" | "admin";
    };
  }

  interface User {
    id: string;
    role: "user" | "admin";
    userName?: string;
    profilePic?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "user" | "admin";
    userName?: string;
    profilePic?: string;
  }
}
