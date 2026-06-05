import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Ensure NEXTAUTH_URL is always a valid URL at build time.
// VERCEL_URL is injected by Vercel at runtime; during CI builds it may be absent,
// so fall back to localhost to prevent new URL('') from crashing static generation.
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const adminPassword = process.env.ADMIN_PASSWORD || "pac-admin-2026";

        if (credentials?.password === adminPassword) {
          return { id: "1", name: "Admin", email: "admin@kanakapac.com" };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin",
    error: "/admin",
  },
  callbacks: {
    async session({ session, token }) {
      return session;
    },
    async jwt({ token, user }) {
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
