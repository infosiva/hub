import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { checkChain } from "@/lib/aiChainHealth";

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

  const results = await checkChain();
  const failed = results.filter((r) => !r.ok);
  const providersDown = [...new Set(results.map((r) => r.provider))]
    .filter((p) => results.filter((r) => r.provider === p).every((r) => !r.ok));

  if (isCron && failed.length && TG_TOKEN && TG_CHAT) {
    const lines = failed.map((f) => `• ${f.provider}/${f.model}: ${f.error}`).join("\n");
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TG_CHAT,
        text: `⚠️ AI chain: ${failed.length}/${results.length} models failing${providersDown.length ? `, providers fully down: ${providersDown.join(", ")}` : ""}\n${lines}`,
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ checkedAt: new Date().toISOString(), results, providersDown });
}
