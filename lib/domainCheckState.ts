import type { DomainCheckResult } from "./domainCheck";

const KEY = "domaincheck_snapshot";

function edgeConfigEnv() {
  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const vercelToken = process.env.VERCEL_TOKEN;
  if (!edgeConfigId || !vercelToken) return null;
  return { edgeConfigId, vercelToken };
}

export interface DomainCheckSnapshot {
  checkedAt: string;
  results: DomainCheckResult[];
}

export async function getDomainCheckSnapshot(): Promise<DomainCheckSnapshot | null> {
  const env = edgeConfigEnv();
  if (!env) return null;
  try {
    const res = await fetch(
      `https://api.vercel.com/v1/edge-config/${env.edgeConfigId}/item/${KEY}`,
      { headers: { Authorization: `Bearer ${env.vercelToken}` }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const body = await res.json();
    // The Edge Config item-read endpoint wraps the stored value in
    // { key, value, createdAt, updatedAt, edgeConfigId } — unwrap it.
    const snapshot = body && typeof body === "object" && "value" in body ? body.value : body;
    return snapshot as DomainCheckSnapshot;
  } catch {
    return null;
  }
}

export async function saveDomainCheckSnapshot(snapshot: DomainCheckSnapshot): Promise<boolean> {
  const env = edgeConfigEnv();
  if (!env) return false;
  try {
    const res = await fetch(`https://api.vercel.com/v1/edge-config/${env.edgeConfigId}/items`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${env.vercelToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ operation: "upsert", key: KEY, value: snapshot }] }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
