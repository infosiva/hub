import { NextRequest, NextResponse } from "next/server";
import { SITES } from "@/lib/sites";

export const revalidate = 0; // no cache — always fresh for filterable UI

const PERIOD_MS: Record<string, number> = {
  "1d": 1 * 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  "365d": 365 * 24 * 60 * 60 * 1000,
};

async function fetchProjectAnalytics(projectName: string, periodMs: number): Promise<{ visitors: number; pageviews: number }> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) return { visitors: 0, pageviews: 0 };
  const teamId = process.env.VERCEL_TEAM_ID ?? "";
  const teamParam = teamId ? `&teamId=${teamId}` : "";
  const end = Date.now();
  const start = end - periodMs;
  try {
    const [pvRes, uvRes] = await Promise.all([
      fetch(`https://api.vercel.com/v1/analytics/pageviews?projectId=${projectName}&from=${start}&to=${end}${teamParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`https://api.vercel.com/v1/analytics/visitors?projectId=${projectName}&from=${start}&to=${end}${teamParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    const pvData = pvRes.ok ? await pvRes.json() : {};
    const uvData = uvRes.ok ? await uvRes.json() : {};
    const pageviews = (pvData.data ?? []).reduce((s: number, d: { total?: number }) => s + (d.total ?? 0), 0);
    const visitors = (uvData.data ?? []).reduce((s: number, d: { unique?: number }) => s + (d.unique ?? 0), 0);
    return { visitors, pageviews };
  } catch {
    return { visitors: 0, pageviews: 0 };
  }
}

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get("period") ?? "7d";
  const periodMs = PERIOD_MS[period] ?? PERIOD_MS["7d"];
  const results = await Promise.allSettled(
    SITES.map(async (site) => {
      const stats = await fetchProjectAnalytics(site.vercelProject, periodMs);
      return { id: site.id, name: site.name, url: site.url, category: site.category, ...stats };
    })
  );
  const data = results.map((r) =>
    r.status === "fulfilled" ? r.value : { id: "unknown", name: "", url: "", category: "", visitors: 0, pageviews: 0 }
  );
  // sort by visitors desc
  data.sort((a, b) => b.visitors - a.visitors);
  return NextResponse.json({ fetched: new Date().toISOString(), period, sites: data });
}
