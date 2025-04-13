import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { Session, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { runMigrations } from "@/lib/db/migrations";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }

  interface User extends NextAuthUser {
    id: string;
    role?: string;
  }
}

// Initialize the database if needed
try {
  // This will run asynchronously - in production, 
  // you should use a proper migration strategy
  runMigrations().catch(console.error);
} catch (error) {
  console.error("Failed to run database migrations:", error);
}

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  // Configure credentials provider
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Check if credentials are provided
        if (!credentials?.username || !credentials.password) {
          return null;
        }
        
        try {
          // Find user by username
          const userResults = await db.select()
            .from(users)
            .where(eq(users.username, credentials.username));
          
          if (!userResults || userResults.length === 0) {
            return null;
          }
          
          const user = userResults[0];
          
          // Check if password matches
          const passwordMatch = await bcrypt.compare(credentials.password, user.password);
          
          if (passwordMatch) {
            // Return user without password
            return {
              id: user.id.toString(),
              name: user.displayName || user.username,
              email: user.email,
              image: user.avatarUrl,
              role: user.role
            };
          }
          
          return null;
        } catch (error) {
          console.error("Error during authentication:", error);
          return null;
        }
      }
    }),
  ],
  
  // Pages for custom sign in, sign up experiences
  pages: {
    signIn: "/auth",
    newUser: "/auth/sign-up",
  },
  
  // Callbacks to customize session and JWT behavior
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || "";
        // Add additional user properties to session if needed
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // Add user data to token
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  
  // Secret for JWT encryption
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
  
  // Enable JWT sessions by default 
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };