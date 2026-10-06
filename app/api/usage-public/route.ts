import { NextRequest, NextResponse } from "next/server";

// Anonymous, consent-gated usage/error beacon for static bots. No PII: siteId, type, path, short msg only.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const b = JSON.parse((await req.text()).slice(0, 2000));
    const siteId = String(b.siteId ?? "");
    const type = b.type === "error" ? "error" : "view";
    if (/^[a-z0-9-]{1,40}$/.test(siteId)) {
      console.log(JSON.stringify({
        t: new Date().toISOString(), siteId, type,
        path: String(b.path ?? "").slice(0, 120),
        msg: type === "error" ? String(b.msg ?? "").slice(0, 200) : undefined,
      }));
    }
  } catch {}
  return new NextResponse(null, { status: 204, headers: CORS });
}
