import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getDatabase, COLLECTIONS } from "@/lib/mongodb";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt", // Use JWT to enable HttpOnly cookie
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },

  callbacks: {
    async signIn({ user }) {
      const db = await getDatabase();
      const existingUser = await db
        .collection(COLLECTIONS.USERS)
        .findOne({ email: user.email });

      if (!existingUser) {
        await db.collection(COLLECTIONS.USERS).insertOne({
          email: user.email,
          name: user.name,
          avatar: user.image,
          role: "user",
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
          lastLoginAt: new Date(),
          isActive: true,
        });
      } else {
        await db.collection(COLLECTIONS.USERS).updateOne(
          { email: user.email },
          {
            $set: {
              lastLoginAt: new Date(),
              updatedAt: new Date(),
            },
          }
        );
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user?.email) {
        const db = await getDatabase();
        const dbUser = await db
          .collection(COLLECTIONS.USERS)
          .findOne({ email: user.email });

        if (dbUser) {
          token.role = dbUser.role;
          token.userId = dbUser._id?.toString();
          token.userName = dbUser.name;
          token.profilePic = dbUser.avatar;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user._id = token.userId;
        session.user.role = token.role;
        session.user.userName = token.userName;
        session.user.profilePic = token.profilePic;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      try {
        const email = new URL(url).searchParams.get("email");
        if (!email) return baseUrl;

        const db = await getDatabase();
        const user = await db
          .collection(COLLECTIONS.USERS)
          .findOne({ email });

        if (user?.role === "admin") return `${baseUrl}/admin`;
        return `${baseUrl}/`;
      } catch (error) {
        console.error("Redirect error:", error);
        return baseUrl;
      }
    },
  },

  pages: {
    signIn: "/auth/login", // Optional: custom login page
    error: "/auth/error",   // Optional: custom error page
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };