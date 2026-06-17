import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// All 17 layout archetypes — mirrored from protoforge/lib/layoutSystem.ts
// Kept as a flat constant here so hub doesn't need a cross-project import.
const LAYOUTS = [
  { id: "T1",  name: "SaaS Split Hero",        bg: "#ffffff", accent: "#2563eb" },
  { id: "T2",  name: "Dev Tools Dark Terminal", bg: "#0b1120", accent: "#6366f1" },
  { id: "T3",  name: "Education Split Light",  bg: "#f0f9ff", accent: "#0284c7" },
  { id: "T4",  name: "Health Centered Calm",    bg: "#f0fdfa", accent: "#0d9488" },
  { id: "T5",  name: "Travel Green Split",      bg: "#f0fdf4", accent: "#059669" },
  { id: "T6",  name: "Finance Dark Navy",       bg: "#0b1420", accent: "#10b981" },
  { id: "T7",  name: "Food Warm White",         bg: "#fffbf5", accent: "#ea580c" },
  { id: "T8",  name: "Swiss Editorial Grid",    bg: "#f9fafb", accent: "#dc2626" },
  { id: "T9",  name: "Bento Grid SaaS",         bg: "#ffffff", accent: "#0ea5e9" },
  { id: "T10", name: "Cinematic Dark",          bg: "#0a0a0f", accent: "#e879f9" },
  { id: "T11", name: "Typewriter Terminal",     bg: "#060d1a", accent: "#22d3ee" },
  { id: "T12", name: "Magazine Editorial Warm", bg: "#fffbf5", accent: "#f97316" },
  { id: "T13", name: "Floating Cards Warm",     bg: "#fff7ed", accent: "#ea580c" },
  { id: "T14", name: "Generative Art Dark",     bg: "#0e0e16", accent: "#a78bfa" },
  { id: "T15", name: "D3 Data Hero",            bg: "#0b1420", accent: "#f59e0b" },
  { id: "T16", name: "Full-Width Input Hero",   bg: "#fdf4ff", accent: "#9333ea" },
  { id: "T17", name: "Asymmetric Split",        bg: "#f0f9ff", accent: "#7c3aed" },
] as const;

// GET /api/layout — list all 17 archetypes (for picker UI)
// GET /api/layout?siteId=xxx — current layoutId for one site
export async function GET(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get("siteId");
  if (!siteId) return NextResponse.json({ layouts: LAYOUTS });

  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const vercelToken = process.env.VERCEL_TOKEN;
  if (!edgeConfigId || !vercelToken) return NextResponse.json({ layoutId: null });

  try {
    const res = await fetch(
      `https://api.vercel.com/v1/edge-config/${edgeConfigId}/item/theme_${siteId}`,
      { headers: { Authorization: `Bearer ${vercelToken}` } }
    );
    if (!res.ok) return NextResponse.json({ layoutId: null });
    const data = await res.json();
    return NextResponse.json({ layoutId: data?.value?.layoutId ?? null });
  } catch {
    return NextResponse.json({ layoutId: null });
  }
}

// PATCH /api/layout { siteId, layoutId } — sets theme_<siteId>.layoutId
// Merges into existing theme_<siteId> object so other theme fields survive.
export async function PATCH(req: NextRequest) {
  try {
    const { siteId, layoutId } = await req.json();
    if (!siteId || (layoutId && !LAYOUTS.some((l) => l.id === layoutId))) {
      return NextResponse.json({ error: "siteId required, layoutId must be T1-T17 or null" }, { status: 400 });
    }

    const edgeConfigId = process.env.EDGE_CONFIG_ID;
    const vercelToken = process.env.VERCEL_TOKEN;
    if (!edgeConfigId || !vercelToken) {
      return NextResponse.json({ error: "EDGE_CONFIG_ID or VERCEL_TOKEN not set" }, { status: 500 });
    }

    // Read existing theme object first so we merge, not overwrite
    const existingRes = await fetch(
      `https://api.vercel.com/v1/edge-config/${edgeConfigId}/item/theme_${siteId}`,
      { headers: { Authorization: `Bearer ${vercelToken}` } }
    );
    const existing = existingRes.ok ? (await existingRes.json())?.value ?? {} : {};
    const merged = { ...existing, layoutId: layoutId ?? undefined };
    if (!layoutId) delete merged.layoutId;

    const res = await fetch(
      `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [{ operation: "upsert", key: `theme_${siteId}`, value: merged }],
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Edge Config write failed: ${err}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true, siteId, layoutId: layoutId ?? null });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
