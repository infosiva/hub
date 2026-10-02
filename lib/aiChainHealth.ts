// Live health of the free AI fallback chain: one tiny request per model.
// ponytail: chain mirrors the probed order (ai-core/scripts/probe-free-models.py, 2026-10-02);
// re-run the probe monthly and update this list when free catalogs churn.
export const CHAIN = [
  { provider: "groq", base: "https://api.groq.com/openai/v1", keyEnv: "GROQ_API_KEY",
    models: ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b"] },
  { provider: "gemini", base: "https://generativelanguage.googleapis.com/v1beta/openai", keyEnv: "GEMINI_API_KEY",
    models: ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.5-flash-lite"] },
  { provider: "nvidia", base: "https://integrate.api.nvidia.com/v1", keyEnv: "NVIDIA_API_KEY",
    models: ["nvidia/nemotron-3-super-120b-a12b", "nvidia/nemotron-3.5-lightning-30b-a3b"] },
  { provider: "openrouter", base: "https://openrouter.ai/api/v1", keyEnv: "OPENROUTER_API_KEY",
    models: ["nvidia/nemotron-3-super-120b-a12b:free", "inclusionai/ling-3.0-flash-sante:free"] },
  { provider: "cerebras", base: "https://api.cerebras.ai/v1", keyEnv: "CEREBRAS_API_KEY",
    models: ["gpt-oss-120b"] },
] as const;

export type ModelHealth = {
  provider: string; model: string; ok: boolean; ms: number; error?: string;
};

async function checkModel(base: string, key: string, provider: string, model: string): Promise<ModelHealth> {
  const start = Date.now();
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, max_tokens: 300, messages: [{ role: "user", content: "17*3? Reply with the number only." }] }),
      signal: AbortSignal.timeout(25_000),
      cache: "no-store",
    });
    const ms = Date.now() - start;
    if (!res.ok) return { provider, model, ok: false, ms, error: `HTTP ${res.status}` };
    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";
    return text.includes("51")
      ? { provider, model, ok: true, ms }
      : { provider, model, ok: false, ms, error: "wrong answer" };
  } catch (e) {
    return { provider, model, ok: false, ms: Date.now() - start, error: e instanceof Error ? e.name : "error" };
  }
}

export type OpenRouterQuota = { used: number; limit: number; remaining: number; spentUsd: number };

// Free :free requests used today + $ spent on this key. Shows whether the sites ever lean on OpenRouter (and if $10 credit is worth it).
export async function openRouterQuota(): Promise<OpenRouterQuota | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://openrouter.ai/api/v1/key", {
      headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(10_000), cache: "no-store",
    });
    if (!res.ok) return null;
    const d = (await res.json())?.data;
    const f = d?.free_model_daily_requests;
    if (!f) return null;
    return { used: f.used, limit: f.limit, remaining: f.remaining, spentUsd: d.usage ?? 0 };
  } catch {
    return null;
  }
}

export async function checkChain(): Promise<ModelHealth[]> {
  const jobs = CHAIN.flatMap(({ provider, base, keyEnv, models }) => {
    const key = process.env[keyEnv];
    if (!key) return models.map((model) => Promise.resolve<ModelHealth>({ provider, model, ok: false, ms: 0, error: `${keyEnv} not set` }));
    return models.map((model) => checkModel(base, key, provider, model));
  });
  return Promise.all(jobs);
}
