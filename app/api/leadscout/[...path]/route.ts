import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";

export const runtime = "nodejs";
export const maxDuration = 30;

// Admin-only proxy to the LeadScout worker (VPS, runs Chromium + Apify).
// Apify spend is gated by the worker's confirm:true check; the token lives only on the worker.
async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const base = process.env.LEADSCOUT_WORKER_URL;
  if (!base) return NextResponse.json({ error: "LEADSCOUT_WORKER_URL not set" }, { status: 503 });
  const { path } = await params;
  const url = `${base}/api/${path.join("/")}${req.nextUrl.search}`;
  try {
    const r = await fetch(url, {
      method: req.method,
      headers: { "content-type": "application/json", "x-worker-key": process.env.LEADSCOUT_WORKER_KEY ?? "" },
      body: req.method === "POST" ? await req.text() : undefined,
      signal: AbortSignal.timeout(20000),
    });
    return new NextResponse(r.body, { status: r.status, headers: { "content-type": r.headers.get("content-type") ?? "application/json", "content-disposition": r.headers.get("content-disposition") ?? "" } });
  } catch {
    return NextResponse.json({ error: "worker unreachable" }, { status: 502 });
  }
}
export const GET = proxy;
export const POST = proxy;
