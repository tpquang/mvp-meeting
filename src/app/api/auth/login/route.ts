import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body || {};

    if (username === "admin" && password === "123") {
      const token = "mvp_fake_token_v1";
      // Set httpOnly cookie for server-side protection
      const res = NextResponse.json({ ok: true, token });
      const maxAge = 7 * 24 * 60 * 60; // 7 days
      const isProd = process.env.NODE_ENV === "production";
      // In development on localhost, do not set Secure so browsers accept cookie over HTTP
      const secureFlag = isProd ? "; Secure" : "";
      res.headers.set(
        "Set-Cookie",
        `mvp_token=${token}; Path=/; HttpOnly; Max-Age=${maxAge}; SameSite=Lax${secureFlag}`
      );
      return res;
    }

    return NextResponse.json({ ok: false }, { status: 401 });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
