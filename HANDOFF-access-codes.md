# HANDOFF — hub access-codes system (trial/beta codes, cross-project)
**Date:** 2026-09-18  **Status:** IN PROGRESS
**Goal:** Admin-managed trial/beta access codes from hub, validated by any project, no signup/paywall.

## Decisions locked
- Auth for admin endpoints: reuse existing `hub_auth` cookie (`app/api/auth/route.ts`, `DASHBOARD_PASSWORD` env) — no new auth.
- DB: no new Neon project/branch (no console/API access available this session). Reusing **aicoachlab's existing Neon DB** — new `access_codes` table only, isolated by table, zero new infra.
- `DATABASE_URL` for hub = aicoachlab's existing connection string (same Postgres instance, new table).

## Files to touch
- `hub/lib/db.ts` — Drizzle + Neon client (copy pattern from `taskflow/lib/db.ts`)
- `hub/lib/schema.ts` — `access_codes` table: code, project (nullable=global), daysUnlocked, feature, createdAt, revokedAt (nullable)
- `hub/drizzle.config.ts` — migration config
- `hub/app/api/access-codes/route.ts` — admin-only (hub_auth), GET list / POST create
- `hub/app/api/access-codes/validate/route.ts` — public, POST {code, project} → validate
- `hub/app/(dashboard)/access-codes/page.tsx` — admin UI, create/list/revoke
- `hub/.env.local` — add `DATABASE_URL` (aicoachlab's connection string)
- One example project wired to call validate endpoint (proves cross-project flow)

## Steps
- [x] Plan approved by user
- [x] Neon DB decision: reuse aicoachlab DB, new table (not new project/branch)
- [x] Install drizzle-orm, @neondatabase/serverless, drizzle-kit in hub/
- [x] lib/db.ts + lib/schema.ts + drizzle.config.ts
- [x] Run migration, create access_codes table (applied via sql.query, drizzle-kit push hit interactive-prompt issue vs aicoachlab's existing tables — used generate+manual apply instead)
- [x] app/api/access-codes/route.ts (admin CRUD — GET list/POST create/DELETE revoke, gated by hub_auth cookie)
- [x] app/api/access-codes/validate/route.ts (public validate, rate-limited 30/hr/IP)
- [x] app/access-codes/page.tsx (admin UI — no `(dashboard)` route group exists in this project, built at top level instead)
- [x] Verified end-to-end via curl: 401 unauth, login, create, list, public validate (valid), revoke, public validate (now invalid) — all correct, test row cleaned from live DB
- [x] npm run build — green, zero errors
- [x] Playwright screenshots 375+1280 captured and read — clean login gate, no layout issues (screenshots only show unauth view since Playwright has no hub_auth cookie; this is the correct/only unauthenticated state for a password-gated page)
- [x] Wire DATABASE_URL to Vercel env for hub project (production + preview, added as Sensitive)
- [x] Wire one project to call validate endpoint — chose **aicoachlab** (DB already lives in its Neon instance). Added `validateHubAccessCode()` to `lib/promoCode.ts` + wired into `app/api/promo/route.ts` as a fallback after local `PROMO_CODES` check (local-first, hub as cross-project fallback, 5s timeout, fails closed to `null` if hub unreachable). Defaults `HUB_URL` to production hub URL — no Vercel env needed for aicoachlab.
- [x] End-to-end verified: hub-issued code scoped to `project: "aicoachlab"` → validated via aicoachlab's local `/api/promo` → revoke via hub propagates immediately → invalid code rejected. Test row cleaned from live DB.
- [ ] git push (hub + aicoachlab), verify Vercel green, e2e-verify

## Success criteria
- Admin can create/revoke codes from hub UI
- Any project can POST to hub's public validate endpoint and get unlock payload
- Build green, deployed, live E2E pass

## Resume from here if interrupted
Next: install deps in hub/, write lib/db.ts + lib/schema.ts copying taskflow's pattern.
