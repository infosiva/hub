/**
 * Vercel Cron: daily domain/AdSense classification across the whole portfolio.
 * Schedule set in vercel.json: "0 7 * * *"
 *
 * Checks every site in SITES, classifies working / broken / unregistered,
 * persists the snapshot to Edge Config for /app/status to render instantly,
 * and (unless Telegram notifications are disabled) alerts on regressions —
 * a site that was "working" yesterday and isn't today.
 */
import { NextResponse } from "next/server";
import { SITES } from "@/lib/sites";
import { checkAllDomains } from "@/lib/domainCheck";
import { getDomainCheckSnapshot, saveDomainCheckSnapshot } from "@/lib/domainCheckState";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const previous = await getDomainCheckSnapshot();
  const results = await checkAllDomains(SITES.map((s) => ({ id: s.id, name: s.name, url: s.url })));

  const snapshot = { checkedAt: new Date().toISOString(), results };
  const saved = await saveDomainCheckSnapshot(snapshot);

  // Only alert on real breakage (broken/unregistered) — a working site that
  // merely drops its AdSense marker (needs_adsense) is not down, don't alert.
  const regressions = previous
    ? results.filter((r) => {
        const prev = previous.results.find((p) => p.id === r.id);
        const wasOk = prev?.status === "working" || prev?.status === "needs_adsense";
        const nowBroken = r.status === "broken" || r.status === "unregistered";
        return wasOk && nowBroken;
      })
    : [];

  if (regressions.length > 0 && process.env.TELEGRAM_NOTIFICATIONS_DISABLED !== "true") {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (token && chatId) {
      const lines = regressions.map((r) => `❌ ${r.name}: ${r.reason}`).join("\n");
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `Domain check regression (${regressions.length}):\n${lines}`,
        }),
      }).catch(() => {});
    }
  }

  const summary = {
    working: results.filter((r) => r.status === "working").length,
    needs_adsense: results.filter((r) => r.status === "needs_adsense").length,
    broken: results.filter((r) => r.status === "broken").length,
    unregistered: results.filter((r) => r.status === "unregistered").length,
  };

  return NextResponse.json({ checkedAt: snapshot.checkedAt, saved, summary, regressions: regressions.map((r) => r.id) });
}
