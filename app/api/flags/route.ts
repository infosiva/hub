import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

export const runtime = "nodejs";

const getFlags = unstable_cache(
  async () => {
    const edgeConfigId = process.env.EDGE_CONFIG_ID;
    const vercelToken = process.env.VERCEL_TOKEN;
    if (!edgeConfigId || !vercelToken) {
      throw new Error("EDGE_CONFIG_ID or VERCEL_TOKEN not set");
    }

    const res = await fetch(
      `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`,
      { headers: { Authorization: `Bearer ${vercelToken}` } }
    );
    if (!res.ok) throw new Error(`Edge Config read failed: ${await res.text()}`);

    const data = await res.json();
    const flags: Record<string, boolean> = {};
    for (const item of data.items ?? []) {
      if (item.key?.startsWith("toggle_") && typeof item.value === "boolean") {
        flags[item.key] = item.value;
      }
    }
    return flags;
  },
  ["hub-edge-config-flags"],
  { revalidate: 600 }
);

// GET /api/flags — admin-only, returns all toggle_* keys from Edge Config.
// Internal roster/flag state, not for public or per-project consumption.
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    return NextResponse.json({ flags: await getFlags() });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
