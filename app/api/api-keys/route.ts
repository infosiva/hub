import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiKeyRegistry } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-guard";

// Metadata-only registry — see schema.ts comment. Never accepts or returns a
// live secret value, only a masked preview the admin typed in by hand.
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const project = req.nextUrl.searchParams.get("project");
  const rows = await db
    .select()
    .from(apiKeyRegistry)
    .where(project ? eq(apiKeyRegistry.project, project) : undefined)
    .orderBy(desc(apiKeyRegistry.updatedAt));

  return NextResponse.json({ keys: rows });
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { project, provider, envVarName, maskedValue, notes } = await req.json();
  if (!project || !provider || !envVarName) {
    return NextResponse.json({ error: "project, provider, envVarName required" }, { status: 400 });
  }

  const [row] = await db
    .insert(apiKeyRegistry)
    .values({ project, provider, envVarName, maskedValue: maskedValue ?? null, notes: notes ?? null })
    .returning();

  return NextResponse.json({ key: row });
}

export async function DELETE(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.delete(apiKeyRegistry).where(eq(apiKeyRegistry.id, id));
  return NextResponse.json({ ok: true });
}
