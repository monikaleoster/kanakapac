import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
  secret: "kanaka-pac-secret-key-change-me",
};
