import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

export const runtime = "nodejs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
};

// §0-EDGE-CONFIG-QUOTA: one upstream read per site per 10 min, shared by all visitors.
const readTheme = unstable_cache(
  async (siteId: string) => {
    const id = process.env.EDGE_CONFIG_ID;
    const token = process.env.VERCEL_TOKEN;
    if (!id || !token) return null;
    const res = await fetch(`https://api.vercel.com/v1/edge-config/${id}/item/theme_${siteId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const v = (await res.json())?.value;
    return v && typeof v === "object" ? v : null;
  },
  ["theme-public"],
  { revalidate: 600 },
);

const HEX = /^#[0-9a-fA-F]{6}$/;
const GA4 = /^G-[A-Z0-9]{6,12}$/;
const hex = (v: unknown) => (typeof v === "string" && HEX.test(v) ? v : undefined);

// Whitelist only: never forward arbitrary Edge Config fields to the public.
function pick(t: Record<string, any>) {
  const pal = t.palette ?? t.colors ?? {};
  const lay = t.layout ?? {};
  return {
    primary: hex(t.primary ?? pal.primary),
    background: hex(t.background ?? pal.background ?? pal.bg),
    layoutId: typeof t.layoutId === "string" ? t.layoutId : undefined,
    layout: {
      archetype: typeof lay.archetype === "string" ? lay.archetype : undefined,
      bgAnimation: typeof lay.bgAnimation === "string" ? lay.bgAnimation : undefined,
      bgSpeed: typeof lay.bgSpeed === "number" ? lay.bgSpeed : undefined,
    },
    analytics: { ga4Id: GA4.test(t.analytics?.ga4Id ?? "") ? t.analytics.ga4Id : undefined },
  };
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// GET /api/theme-public?siteId=xxx — public, cached, whitelisted theme for static bots.
export async function GET(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get("siteId") ?? "";
  if (!/^[a-z0-9-]{1,40}$/.test(siteId)) {
    return NextResponse.json({ error: "bad siteId" }, { status: 400, headers: CORS });
  }
  try {
    const t = await readTheme(siteId);
    return NextResponse.json(t ? pick(t) : {}, { headers: CORS });
  } catch {
    return NextResponse.json({}, { headers: CORS });
  }
}
