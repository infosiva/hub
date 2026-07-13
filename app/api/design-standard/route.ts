import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE = "hub_auth";
const PASSWORD = process.env.DASHBOARD_PASSWORD ?? "siva2026";

function checkAuth(req: NextRequest): boolean {
  const cookie = req.cookies.get(COOKIE);
  return cookie?.value === PASSWORD;
}

export type DesignStandardRow = {
  project: string;
  url: string;
  themeLabel: string;
  bg: string;
  accent: string;
};

// GET /api/design-standard — returns rows stored under Edge Config key "design_standard".
// Hub is deployed standalone (its own repo) and can't read the monorepo's
// DESIGN-STANDARD.md filesystem at runtime, so seeding happens out-of-band via
// scripts/sync-design-standard.mjs (run from the monorepo, has fs access to both),
// which POSTs the parsed rows here to persist into Edge Config.
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const vercelToken = process.env.VERCEL_TOKEN;
  if (!edgeConfigId || !vercelToken) {
    return NextResponse.json({ error: "EDGE_CONFIG_ID or VERCEL_TOKEN not set" }, { status: 500 });
  }

  const res = await fetch(
    `https://api.vercel.com/v1/edge-config/${edgeConfigId}/item/design_standard`,
    { headers: { Authorization: `Bearer ${vercelToken}` }, cache: "no-store" }
  );

  if (res.status === 404) {
    return NextResponse.json({ rows: [], syncedAt: null });
  }
  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `Edge Config read failed: ${err}` }, { status: 500 });
  }

  const item = await res.json();
  const value = item?.value ?? {};
  return NextResponse.json({ rows: value.rows ?? [], syncedAt: value.syncedAt ?? null });
}

// POST /api/design-standard { rows: DesignStandardRow[] }
// Re-syncable seed — overwrites the "design_standard" key wholesale.
// Called by scripts/sync-design-standard.mjs after parsing DESIGN-STANDARD.md.
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const rows: DesignStandardRow[] | undefined = body?.rows;
  if (!Array.isArray(rows)) {
    return NextResponse.json({ error: "rows[] required" }, { status: 400 });
  }

  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const vercelToken = process.env.VERCEL_TOKEN;
  if (!edgeConfigId || !vercelToken) {
    return NextResponse.json({ error: "EDGE_CONFIG_ID or VERCEL_TOKEN not set" }, { status: 500 });
  }

  const value = { rows, syncedAt: Date.now() };
  const res = await fetch(
    `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: [{ operation: "upsert", key: "design_standard", value }] }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `Edge Config write failed: ${err}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: rows.length, syncedAt: value.syncedAt });
}
