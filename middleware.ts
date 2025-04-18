import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/checkout"],
};

export async function middleware(request: NextRequest) {
  const session = await auth();

  if (!session && request.nextUrl.pathname === "/checkout") {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}
