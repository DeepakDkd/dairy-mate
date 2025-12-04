import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { db } from "@/lib/db";
import { prisma as db } from "@/lib/prisma";
import bcrypt from "bcryptjs";


export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
        dairyId: { label: "DairyId", type: "number" },
        role: { label: "Role", type: "text" },
      },
      // @ts-ignore
      async authorize(credentials) {
        if (!credentials?.phone) {
          throw new Error("Invalid Phone Number");
        }
        const phone = String(credentials.phone);
        const dairyId = credentials.dairyId ? Number(credentials.dairyId) : undefined;
        const role = String(credentials.role || '');

        if (role === "OWNER" && phone) {
          const user = await db.user.findFirst({
            where: {
              phone: phone,
              role: "OWNER",
            },
          })
          if (!user) {
            throw new Error("No user found");
          }
          return user;

        } else if (dairyId && phone) {
          const user = await db.user.findUnique({
            where: {
              phone_dairyId: {
                phone: phone,
                dairyId: dairyId,
              }
            }
          })
          if (!user) {
            throw new Error("No user found for the selected dairy");
          }
          return user;
        } else {
          throw new Error("No user found with the provided credentials.");
        }
        //       return {
        //   id: user.id,
        //   firstName: user.firstName,
        //   lastName: user.lastName,
        //   role: user.role,
        //   phone: user.phone,
        //   email: user.email,
        // };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.phone = user.phone;
        token.email = user.email;
        return token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.firstName = token.firstName;
      session.user.lastName = token.lastName;
      session.user.role = token.role;
      session.user.phone = token.phone;
      session.user.email = token.email;
      return session;
    },
  },
};