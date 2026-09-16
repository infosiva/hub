/**
 * Serves the latest daily domain-check snapshot (fast, from Edge Config).
 * POST triggers a fresh live check across all sites (used by the "Refresh now"
 * button on /status) and persists it as the new snapshot.
 */
import { NextResponse } from "next/server";
import { SITES } from "@/lib/sites";
import { checkAllDomains } from "@/lib/domainCheck";
import { getDomainCheckSnapshot, saveDomainCheckSnapshot } from "@/lib/domainCheckState";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  const snapshot = await getDomainCheckSnapshot();
  if (snapshot) return NextResponse.json(snapshot);

  // No snapshot yet (first run before cron has fired) — do a live check.
  const results = await checkAllDomains(SITES.map((s) => ({ id: s.id, name: s.name, url: s.url })));
  return NextResponse.json({ checkedAt: new Date().toISOString(), results });
}

export async function POST() {
  const results = await checkAllDomains(SITES.map((s) => ({ id: s.id, name: s.name, url: s.url })));
  const snapshot = { checkedAt: new Date().toISOString(), results };
  await saveDomainCheckSnapshot(snapshot);
  return NextResponse.json(snapshot);
}
