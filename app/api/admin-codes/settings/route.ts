import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";

export const runtime = "nodejs";

const AUTH_API_URL = "http://31.97.56.148:3110";

// GET /api/admin-codes/settings — list guest_enabled flag per project.
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const adminKey = process.env.AUTH_API_ADMIN_KEY;
  if (!adminKey) {
    return NextResponse.json({ error: "AUTH_API_ADMIN_KEY not set" }, { status: 500 });
  }

  const res = await fetch(`${AUTH_API_URL}/admin-code/settings`, {
    headers: { "x-admin-key": adminKey },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// POST /api/admin-codes/settings { project, guestEnabled } — toggle guest access for a project.
export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const adminKey = process.env.AUTH_API_ADMIN_KEY;
  if (!adminKey) {
    return NextResponse.json({ error: "AUTH_API_ADMIN_KEY not set" }, { status: 500 });
  }

  const { project, guestEnabled } = await req.json();
  if (!project || typeof project !== "string" || typeof guestEnabled !== "boolean") {
    return NextResponse.json({ error: "project (string) and guestEnabled (boolean) required" }, { status: 400 });
  }

  const res = await fetch(`${AUTH_API_URL}/admin-code/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
    body: JSON.stringify({ project, guestEnabled }),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
