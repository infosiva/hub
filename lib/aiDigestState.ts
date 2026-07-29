// Edge Config read/write for AI Daily Digest state — same raw-fetch pattern as
// app/api/toggle/route.ts (Vercel Edge Config Items API via EDGE_CONFIG_ID + VERCEL_TOKEN).
// Keys prefixed `aidigest_` so they sit alongside existing `toggle_*` keys without collision.

import type { DigestLevel } from './aiDigestTopics'

export type DigestState = {
  freq: number // 1-3 per day
  level: DigestLevel
  lastTopicIndex: number
  lastTopic: string | null
  lastAnswer: string | null // used to build tomorrow's recall quiz
  lastSentDate: string | null // YYYY-MM-DD (UTC) of most recent send
  sentToday: number // count of sends on lastSentDate
}

const DEFAULT_STATE: DigestState = {
  freq: 1,
  level: 'beginner',
  lastTopicIndex: -1,
  lastTopic: null,
  lastAnswer: null,
  lastSentDate: null,
  sentToday: 0,
}

function edgeConfigEnv() {
  const edgeConfigId = process.env.EDGE_CONFIG_ID
  const vercelToken = process.env.VERCEL_TOKEN
  if (!edgeConfigId || !vercelToken) return null
  return { edgeConfigId, vercelToken }
}

export async function getDigestState(): Promise<DigestState> {
  const env = edgeConfigEnv()
  if (!env) return DEFAULT_STATE
  try {
    const res = await fetch(
      `https://api.vercel.com/v1/edge-config/${env.edgeConfigId}/items?prefix=aidigest_`,
      { headers: { Authorization: `Bearer ${env.vercelToken}` }, cache: 'no-store' }
    )
    if (!res.ok) return DEFAULT_STATE
    const data = await res.json()
    const items: Record<string, unknown> = {}
    for (const item of data.items ?? []) {
      items[(item.key as string).replace('aidigest_', '')] = item.value
    }
    return {
      freq: typeof items.freq === 'number' ? items.freq : DEFAULT_STATE.freq,
      level: (items.level as DigestLevel) ?? DEFAULT_STATE.level,
      lastTopicIndex: typeof items.lastTopicIndex === 'number' ? items.lastTopicIndex : DEFAULT_STATE.lastTopicIndex,
      lastTopic: (items.lastTopic as string) ?? null,
      lastAnswer: (items.lastAnswer as string) ?? null,
      lastSentDate: (items.lastSentDate as string) ?? null,
      sentToday: typeof items.sentToday === 'number' ? items.sentToday : 0,
    }
  } catch {
    return DEFAULT_STATE
  }
}

export async function updateDigestState(patch: Partial<DigestState>): Promise<boolean> {
  const env = edgeConfigEnv()
  if (!env) return false
  const items = Object.entries(patch).map(([key, value]) => ({
    operation: 'upsert',
    key: `aidigest_${key}`,
    value,
  }))
  if (!items.length) return true
  try {
    const res = await fetch(`https://api.vercel.com/v1/edge-config/${env.edgeConfigId}/items`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${env.vercelToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
    return res.ok
  } catch {
    return false
  }
}
