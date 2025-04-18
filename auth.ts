// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Edge-safe dynamic import
const isEdge =
  typeof process !== "undefined" && process.env.NEXT_RUNTIME === "edge";

// Don't import PrismaAdapter or PrismaClient directly if in edge runtime
let PrismaAdapter: any = null;
let prisma: any = null;

if (!isEdge) {
  const { PrismaClient } = await import("@prisma/client");
  const { PrismaAdapter: PrismaAdapterImport } = await import(
    "@auth/prisma-adapter"
  );

  prisma = new PrismaClient();
  PrismaAdapter = PrismaAdapterImport;
}

export const config: NextAuthConfig = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: PrismaAdapter ? PrismaAdapter(prisma) : undefined,
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || !prisma) return null;

        const user = await prisma.user.findFirst({
          where: { email: credentials.email },
        });

        if (user && user.password) {
          const isMatch = compareSync(credentials.password, user.password);
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: any) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.role = token.role;
      return session;
    },
    async jwt({ token, user, session, trigger }: any) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = user.role;

        if (user.name === "NO_NAME" && prisma) {
          token.name = user.email!.split("@")[0];
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        }
      }

      if (trigger === "update" && session?.user.name) {
        token.name = session.user.name;
      }

      return token;
    },
  },
};

export const { auth, handlers, signIn, signOut } = NextAuth(config);
