import { NextResponse } from "next/server";
import { SITES } from "@/lib/sites";

export const revalidate = 3600; // cache 1h

interface VercelAnalyticsResponse {
  data?: { total?: number; unique?: number }[];
  error?: string;
}

async function fetchProjectAnalytics(projectName: string): Promise<{ visitors: number; pageviews: number }> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) return { visitors: 0, pageviews: 0 };

  const teamId = process.env.VERCEL_TEAM_ID ?? "";
  const teamParam = teamId ? `&teamId=${teamId}` : "";
  const end = Date.now();
  const start = end - 7 * 24 * 60 * 60 * 1000; // last 7 days

  try {
    const [pvRes, uvRes] = await Promise.all([
      fetch(
        `https://api.vercel.com/v1/analytics/pageviews?projectId=${projectName}&from=${start}&to=${end}${teamParam}`,
        { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 3600 } }
      ),
      fetch(
        `https://api.vercel.com/v1/analytics/visitors?projectId=${projectName}&from=${start}&to=${end}${teamParam}`,
        { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 3600 } }
      ),
    ]);

    const pvData: VercelAnalyticsResponse = pvRes.ok ? await pvRes.json() : {};
    const uvData: VercelAnalyticsResponse = uvRes.ok ? await uvRes.json() : {};

    const pageviews = pvData.data?.reduce((sum, d) => sum + (d.total ?? 0), 0) ?? 0;
    const visitors = uvData.data?.reduce((sum, d) => sum + (d.unique ?? 0), 0) ?? 0;

    return { visitors, pageviews };
  } catch {
    return { visitors: 0, pageviews: 0 };
  }
}

export async function GET() {
  const results = await Promise.allSettled(
    SITES.map(async (site) => {
      const stats = await fetchProjectAnalytics(site.vercelProject);
      return { id: site.id, ...stats };
    })
  );

  const data = results.map((r) =>
    r.status === "fulfilled" ? r.value : { id: "unknown", visitors: 0, pageviews: 0 }
  );

  return NextResponse.json({ fetched: new Date().toISOString(), sites: data });
}
