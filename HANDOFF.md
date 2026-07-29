# HANDOFF — AI Daily Digest → Telegram
**Date:** 2026-07-28  **Status:** IN PROGRESS
**Goal:** Cron job sends 1-3x/day AI-topic digest (paragraph + example + real YouTube link + prior-day recall quiz) to Telegram bot @LetsLearnAIBot. Freq + level (beginner/intermediate/advanced) configurable from hub without redeploy (Edge Config).

## Approved plan (user confirmed)
- Freq: 1-3/day, configurable via Edge Config
- Topic engine: AI-generated curriculum (ordered beginner→advanced list), stepped sequentially, never repeats
- Level: starts beginner, switchable in hub
- Message: paragraph explanation + basic example + real YouTube video link (YouTube Data API v3) + recall quiz on previous day's topic
- Bot: @LetsLearnAIBot (new, user-created)

## Secrets (already obtained, go to env only — NEVER commit)
- `TELEGRAM_AI_DIGEST_BOT_TOKEN` = 8646200861:AAFBZLsEFOpziq8-NR7lrZfZq5Fb41an5aY
- `TELEGRAM_AI_DIGEST_CHAT_ID` = 8452559091
- `YOUTUBE_API_KEY` = **user still needs to generate** (console.cloud.google.com → enable YouTube Data API v3 → create key, free tier)

## Files to touch
- `hub/lib/aiDigestTopics.ts` — curriculum topic list (beginner/intermediate/advanced arrays)
- `hub/lib/aiDigestState.ts` — Edge Config read/write helpers (freq, level, lastTopicIndex, lastTopic+answer for recall)
- `hub/app/api/cron/ai-digest/route.ts` — main cron handler: pick topic → LLM generate (Groq→Gemini→Cerebras cascade) → YouTube API lookup → build recall quiz from yesterday's stored topic → send Telegram → advance state
- `hub/vercel.json` — add cron schedule(s) for ai-digest route
- `hub/app/(dashboard)/.../ai-digest-settings` (or existing admin-codes/settings pattern) — freq + level dropdown UI, POSTs to Edge Config
- `.env.shared` — add 3 new env vars (not committed as real values, format-only in docs)
- `set-vercel-env.ts` run to push real values to hub's Vercel project only

## Steps
- [x] Bot created, token + chat_id obtained
- [ ] YOUTUBE_API_KEY obtained from user
- [ ] lib/aiDigestTopics.ts — curriculum list written
- [ ] lib/aiDigestState.ts — Edge Config helpers
- [ ] app/api/cron/ai-digest/route.ts — handler built
- [ ] vercel.json cron schedule added
- [ ] Hub settings UI for freq/level
- [ ] Env vars pushed to Vercel (hub project only)
- [ ] Manual curl test of route → confirm real Telegram message received
- [ ] npm run build clean, push, verify Vercel green
- [ ] Confirm cron registered in Vercel dashboard

## Success criteria
- Manual trigger of /api/cron/ai-digest sends real message to Telegram with real YouTube link
- Hub UI can change freq (1-3) and level without code deploy
- Recall quiz on day 2 correctly references day 1's topic

## Resume from here if interrupted
Waiting on user for YOUTUBE_API_KEY. Once obtained, build lib files + route next.
