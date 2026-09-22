import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { aiChat } from "@/lib/aiCascade";
import { SITES } from "@/lib/sites";
import { getPlatform } from "@/lib/marketingPlatforms";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { siteId, platform, angle } = await req.json();
    if (!siteId || !platform) {
      return NextResponse.json({ error: "siteId, platform required" }, { status: 400 });
    }

    const platformDef = getPlatform(platform);
    if (!platformDef) {
      return NextResponse.json({ error: `unknown platform: ${platform}` }, { status: 400 });
    }
    const platformPrompt = platformDef.aiPrompt;

    const site = SITES.find((s) => s.id === siteId);
    if (!site) {
      return NextResponse.json({ error: `unknown siteId: ${siteId}` }, { status: 400 });
    }

    const system =
      "You write marketing launch copy for indie/solo-built SaaS products. Be specific and concrete, never generic AI-marketing filler ('revolutionize', 'game-changer', 'unlock your potential'). Output plain text only — no markdown headers, no explanations, just the requested copy.";

    const user = [
      `Product: ${site.name}`,
      `Tagline: ${site.tagline}`,
      `Category: ${site.category}`,
      `URL: ${site.url}`,
      angle ? `Specific angle to emphasize: ${angle}` : "",
      "",
      platformPrompt,
    ]
      .filter(Boolean)
      .join("\n");

    const text = await aiChat(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      700
    );

    return NextResponse.json({ ok: true, text, site: site.name, platform });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
