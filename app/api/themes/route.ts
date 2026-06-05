import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE = "hub_auth";
const PASSWORD = process.env.DASHBOARD_PASSWORD ?? "siva2026";

function checkAuth(req: NextRequest): boolean {
  const cookie = req.cookies.get(COOKIE);
  return cookie?.value === PASSWORD;
}

// GET /api/themes — returns all theme_* keys
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
    `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`,
    {
      headers: { Authorization: `Bearer ${vercelToken}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `Edge Config read failed: ${err}` }, { status: 500 });
  }

  const data = await res.json();
  const themes: Record<string, Record<string, string | boolean>> = {};

  for (const item of data.items ?? []) {
    if (item.key?.startsWith("theme_")) {
      // key format: theme_<siteId>
      const siteId = item.key.slice(6);
      themes[siteId] = item.value;
    }
  }

  return NextResponse.json({ themes });
}

// PATCH /api/themes { siteId, theme }
// theme = { background, primary, secondary, texture, widgets: { chatbot, usagePill, ... } }
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { siteId, theme } = await req.json();
  if (!siteId || !theme) {
    return NextResponse.json({ error: "siteId and theme required" }, { status: 400 });
  }

  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const vercelToken = process.env.VERCEL_TOKEN;
  if (!edgeConfigId || !vercelToken) {
    return NextResponse.json({ error: "EDGE_CONFIG_ID or VERCEL_TOKEN not set" }, { status: 500 });
  }

  const key = `theme_${siteId}`;
  const res = await fetch(
    `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ operation: "upsert", key, value: theme }],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `Edge Config write failed: ${err}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, key, theme });
}

// DELETE /api/themes?siteId=xxx — removes theme override, site reverts to defaults
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const siteId = req.nextUrl.searchParams.get("siteId");
  if (!siteId) {
    return NextResponse.json({ error: "siteId required" }, { status: 400 });
  }

  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const vercelToken = process.env.VERCEL_TOKEN;
  if (!edgeConfigId || !vercelToken) {
    return NextResponse.json({ error: "EDGE_CONFIG_ID or VERCEL_TOKEN not set" }, { status: 500 });
  }

  const key = `theme_${siteId}`;
  const res = await fetch(
    `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ operation: "delete", key }],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `Edge Config delete failed: ${err}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deleted: key });
}
