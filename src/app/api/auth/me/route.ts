import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // In Next.js route handlers, cookies are available on request.cookies
    // but here we are using the Request object in the app dir; NextResponse doesn't provide cookie parsing directly.
    // Use Request headers to access cookie header.
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/mvp_token=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : null;

    if (!token) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    return NextResponse.json({ ok: true, token });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
