/**
 * Vercel Cron: runs health-agent logic hourly.
 * Schedule set in vercel.json: "0 * * * *"
 * Protected by CRON_SECRET env var.
 */

import { NextRequest, NextResponse } from "next/server";
import { SITES } from "@/lib/sites";

const VERCEL_TOKEN = process.env.VERCEL_TOKEN ?? "";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? "";

async function checkSite(site: (typeof SITES)[0]) {
  const start = Date.now();
  try {
    const res = await fetch(site.url, {
      method: "HEAD",
      signal: AbortSignal.timeout(10_000),
      headers: { "User-Agent": "HubHealthAgent/1.0" },
    });
    return {
      id: site.id,
      name: site.name,
      status: (res.ok || res.status < 400 ? "up" : "down") as "up" | "down",
      statusCode: res.status,
      latency: Date.now() - start,
    };
  } catch {
    return { id: site.id, name: site.name, status: "down" as const, statusCode: 0, latency: Date.now() - start };
  }
}

async function triggerRedeploy(projectName: string) {
  if (!VERCEL_TOKEN) return false;
  try {
    const listRes = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${projectName}&limit=1&state=READY`,
      { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
    );
    const list = await listRes.json() as { deployments?: { uid: string }[] };
    const uid = list.deployments?.[0]?.uid;
    if (!uid) return false;
    const r = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ deploymentId: uid, name: projectName, target: "production" }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

async function telegram(msg: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: msg, parse_mode: "HTML" }),
  }).catch(() => {});
}

export async function GET(req: NextRequest) {
  // Vercel automatically validates CRON_SECRET via Authorization header
  const secret = req.headers.get("authorization");
  if (process.env.CRON_SECRET && secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await Promise.all(SITES.map(checkSite));
  const down = results.filter((r) => r.status === "down");

  for (const d of down) {
    const site = SITES.find((s) => s.id === d.id)!;
    const redeployed = await triggerRedeploy(site.vercelProject);
    await telegram(
      redeployed
        ? `🔴 <b>${site.name}</b> DOWN — auto-redeploy triggered`
        : `🔴 <b>${site.name}</b> DOWN — manual check needed`
    );
  }

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    total: results.length,
    up: results.filter((r) => r.status === "up").length,
    down: down.length,
    downSites: down.map((d) => d.name),
  });
}
