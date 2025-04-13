import NextAuth from "next-auth";
import { Session, User as NextAuthUser } from "next-auth";
import { runMigrations } from "@/lib/db/migrations";
import { authOptions } from "@/lib/auth";

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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };