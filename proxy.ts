import { NextRequest, NextResponse } from "next/server";

const PASSWORD = process.env.DASHBOARD_PASSWORD ?? "siva2026";
const COOKIE = "hub_auth";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // allow api routes and login page through
  if (pathname.startsWith("/api/") || pathname === "/login") {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(COOKIE);
  if (cookie?.value === PASSWORD) {
    return NextResponse.next();
  }

  const login = req.nextUrl.clone();
  login.pathname = "/login";
  login.searchParams.set("from", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
