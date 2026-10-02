import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { checkChain, openRouterQuota } from "@/lib/aiChainHealth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_AI_DIGEST_BOT_TOKEN || "";
const TG_CHAT = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_AI_DIGEST_CHAT_ID || "";

// Admin (panel "Test now") or Vercel cron (Bearer CRON_SECRET). Cron run alerts Telegram on failures.
export async function GET(req: NextRequest) {
  const isCron = !!process.env.CRON_SECRET && req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
  if (!isCron) {
    const denied = requireAdmin(req);
    if (denied) return denied;
  }

  const [results, openrouter] = await Promise.all([checkChain(), openRouterQuota()]);
  const failed = results.filter((r) => !r.ok);
  const quotaLow = !!openrouter && openrouter.remaining < openrouter.limit * 0.2;
  const spent = !!openrouter && openrouter.spentUsd > 0;
  const providersDown = [...new Set(results.map((r) => r.provider))]
    .filter((p) => results.filter((r) => r.provider === p).every((r) => !r.ok));

  if (isCron && (failed.length || quotaLow || spent) && TG_TOKEN && TG_CHAT) {
    const lines = [
      ...failed.map((f) => `• ${f.provider}/${f.model}: ${f.error}`),
      ...(quotaLow ? [`• OpenRouter free quota low: ${openrouter!.remaining}/${openrouter!.limit} left today`] : []),
      ...(spent ? [`• OpenRouter key has SPENT $${openrouter!.spentUsd.toFixed(4)} (should be $0)`] : []),
    ].join("\n");
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TG_CHAT,
        text: `⚠️ AI chain: ${failed.length}/${results.length} models failing${providersDown.length ? `, providers fully down: ${providersDown.join(", ")}` : ""}\n${lines}`,
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ checkedAt: new Date().toISOString(), results, providersDown, openrouter });
}
