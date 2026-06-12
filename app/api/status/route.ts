import { NextResponse } from "next/server";
import { SITES } from "@/lib/sites";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  const results = await Promise.allSettled(
    SITES.map(async (site) => {
      const start = Date.now();
      try {
        const res = await fetch(site.url, {
          method: "HEAD",
          signal: AbortSignal.timeout(8000),
          headers: { "User-Agent": "HubMonitor/1.0" },
        });
        const latency = Date.now() - start;
        return {
          id: site.id,
          status: res.ok || res.status < 400 ? "up" : "down",
          statusCode: res.status,
          latency,
          errorType: res.ok || res.status < 400 ? null : `HTTP_${res.status}`,
        };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        const errorType = msg.includes("ENOTFOUND") ? "DNS_FAIL"
          : msg.includes("EPROTO") || msg.includes("SSL") ? "SSL_ERR"
          : msg.includes("abort") || msg.includes("timeout") ? "TIMEOUT"
          : "UNREACHABLE";
        return {
          id: site.id,
          status: "down",
          statusCode: 0,
          latency: Date.now() - start,
          errorType,
        };
      }
    })
  );

  const data = results.map((r) =>
    r.status === "fulfilled" ? r.value : { id: "unknown", status: "down", statusCode: 0, latency: 0, errorType: "CHECK_FAILED" }
  );

  return NextResponse.json({ checked: new Date().toISOString(), sites: data });
}
