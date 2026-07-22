import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const AUTH_API_URL = "http://31.97.56.148:3110";

// POST /api/admin-codes { project, tier?, aiLimit? }
// Server-side proxy — ADMIN_KEY never reaches the client.
export async function POST(req: NextRequest) {
  const adminKey = process.env.AUTH_API_ADMIN_KEY;
  if (!adminKey) {
    return NextResponse.json({ error: "AUTH_API_ADMIN_KEY not set" }, { status: 500 });
  }

  const { project, tier, aiLimit } = await req.json();
  if (!project || typeof project !== "string") {
    return NextResponse.json({ error: "project required" }, { status: 400 });
  }

  const res = await fetch(`${AUTH_API_URL}/admin-code/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
    body: JSON.stringify({ project, tier, aiLimit }),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
