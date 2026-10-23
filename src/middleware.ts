import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Better Auth session cookie presence check
  const sessionCookie =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  const isDashboardPage = pathname.startsWith("/dashboard");
  const isAdminPage = pathname.startsWith("/admin");

  // 1. If user is NOT logged in and visits protected dashboard, redirect to login with callbackUrl
  if (!sessionCookie && isDashboardPage) {
    const callbackUrl = encodeURIComponent(`${pathname}${search}`);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
    );
  }

  // 2. If user is NOT logged in and visits protected admin area, redirect to login with callbackUrl
  if (!sessionCookie && isAdminPage) {
    const callbackUrl = encodeURIComponent(`${pathname}${search}`);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
    );
  }

  // Note: We do NOT blindly redirect from /login or /register to /dashboard based on an unverified cookie string.
  // This prevents infinite redirect loops when a browser has an expired/stale cookie or when auth secrets change.
  // Instead, the login page verifies the session with the server client-side and smoothly redirects only when truly valid.

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
