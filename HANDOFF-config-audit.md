# Config-via-Hub audit — agenttrace

**Date:** 2026-09-22
**Scope:** `agents/agenttrace/apps/dashboard/` — what's hardcoded/env-driven today
that should instead be Hub/Edge-Config-driven (admin can change live, no deploy).

## Already Hub/Edge-Config-driven (no action needed)
- **Feature flags** — `src/lib/flags.ts`. Reads Edge Config keys `toggle_${siteId}_${flag}`,
  same naming convention Hub's own `lib/flags` uses elsewhere in the portfolio.
  Module-level 60s cache (`_cache`/`_cacheAt`), functionally equivalent to
  `unstable_cache` — already compliant with `§0-EDGE-CONFIG-QUOTA`, just not
  using the `next/cache` primitive by name. No change needed.
- **Content overrides** — `src/lib/content.ts`. Reads `content_${SITE_ID}_*` keys
  from Edge Config, same 60s module cache pattern. Already Hub-drivable.

## Hardcoded — should move to Hub-driven config

### 1. Rate limits (`src/lib/rateLimit.ts`)
`AI_LIMITER`, `API_LIMITER`, `CHATBOT_LIMITER` are hardcoded constants (window +
max-request counts baked into the file). To bump a limit during a launch spike
or throttle during an abuse incident, this requires a code change + deploy.

**Fix shape:** add `ratelimit_ai_max`, `ratelimit_api_max`,
`ratelimit_chatbot_max` (etc.) as Edge Config keys, read via the same
cached-fetch pattern already used in `flags.ts`/`content.ts` (copy that
pattern exactly — don't invent a new caching approach), fall back to the
current hardcoded constants if the Edge Config key is absent. Small change,
~30 min, same shape as the existing flags/content readers.

### 2. AI model routing (`src/app/api/chat/route.ts`, `src/lib/ai-diagnosis.ts`,
`src/app/api/v1/steps/[id]/replay/route.ts`)
Model IDs are hardcoded string literals inline at each call site:
- `chat/route.ts`: `llama-3.1-8b-instant` (Groq) → `gemini-2.0-flash` → Cerebras,
  fixed cascade, fixed models, no override.
- `ai-diagnosis.ts`: hardcoded Groq model.
- `replay/route.ts`: hardcoded `llama-3.3-70b-versatile`.

To swap a model portfolio-wide (e.g. a Groq model gets deprecated, or a
cheaper/faster option becomes available) currently means find-and-replace
across N files across N projects, in agenttrace and every other project doing
the same thing.

**Fix shape:** this is the exact problem Feature 5's scoping doc
(`hub/HANDOFF-model-routing-centralization.md`) addresses — see that doc for
options. Don't fix agenttrace in isolation; it's one instance of a
portfolio-wide pattern, and a one-off fix here would need to be redone once
the centralized approach lands. Flagging here, deferring the actual fix to
whatever Feature 5 decides.

### 3. Promo codes (`src/lib/promoCode.ts`)
Reads from `process.env.PROMO_CODES` (JSON array) — better than a hardcoded
array in source, but still requires a Vercel env var edit + redeploy to add/
remove/change a code. No live admin toggle.

**Fix shape:** move to Edge Config key `promo_codes_agenttrace` (JSON blob,
same shape as current env var), read with the same cached-fetch pattern as
`flags.ts`. Hub's existing `/api/flags` or a small addition to it could expose
a promo-code editor UI reusing the pattern from `hub/app/themes/page.tsx`'s
tab structure. Small-to-medium change (~1-2 hrs including a minimal Hub UI
tab) — did not implement in this session, flagging per the "not necessarily
full implementation unless small" instruction — this one crosses into
medium-effort UI work, out of scope for this pass.

## Not audited (out of scope for this pass)
Only `agenttrace/apps/dashboard/` was audited, per the explicit task scope.
Other projects likely have the same 3 gaps (hardcoded rate limits, hardcoded
model IDs, env-var-only promo codes) — this audit doesn't extend to them, but
the same fix shapes above should generalize directly if/when that's done
project-by-project or centrally.
