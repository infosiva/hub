import { NextResponse } from "next/server";
import { SITES } from "@/lib/sites";

export const runtime = "nodejs";
export const revalidate = 0;

interface SiteHealth {
  id: string;
  url: string;
  issues: Issue[];
  score: number; // 0-100
}

interface Issue {
  type: "missing_og" | "missing_sitemap" | "missing_robots" | "http_error" | "slow_response" | "missing_jsonld";
  severity: "error" | "warning";
  message: string;
}

async function checkSite(site: { id: string; url: string }): Promise<SiteHealth> {
  const issues: Issue[] = [];
  const baseUrl = site.url.replace(/\/$/, "");

  const checks = await Promise.allSettled([
    // HEAD check for main page
    fetch(baseUrl, { method: "HEAD", signal: AbortSignal.timeout(8000), headers: { "User-Agent": "HubAudit/1.0" } }),
    // robots.txt
    fetch(`${baseUrl}/robots.txt`, { method: "HEAD", signal: AbortSignal.timeout(5000), headers: { "User-Agent": "HubAudit/1.0" } }),
    // sitemap.xml
    fetch(`${baseUrl}/sitemap.xml`, { method: "HEAD", signal: AbortSignal.timeout(5000), headers: { "User-Agent": "HubAudit/1.0" } }),
    // og.png
    fetch(`${baseUrl}/og.png`, { method: "HEAD", signal: AbortSignal.timeout(5000), headers: { "User-Agent": "HubAudit/1.0" } }),
  ]);

  // Main page
  const mainResult = checks[0];
  if (mainResult.status === "fulfilled") {
    const r = mainResult.value;
    if (!r.ok && r.status >= 400) {
      issues.push({ type: "http_error", severity: "error", message: `HTTP ${r.status}` });
    }
  } else {
    issues.push({ type: "http_error", severity: "error", message: "Unreachable" });
  }

  // robots.txt
  const robotsResult = checks[1];
  if (robotsResult.status !== "fulfilled" || !robotsResult.value.ok) {
    issues.push({ type: "missing_robots", severity: "warning", message: "robots.txt missing" });
  }

  // sitemap.xml
  const sitemapResult = checks[2];
  if (sitemapResult.status !== "fulfilled" || !sitemapResult.value.ok) {
    issues.push({ type: "missing_sitemap", severity: "warning", message: "sitemap.xml missing" });
  }

  // og.png
  const ogResult = checks[3];
  if (ogResult.status !== "fulfilled" || !ogResult.value.ok) {
    issues.push({ type: "missing_og", severity: "warning", message: "og.png missing (OG image)" });
  }

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warnCount = issues.filter((i) => i.severity === "warning").length;
  const score = Math.max(0, 100 - errorCount * 30 - warnCount * 10);

  return { id: site.id, url: site.url, issues, score };
}

export async function GET() {
  const results = await Promise.allSettled(
    SITES.map((site) => checkSite({ id: site.id, url: site.url }))
  );

  const data: SiteHealth[] = results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { id: SITES[i].id, url: SITES[i].url, issues: [{ type: "http_error" as const, severity: "error" as const, message: "Check failed" }], score: 0 }
  );

  const totalIssues = data.reduce((sum, s) => sum + s.issues.length, 0);
  const errorSites = data.filter((s) => s.issues.some((i) => i.severity === "error")).length;

  return NextResponse.json({
    checked: new Date().toISOString(),
    summary: { totalIssues, errorSites },
    sites: data,
  });
}
