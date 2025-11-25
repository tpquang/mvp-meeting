import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected path prefix
const LOGIN = "/login";
const DEFAULT_DOMAIN = "gpt";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip public assets and API routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.startsWith("/static") || pathname.startsWith("/favicon.ico")) {
    return NextResponse.next();
  }

    // If user hits root, redirect to top-level record or login depending on token
    if (pathname === "/") {
      const tokenRoot = req.cookies.get("mvp_token")?.value || null;
      const url = req.nextUrl.clone();
      url.pathname = tokenRoot ? "/record" : LOGIN;
      return NextResponse.redirect(url);
    }

    // Protect top-level record/settings routes
    if (pathname.startsWith("/record") || pathname.startsWith("/settings")) {
      const token = req.cookies.get("mvp_token")?.value || null;
      if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = LOGIN;
        url.searchParams.set("from", pathname);
        return NextResponse.redirect(url);
      }
    }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/record/:path*", "/settings/:path*", "/record", "/settings"],
};
