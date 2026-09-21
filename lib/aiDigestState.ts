// Edge Config read/write for AI Daily Digest state — same raw-fetch pattern as
// app/api/toggle/route.ts (Vercel Edge Config Items API via EDGE_CONFIG_ID + VERCEL_TOKEN).
// Keys prefixed `aidigest_` so they sit alongside existing `toggle_*` keys without collision.
//
// Read is wrapped in unstable_cache per §0-EDGE-CONFIG-QUOTA (10min revalidate, cron-triggered
// so real risk is low but the rule carries no cron exception). Every write calls revalidateTag
// to bust that cache immediately — without it, the cron route's own read-after-write within the
// same 10min window would see stale state and could resend the same topic twice (caught live:
// first run sent, but /api/ai-digest-settings and a second GET both echoed the pre-write
// defaults for the full window).

import { unstable_cache, revalidateTag } from 'next/cache'
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
  if (!edgeConfigId || !vercelToken) {
    throw new Error(
      `[ai-digest] EDGE_CONFIG_ID or VERCEL_TOKEN missing (edgeConfigId=${edgeConfigId ? 'set' : 'MISSING'}, vercelToken=${vercelToken ? 'set' : 'MISSING'}) — refusing to fall back to default state, that silently re-sends topic 0 forever`
    )
  }
  return { edgeConfigId, vercelToken }
}

async function fetchDigestState(): Promise<DigestState> {
  const env = edgeConfigEnv()
  const res = await fetch(
    `https://api.vercel.com/v1/edge-config/${env.edgeConfigId}/items?prefix=aidigest_`,
    { headers: { Authorization: `Bearer ${env.vercelToken}` } }
  )
  if (!res.ok) {
    throw new Error(`[ai-digest] Edge Config read failed: ${res.status} ${await res.text().catch(() => '')}`)
  }
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
}

const CACHE_TAG = 'aidigest-state'

export const getDigestState = unstable_cache(fetchDigestState, [CACHE_TAG], {
  revalidate: 600,
  tags: [CACHE_TAG],
})

export async function updateDigestState(patch: Partial<DigestState>): Promise<boolean> {
  const env = edgeConfigEnv()
  const items = Object.entries(patch).map(([key, value]) => ({
    operation: 'upsert',
    key: `aidigest_${key}`,
    value,
  }))
  if (!items.length) return true
  const res = await fetch(`https://api.vercel.com/v1/edge-config/${env.edgeConfigId}/items`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${env.vercelToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  })
  if (!res.ok) {
    throw new Error(`[ai-digest] Edge Config write failed: ${res.status} ${await res.text().catch(() => '')}`)
  }
  // { expire: 0 } for immediate invalidation (not profile:'max', which is stale-while-
  // revalidate — too slow here since the cron route may read its own write back soon after).
  revalidateTag(CACHE_TAG, { expire: 0 })
  return true
}
