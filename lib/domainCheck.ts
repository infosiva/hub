/**
 * Domain/AdSense classification shared by /api/status (live check) and
 * /api/cron/domain-check (daily persisted snapshot + alert).
 *
 * Three buckets, in priority order:
 *  - "working"      HTTP 200 and AdSense script present in the served HTML
 *  - "unregistered" domain never delegated, or parked at a registrar/DNS
 *                    provider (GoDaddy, Porkbun, Namecheap, Squarespace,
 *                    dns-parking.com, or a blocked/inaccessible Cloudflare
 *                    zone) — i.e. never actually pointed at the app
 *  - "broken"        domain resolves and something answers, but it's not
 *                    serving the app correctly (wrong project, missing ad
 *                    script, deploy blocked, non-200, etc.)
 */

const ADSENSE_MARKER = "pagead2.googlesyndication";

const PARKING_NS_SIGNATURES = [
  "domaincontrol.com", // GoDaddy
  "ns.porkbun.com", // Porkbun
  "registrar-servers.com", // Namecheap
  "dns-parking.com", // third-party parking
  "squarespacedns.com",
];

export type DomainStatus = "working" | "broken" | "unregistered";

export interface DomainCheckResult {
  id: string;
  name: string;
  url: string;
  status: DomainStatus;
  httpCode: number;
  hasAdsense: boolean;
  reason: string;
  checkedAt: string;
}

async function resolvesAtAll(hostname: string): Promise<boolean> {
  try {
    const dns = await import("node:dns/promises");
    const [ns, a] = await Promise.allSettled([dns.resolveNs(hostname), dns.resolve4(hostname)]);
    const nsList = ns.status === "fulfilled" ? ns.value : [];
    const hasParkingNs = nsList.some((n) => PARKING_NS_SIGNATURES.some((sig) => n.includes(sig)));
    const hasA = a.status === "fulfilled" && a.value.length > 0;
    if (hasParkingNs) return false; // parked, even if it has some A record
    if (ns.status === "rejected" && a.status === "rejected") return false; // never delegated
    return hasA || ns.status === "fulfilled";
  } catch {
    return false;
  }
}

export async function checkDomain(site: { id: string; name: string; url: string }): Promise<DomainCheckResult> {
  const checkedAt = new Date().toISOString();
  let hostname: string;
  try {
    hostname = new URL(site.url).hostname;
  } catch {
    return { id: site.id, name: site.name, url: site.url, status: "broken", httpCode: 0, hasAdsense: false, reason: "invalid URL", checkedAt };
  }

  try {
    const res = await fetch(site.url, {
      signal: AbortSignal.timeout(10_000),
      headers: { "User-Agent": "Mozilla/5.0 HubDomainMonitor/1.0" },
    });
    const body = await res.text();
    const hasAdsense = body.includes(ADSENSE_MARKER);

    if (res.status >= 200 && res.status < 400 && hasAdsense) {
      return { id: site.id, name: site.name, url: site.url, status: "working", httpCode: res.status, hasAdsense, reason: "live, AdSense confirmed", checkedAt };
    }

    // Reachable but not fully correct — that's "broken", not "unregistered".
    const reason = res.status >= 400
      ? `HTTP ${res.status}`
      : "reachable but AdSense script not found in served HTML";
    return { id: site.id, name: site.name, url: site.url, status: "broken", httpCode: res.status, hasAdsense, reason, checkedAt };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const delegated = await resolvesAtAll(hostname);
    if (!delegated) {
      return { id: site.id, name: site.name, url: site.url, status: "unregistered", httpCode: 0, hasAdsense: false, reason: "domain not delegated to app (no DNS / parked at registrar)", checkedAt };
    }
    const reason = msg.includes("ENOTFOUND") ? "DNS_FAIL"
      : msg.includes("EPROTO") || msg.includes("SSL") ? "SSL_ERR"
      : msg.includes("abort") || msg.includes("timeout") ? "TIMEOUT"
      : `UNREACHABLE (${msg})`;
    return { id: site.id, name: site.name, url: site.url, status: "broken", httpCode: 0, hasAdsense: false, reason, checkedAt };
  }
}

export async function checkAllDomains(sites: { id: string; name: string; url: string }[]): Promise<DomainCheckResult[]> {
  const results = await Promise.allSettled(sites.map(checkDomain));
  return results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { id: sites[i].id, name: sites[i].name, url: sites[i].url, status: "broken" as const, httpCode: 0, hasAdsense: false, reason: "check threw", checkedAt: new Date().toISOString() }
  );
}
