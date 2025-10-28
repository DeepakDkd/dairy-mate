import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        mobile: { label: "Mobile Number", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.mobile || !credentials?.password) {
          throw new Error("Please provide both mobile and password");
        }

        const user = await db.user.findUnique({
          where: { mobile: credentials.mobile },
        });

        if (!user) throw new Error("No user found with this mobile number");

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        // Return only safe user data (never send password)
        return {
          id: user.id,
          name: user.name,
          mobile: user.mobile,
          role: user.role,
          customerType: user.customerType,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
  },

  callbacks: {
    async jwt({ token, user }:any) {
      // When user logs in, attach custom fields to token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.mobile = user.mobile;
        token.customerType = user.customerType;
      }
      return token;
    },
    async session({ session, token }:any) {
      // Add those fields into session.user
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.mobile = token.mobile;
        session.user.name = token.name;
        session.user.customerType = token.customerType;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler;
