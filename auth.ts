import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Pool } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import { prisma } from "@/db/prisma";
import { NextRequest } from "next/server";

// Extend the User type to include role
declare module "next-auth" {
  interface User {
    role?: string | null;
  }

  interface Session {
    user: User & {
      id: string;
      role?: string | null;
    };
  }
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Use direct SQL query instead of Prisma
          const { rows } = await pool.query(
            'SELECT id, email, password, name, role FROM "User" WHERE email = $1 LIMIT 1',
            [credentials.email]
          );

          const user = rows[0];

          if (!user?.password) return null;

          const isMatch = compareSync(
            credentials.password.toString(),
            user.password?.toString() || ""
          );

          if (isMatch) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    authorized({ request, auth }: { request: NextRequest; auth: any }) {
      // Array of regex patterns of protected paths
      const protectedPaths = [
        /\/shipping-address/,
        /\/payment-method/,
        /\/place-order/,
        /\/profile/,
        /\/user\/(.*)/,
        /\/order\/(.*)/,
        /\/admin/,
      ];

      // Get pathname from the req URL object
      const { pathname } = request.nextUrl;

      // Check if user is not authenticated and on a protected path
      if (!auth && protectedPaths.some((p) => p.test(pathname))) return false;

      return true;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Assign user properties to the token
        token.id = user.id;
        token.role = user.role;

        if (trigger === "signIn" || trigger === "signUp") {
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get("sessionCartId")?.value;

          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: { sessionCartId },
            });

            if (sessionCart) {
              // Overwrite any existing user cart
              await prisma.cart.deleteMany({
                where: { userId: user.id },
              });

              // Assign the guest cart to the logged-in user
              await prisma.cart.update({
                where: { id: sessionCart.id },
                data: { userId: user.id },
              });
            }
          }
        }
      }

      if (trigger === "update" && session?.user?.name) {
        // Update user name in database
        await pool.query('UPDATE "User" SET name = $1 WHERE id = $2', [
          session.user.name,
          token.id,
        ]);
        token.name = session.user.name;
      }

      return token;
    },
  },
} satisfies NextAuthConfig;

export const { auth, handlers, signIn, signOut } = NextAuth(config);
