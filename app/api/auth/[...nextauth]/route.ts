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
        console.log("Authorize function called with credentials:", credentials);
        
        // Check if credentials are provided
        if (!credentials || !credentials.username || !credentials.password) {
          console.log("Missing credentials");
          return null;
        }
        
        try {
          // Find user by username
          console.log(`Looking for user with username: ${credentials.username}`);
          
          // Debug: Check all users in the database
          const allUsers = await db.select().from(users);
          console.log("All users in database:", allUsers.map(u => ({ id: u.id, username: u.username })));
          
          // Query for the user
          const userResults = await db.select()
            .from(users)
            .where(eq(users.username, credentials.username));
          
          if (!userResults || userResults.length === 0) {
            console.log(`User not found with username: ${credentials.username}`);
            // Try case-insensitive search as a fallback
            const allUsersLower = allUsers.find(u => 
              u.username.toLowerCase() === credentials.username.toLowerCase()
            );
            if (allUsersLower) {
              console.log(`Found user with case-insensitive match: ${allUsersLower.username}`);
              // Use the correctly cased username
              const userResultsCase = await db.select()
                .from(users)
                .where(eq(users.username, allUsersLower.username));
              if (userResultsCase.length > 0) {
                console.log(`Successfully retrieved user with correct case: ${allUsersLower.username}`);
                const user = userResultsCase[0];
                // Check password
                const passwordMatch = await bcrypt.compare(credentials.password, user.password);
                if (passwordMatch) {
                  console.log("Password match successful for case-insensitive match");
                  return {
                    id: user.id.toString(),
                    name: user.displayName || user.username,
                    email: user.email,
                    image: user.avatarUrl,
                    role: user.role
                  };
                }
              }
            }
            return null;
          }
          
          const user = userResults[0];
          console.log(`Found user: ${user.username}, comparing passwords...`);
          
          // Check if password matches
          const passwordMatch = await bcrypt.compare(credentials.password, user.password);
          
          if (passwordMatch) {
            console.log("Password match successful");
            // Return user without password
            return {
              id: user.id.toString(),
              name: user.displayName || user.username,
              email: user.email,
              image: user.avatarUrl,
              role: user.role
            };
          }
          
          console.log("Password does not match");
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