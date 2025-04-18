import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check for cart cookie
  if (!request.cookies.get("sessionCartId")) {
    // Generate cart cookie
    const sessionCartId = crypto.randomUUID();

    // Get the response
    const response = NextResponse.next();

    // Set the newly generated sessionCartId in the response cookies
    response.cookies.set("sessionCartId", sessionCartId);

    // Return the response with the sessionCartId set
    return response;
  }

  // If the cookie exists, just continue
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
