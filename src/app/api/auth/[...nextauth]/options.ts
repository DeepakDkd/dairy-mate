import { PrismaAdapter } from "@next-auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        mobile: { label: "Mobile Number", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.mobile || !credentials?.password) {
          throw new Error("Please provide both mobile and password");
        }

        const user = await prisma.user.findUnique({
          where: { mobile: credentials.mobile },
        });

        if (!user) throw new Error("No user found with this mobile number");

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

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
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/auth/login" },

  callbacks: {
    async jwt({ token, user }:any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.mobile = user.mobile;
        token.customerType = user.customerType;
      }
      return token;
    },
    async session({ session, token }:any) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.mobile = token.mobile;
        session.user.customerType = token.customerType;
      }
      return session;
    },
  },
};
