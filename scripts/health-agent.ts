/**
 * Health Agent — checks all sites, auto-redeployes if down, logs improvement proposals.
 *
 * Run: npx ts-node scripts/health-agent.ts
 * Cron (VPS): 0 * * * * cd /root/agents/hub && npx ts-node scripts/health-agent.ts >> /var/log/hub-health.log 2>&1
 */

import * as fs from "fs";
import * as path from "path";
import { SITES, type Site } from "../lib/sites";

const VERCEL_TOKEN = process.env.VERCEL_TOKEN ?? "";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? "";
const PROPOSALS_FILE = path.join(__dirname, "../public/proposals.json");

interface SiteResult {
  id: string;
  name: string;
  url: string;
  status: "up" | "down";
  statusCode: number;
  latency: number;
  checkedAt: string;
}

interface Proposal {
  siteId: string;
  siteName: string;
  proposals: { label: string; priority: "high" | "medium" | "low" }[];
  generatedAt: string;
}

async function checkSite(site: Site): Promise<SiteResult> {
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
      url: site.url,
      status: res.ok || res.status < 400 ? "up" : "down",
      statusCode: res.status,
      latency: Date.now() - start,
      checkedAt: new Date().toISOString(),
    };
  } catch (e) {
    return {
      id: site.id,
      name: site.name,
      url: site.url,
      status: "down",
      statusCode: 0,
      latency: Date.now() - start,
      checkedAt: new Date().toISOString(),
    };
  }
}

async function triggerVercelRedeploy(projectName: string): Promise<boolean> {
  if (!VERCEL_TOKEN) return false;
  try {
    // Get latest deployment
    const listRes = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${projectName}&limit=1&state=READY`,
      { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
    );
    const listData = await listRes.json() as { deployments?: { uid: string; url: string }[] };
    const latest = listData.deployments?.[0];
    if (!latest) return false;

    // Redeploy
    const redeployRes = await fetch(`https://api.vercel.com/v13/deployments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ deploymentId: latest.uid, name: projectName, target: "production" }),
    });
    return redeployRes.ok;
  } catch {
    return false;
  }
}

async function sendTelegram(message: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: "HTML" }),
    }
  ).catch(() => {});
}

function buildProposals(): Proposal[] {
  return SITES.map((site) => ({
    siteId: site.id,
    siteName: site.name,
    proposals: site.tips,
    generatedAt: new Date().toISOString(),
  }));
}

async function main() {
  console.log(`[${new Date().toISOString()}] Health agent starting — checking ${SITES.length} sites`);

  // Check all sites in parallel
  const results = await Promise.all(SITES.map(checkSite));

  const downSites = results.filter((r) => r.status === "down");
  const upSites = results.filter((r) => r.status === "up");

  console.log(`✓ Up: ${upSites.length}  ✗ Down: ${downSites.length}`);

  // Auto-fix: trigger Vercel redeploy for down sites
  for (const down of downSites) {
    const site = SITES.find((s) => s.id === down.id)!;
    console.log(`[DOWN] ${site.name} (${site.url}) — triggering Vercel redeploy for "${site.vercelProject}"`);

    const redeployed = await triggerVercelRedeploy(site.vercelProject);
    const msg = redeployed
      ? `🔴 <b>${site.name}</b> is DOWN\n✅ Auto-redeploy triggered for <code>${site.vercelProject}</code>`
      : `🔴 <b>${site.name}</b> is DOWN\n⚠️ Could not auto-redeploy (check VERCEL_TOKEN)`;

    console.log(redeployed ? "  → Redeploy triggered" : "  → Redeploy failed (no token?)");
    await sendTelegram(msg);
  }

  if (downSites.length === 0) {
    console.log("All sites healthy — no action needed");
  }

  // Write improvement proposals (static, read by dashboard)
  const proposals = buildProposals();
  fs.mkdirSync(path.dirname(PROPOSALS_FILE), { recursive: true });
  fs.writeFileSync(PROPOSALS_FILE, JSON.stringify({ updatedAt: new Date().toISOString(), proposals }, null, 2));
  console.log(`Proposals written to ${PROPOSALS_FILE}`);

  // Write last-check summary for dashboard
  const summary = {
    checkedAt: new Date().toISOString(),
    total: results.length,
    up: upSites.length,
    down: downSites.length,
    results,
  };
  fs.writeFileSync(
    path.join(__dirname, "../public/health-check.json"),
    JSON.stringify(summary, null, 2)
  );

  console.log(`[${new Date().toISOString()}] Done`);
}

main().catch((e) => {
  console.error("Health agent error:", e);
  process.exit(1);
});
