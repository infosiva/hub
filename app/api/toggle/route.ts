import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// PATCH /api/toggle { siteId, key, value }
// Writes toggle_<siteId>_<key> to Vercel Edge Config via Management API
export async function PATCH(req: NextRequest) {
  try {
    const { siteId, key, value } = await req.json();
    if (!siteId || !key || typeof value !== "boolean") {
      return NextResponse.json({ error: "siteId, key, value required" }, { status: 400 });
    }

    const edgeConfigId = process.env.EDGE_CONFIG_ID;
    const vercelToken = process.env.VERCEL_TOKEN;
    if (!edgeConfigId || !vercelToken) {
      return NextResponse.json({ error: "EDGE_CONFIG_ID or VERCEL_TOKEN not set" }, { status: 500 });
    }

    const toggleKey = `toggle_${siteId}_${key}`;
    const res = await fetch(
      `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [{ operation: "upsert", key: toggleKey, value }],
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Edge Config write failed: ${err}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true, key: toggleKey, value });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// GET /api/toggle?siteId=xxx — read all toggles for a site
export async function GET(req: NextRequest) {
  try {
    const siteId = req.nextUrl.searchParams.get("siteId");
    if (!siteId) {
      return NextResponse.json({ error: "siteId required" }, { status: 400 });
    }

    const edgeConfigId = process.env.EDGE_CONFIG_ID;
    const vercelToken = process.env.VERCEL_TOKEN;
    if (!edgeConfigId || !vercelToken) {
      return NextResponse.json({ toggles: {} });
    }

    const res = await fetch(
      `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items?prefix=toggle_${siteId}_`,
      {
        headers: { Authorization: `Bearer ${vercelToken}` },
      }
    );

    if (!res.ok) return NextResponse.json({ toggles: {} });
    const data = await res.json();
    const toggles: Record<string, boolean> = {};
    for (const item of data.items ?? []) {
      const featureKey = item.key.replace(`toggle_${siteId}_`, "");
      toggles[featureKey] = item.value;
    }
    return NextResponse.json({ toggles });
  } catch {
    return NextResponse.json({ toggles: {} });
  }
}
