import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Keep the matcher for performance, but let auth handle the protection
export const config = {
  matcher: [
    "/shipping-address",
    "/payment-method",
    "/place-order",
    "/profile",
    "/user/:path*",
    "/order/:path*",
    "/admin/:path*",
  ],
};

export async function middleware(request: NextRequest) {
  // Remove protection logic and just pass through
  return NextResponse.next();
}
