import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Define the Auth Options
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
        // Handle both username and email credentials
        const usernameOrEmail = credentials?.username || credentials?.email;
        const password = credentials?.password;
        
        // Check if credentials are provided
        if (!credentials || !usernameOrEmail || !password) {
          return null;
        }
        
        try {
          // Find user by username or email
          let userResults = await db.select()
            .from(users)
            .where(eq(users.username, usernameOrEmail));
          
          // If not found by username, try by email
          if (!userResults || userResults.length === 0) {
            userResults = await db.select()
              .from(users)
              .where(eq(users.email, usernameOrEmail));
          }
          
          // If still not found, try case-insensitive search
          if (!userResults || userResults.length === 0) {
            const allUsers = await db.select().from(users);
            
            // Try case-insensitive username match
            const usernameMatch = allUsers.find(u => 
              u.username.toLowerCase() === usernameOrEmail.toLowerCase()
            );
            
            if (usernameMatch) {
              userResults = [usernameMatch];
            } else {
              // Try case-insensitive email match
              const emailMatch = allUsers.find(u => 
                u.email && u.email.toLowerCase() === usernameOrEmail.toLowerCase()
              );
              
              if (emailMatch) {
                userResults = [emailMatch];
              } else {
                return null;
              }
            }
          }
          
          const user = userResults[0];
          
          let passwordMatch = false;
          
          try {
            // First try with bcrypt (for hashed passwords)
            passwordMatch = await bcrypt.compare(password, user.password);
          } catch (error) {
            // If bcrypt fails (might be plaintext password), try direct comparison
            passwordMatch = password === user.password;
            
            // If it matched with direct comparison, we should update to bcrypt
            if (passwordMatch) {
              const hashedPassword = await bcrypt.hash(password, 10);
              await db.update(users)
                .set({ password: hashedPassword })
                .where(eq(users.id, user.id));
            }
          }
          
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