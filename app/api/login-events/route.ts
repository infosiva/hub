import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loginEvents } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin, requireIngestSecret } from "@/lib/auth-guard";

// POST: per-project apps report a login/signup/logout event. Machine-to-machine,
// gated by shared secret (HUB_INGEST_SECRET), not the admin cookie.
export async function POST(req: NextRequest) {
  const denied = requireIngestSecret(req);
  if (denied) return denied;

  const { project, userEmail, event, ip, userAgent } = await req.json();
  if (!project) return NextResponse.json({ error: "project required" }, { status: 400 });

  await db.insert(loginEvents).values({
    project,
    userEmail: userEmail ?? null,
    event: event ?? "login",
    ip: ip ?? null,
    userAgent: userAgent ?? null,
  });
  return NextResponse.json({ ok: true });
}

// GET: admin view, optional ?project= filter, most recent first, capped at 200.
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const project = req.nextUrl.searchParams.get("project");
  const rows = await db
    .select()
    .from(loginEvents)
    .where(project ? eq(loginEvents.project, project) : undefined)
    .orderBy(desc(loginEvents.createdAt))
    .limit(200);

  return NextResponse.json({ events: rows });
}
