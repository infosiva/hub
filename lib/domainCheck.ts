/**
 * Domain/AdSense classification shared by /api/status (live check) and
 * /api/cron/domain-check (hourly persisted snapshot + alert).
 *
 * Four buckets, in priority order:
 *  - "working"       HTTP 200 and AdSense script present in the served HTML
 *  - "needs_adsense" HTTP 200, site itself loads fine — just missing/lazy
 *                     the AdSense script. Site is NOT down, don't alarm on it.
 *  - "unregistered"  domain never delegated, or parked at a registrar/DNS
 *                     provider (GoDaddy, Porkbun, Namecheap, Squarespace,
 *                     dns-parking.com, or a blocked/inaccessible Cloudflare
 *                     zone) — i.e. never actually pointed at the app
 *  - "broken"        actual failure: non-200, DNS fail, timeout, SSL error,
 *                     wrong project served, deploy blocked, etc.
 */

const ADSENSE_MARKER = "pagead2.googlesyndication";

const PARKING_NS_SIGNATURES = [
  "domaincontrol.com", // GoDaddy
  "ns.porkbun.com", // Porkbun
  "registrar-servers.com", // Namecheap
  "dns-parking.com", // third-party parking
  "squarespacedns.com",
];

export type DomainStatus = "working" | "needs_adsense" | "broken" | "unregistered";

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

    // 200 and site loads fine, just no AdSense script yet — site is NOT down.
    if (res.status >= 200 && res.status < 400) {
      return { id: site.id, name: site.name, url: site.url, status: "needs_adsense", httpCode: res.status, hasAdsense, reason: "site live — AdSense script not found in served HTML", checkedAt };
    }

    // Actual failure: non-2xx/3xx response.
    return { id: site.id, name: site.name, url: site.url, status: "broken", httpCode: res.status, hasAdsense, reason: `HTTP ${res.status}`, checkedAt };
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
