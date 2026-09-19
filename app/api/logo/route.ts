import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/media-gen";
import { requireAdmin } from "@/lib/auth-guard";

export const runtime = "nodejs";

const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID ?? "";
const VERCEL_TOKEN = process.env.VERCEL_TOKEN ?? "";

async function writeEdgeConfigKey(key: string, value: unknown) {
  if (!EDGE_CONFIG_ID || !VERCEL_TOKEN) return false;
  const res = await fetch(
    `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ operation: "upsert", key, value }] }),
    }
  );
  return res.ok;
}

// GET /api/logo?siteId=xxx — read current logo ref for a site
export async function GET(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get("siteId");
  if (!siteId) return NextResponse.json({ error: "siteId required" }, { status: 400 });
  if (!EDGE_CONFIG_ID || !VERCEL_TOKEN) return NextResponse.json({ logo: null });

  const res = await fetch(
    `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/item/logo_${siteId}`,
    { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
  );
  if (!res.ok) return NextResponse.json({ logo: null });
  const data = await res.json();
  return NextResponse.json({ logo: data.value ?? null });
}

// PATCH /api/logo
// { siteId, mode: "assign", url: string }              — assign an existing image/asset URL
// { siteId, mode: "create", prompt: string, accent?: string } — generate a new logo via fal.ai
export async function PATCH(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { siteId, mode } = body;
    if (!siteId || !mode) {
      return NextResponse.json({ error: "siteId, mode required" }, { status: 400 });
    }

    let logoRef: { url: string; source: "assigned" | "generated"; updatedAt: number };

    if (mode === "assign") {
      if (!body.url) return NextResponse.json({ error: "url required for assign" }, { status: 400 });
      logoRef = { url: body.url, source: "assigned", updatedAt: Date.now() };
    } else if (mode === "create") {
      if (!body.prompt) return NextResponse.json({ error: "prompt required for create" }, { status: 400 });
      const accentNote = body.accent ? ` Use accent color ${body.accent} as the primary mark color.` : "";
      const result = await generateImage(
        `Minimal logo mark for a product called "${siteId}". ${body.prompt}${accentNote} Flat vector style, transparent background, square icon, no text unless specified.`,
        { outputPath: `/tmp/logo-${siteId}-${Date.now()}.png` }
      );
      if (!result?.path) {
        return NextResponse.json({ error: "logo generation failed" }, { status: 500 });
      }
      // ponytail: media-gen writes to local /tmp only — not a hosted URL. On Vercel this
      // file won't survive past the invocation. Wire Vercel Blob upload here before relying
      // on "create" in production; "assign" (existing hosted URL) works today.
      logoRef = { url: result.path, source: "generated", updatedAt: Date.now() };
    } else {
      return NextResponse.json({ error: "mode must be assign or create" }, { status: 400 });
    }

    const ok = await writeEdgeConfigKey(`logo_${siteId}`, logoRef);
    if (!ok) {
      return NextResponse.json({ error: "Edge Config write failed (check EDGE_CONFIG_ID/VERCEL_TOKEN)" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, logo: logoRef });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
