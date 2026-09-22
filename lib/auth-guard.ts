import { NextRequest, NextResponse } from "next/server";

const COOKIE = "hub_auth";
const PASSWORD = process.env.DASHBOARD_PASSWORD ?? "";

// Single source of truth for "is this request the real admin" — every
// mutating API route calls this first. Page-level gating (proxy.ts) is
// separate and does not protect API routes on its own.
export function isAdmin(req: NextRequest): boolean {
  if (!PASSWORD) return false; // fail closed if env var is missing, never fall back to a known default
  return req.cookies.get(COOKIE)?.value === PASSWORD;
}

// Server components (app/page.tsx etc.) fetch these same-deployment routes
// without a browser cookie attached. Reuse DASHBOARD_PASSWORD as the internal
// header value rather than adding a third secret — still fails closed if unset.
export function isInternalCall(req: NextRequest): boolean {
  if (!PASSWORD) return false;
  return req.headers.get("x-hub-internal") === PASSWORD;
}

// Call at the top of any mutating handler; returns a 401 response to
// return early, or null if the caller is authenticated.
export function requireAdmin(req: NextRequest): NextResponse | null {
  if (isAdmin(req) || isInternalCall(req)) return null;
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

// Machine-to-machine auth for per-project apps POSTing events into Hub
// (e.g. login events). Separate from admin cookie auth — no browser
// session involved, so a shared secret header is the right fit.
const INGEST_SECRET = process.env.HUB_INGEST_SECRET ?? "";

export function requireIngestSecret(req: NextRequest): NextResponse | null {
  if (!INGEST_SECRET) return NextResponse.json({ error: "ingest not configured" }, { status: 500 });
  if (req.headers.get("x-hub-secret") !== INGEST_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
