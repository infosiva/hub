import { NextRequest, NextResponse } from "next/server";

const COOKIE = "hub_auth";
const PASSWORD = process.env.DASHBOARD_PASSWORD ?? "siva2026";

// Single source of truth for "is this request the real admin" — every
// mutating API route calls this first. Page-level gating (proxy.ts) is
// separate and does not protect API routes on its own.
export function isAdmin(req: NextRequest): boolean {
  return req.cookies.get(COOKIE)?.value === PASSWORD;
}

// Call at the top of any mutating handler; returns a 401 response to
// return early, or null if the caller is authenticated.
export function requireAdmin(req: NextRequest): NextResponse | null {
  if (isAdmin(req)) return null;
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
