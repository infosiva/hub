import { NextRequest, NextResponse } from "next/server";

const PASSWORD = process.env.DASHBOARD_PASSWORD ?? "siva2026";
const COOKIE = "hub_auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password === PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return res;
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
