import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// PATCH /api/content { siteId, field, value }
// field: "hero" | "cta" | "tagline"
export async function PATCH(req: NextRequest) {
  try {
    const { siteId, field, value } = await req.json();
    if (!siteId || !field || typeof value !== "string") {
      return NextResponse.json({ error: "siteId, field, value required" }, { status: 400 });
    }

    const edgeConfigId = process.env.EDGE_CONFIG_ID;
    const vercelToken = process.env.VERCEL_TOKEN;
    if (!edgeConfigId || !vercelToken) {
      return NextResponse.json({ error: "EDGE_CONFIG_ID or VERCEL_TOKEN not set" }, { status: 500 });
    }

    const contentKey = `content_${siteId}_${field}`;
    const res = await fetch(
      `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [{ operation: "upsert", key: contentKey, value }],
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Edge Config write failed: ${err}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true, key: contentKey, value });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// GET /api/content?siteId=xxx — read all content overrides for a site
export async function GET(req: NextRequest) {
  try {
    const siteId = req.nextUrl.searchParams.get("siteId");
    if (!siteId) {
      return NextResponse.json({ error: "siteId required" }, { status: 400 });
    }

    const edgeConfigId = process.env.EDGE_CONFIG_ID;
    const vercelToken = process.env.VERCEL_TOKEN;
    if (!edgeConfigId || !vercelToken) {
      return NextResponse.json({ content: {} });
    }

    const res = await fetch(
      `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items?prefix=content_${siteId}_`,
      { headers: { Authorization: `Bearer ${vercelToken}` } }
    );

    if (!res.ok) return NextResponse.json({ content: {} });
    const data = await res.json();
    const content: Record<string, string> = {};
    for (const item of data.items ?? []) {
      const field = item.key.replace(`content_${siteId}_`, "");
      content[field] = item.value;
    }
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ content: {} });
  }
}
