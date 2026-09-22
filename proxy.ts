import { NextRequest, NextResponse } from "next/server";

const PASSWORD = process.env.DASHBOARD_PASSWORD ?? "";
const COOKIE = "hub_auth";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // allow api routes, login page, static screenshot assets, and the public
  // portfolio page through. /portfolio is the intentionally public marketing
  // page (see its own SEO metadata: "index, follow") — everything else here
  // is internal ops/admin surface and must stay behind the hub_auth cookie.
  if (
    pathname.startsWith("/api/") ||
    pathname === "/login" ||
    pathname === "/portfolio" ||
    pathname.startsWith("/screenshots/")
  ) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(COOKIE);
  if (PASSWORD && cookie?.value === PASSWORD) {
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
