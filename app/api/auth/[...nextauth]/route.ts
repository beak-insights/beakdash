import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    // Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    
    // GitHub OAuth provider
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    
    // Credentials provider for email/password login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // In a real app, validate credentials against your database
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        
        // For development/testing, we can return a mock user
        // Replace this with actual database lookup in production
        if (credentials.email === "user@example.com" && credentials.password === "password") {
          return {
            id: "1",
            email: "user@example.com",
            name: "Demo User",
          };
        }
        
        return null;
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
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  
  // Enable JWT sessions by default (can switch to database sessions with an adapter)
  session: {
    strategy: "jwt",
  },
  
  // Debug in development
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };