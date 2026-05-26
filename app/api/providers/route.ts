import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID ?? "";
const VERCEL_TOKEN = process.env.VERCEL_TOKEN ?? "";

const DEFAULT_PROVIDERS = [
  "ollama", "groq", "gemini", "cerebras", "together",
  "openrouter", "mistral", "nvidia", "kimi", "deepseek",
  "perplexity", "xai", "cohere", "openai", "anthropic"
];

async function readEdgeConfigKey(key: string): Promise<unknown> {
  if (!EDGE_CONFIG_ID || !VERCEL_TOKEN) return null;
  const res = await fetch(
    `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/item/${key}`,
    { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.value ?? null;
}

async function writeEdgeConfigKey(key: string, value: unknown) {
  if (!EDGE_CONFIG_ID || !VERCEL_TOKEN) return false;
  const res = await fetch(
    `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ operation: "upsert", key, value }] }),
    }
  );
  return res.ok;
}

// GET — read current provider order + disabled list
export async function GET() {
  const [orderRaw, disabledRaw] = await Promise.all([
    readEdgeConfigKey("fallback_order"),
    readEdgeConfigKey("disabled_providers"),
  ]);

  const fallbackOrder: string[] = Array.isArray(orderRaw) ? orderRaw : DEFAULT_PROVIDERS;
  const disabledProviders: string[] = Array.isArray(disabledRaw) ? disabledRaw : [];

  return NextResponse.json({ fallbackOrder, disabledProviders });
}

// PATCH — update provider order or toggle disabled
// body: { action: "reorder", order: string[] }
//    or { action: "disable", provider: string }
//    or { action: "enable", provider: string }
//    or { action: "add", provider: string }
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    const [orderRaw, disabledRaw] = await Promise.all([
      readEdgeConfigKey("fallback_order"),
      readEdgeConfigKey("disabled_providers"),
    ]);

    let fallbackOrder: string[] = Array.isArray(orderRaw) ? orderRaw : [...DEFAULT_PROVIDERS];
    let disabledProviders: string[] = Array.isArray(disabledRaw) ? disabledRaw : [];

    if (action === "reorder") {
      if (!Array.isArray(body.order)) return NextResponse.json({ error: "order array required" }, { status: 400 });
      fallbackOrder = body.order;
      await writeEdgeConfigKey("fallback_order", fallbackOrder);
    } else if (action === "disable") {
      if (!body.provider) return NextResponse.json({ error: "provider required" }, { status: 400 });
      if (!disabledProviders.includes(body.provider)) {
        disabledProviders = [...disabledProviders, body.provider];
      }
      await writeEdgeConfigKey("disabled_providers", disabledProviders);
    } else if (action === "enable") {
      if (!body.provider) return NextResponse.json({ error: "provider required" }, { status: 400 });
      disabledProviders = disabledProviders.filter((p) => p !== body.provider);
      await writeEdgeConfigKey("disabled_providers", disabledProviders);
    } else if (action === "add") {
      if (!body.provider) return NextResponse.json({ error: "provider required" }, { status: 400 });
      if (!fallbackOrder.includes(body.provider)) {
        fallbackOrder = [...fallbackOrder, body.provider];
        await writeEdgeConfigKey("fallback_order", fallbackOrder);
      }
    } else {
      return NextResponse.json({ error: "unknown action" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, fallbackOrder, disabledProviders });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
