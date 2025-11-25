import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const isProd = process.env.NODE_ENV === "production";
  const secureFlag = isProd ? "; Secure" : "";
  // Clear cookie
  res.headers.set("Set-Cookie", `mvp_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax${secureFlag}`);
  return res;
}
