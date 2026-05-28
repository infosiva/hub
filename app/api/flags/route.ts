import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/flags — returns all toggle_* keys from Edge Config
export async function GET() {
  try {
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
    // Filter only toggle_* keys
    const flags: Record<string, boolean> = {};
    for (const item of data.items ?? []) {
      if (item.key?.startsWith("toggle_") && typeof item.value === "boolean") {
        flags[item.key] = item.value;
      }
    }

    return NextResponse.json({ flags });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
