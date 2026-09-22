# HANDOFF — Hub roster-leak fix + 4 new features

**Date:** 2026-09-22  **Status:** COMPLETE
**Goal:** Fix public roster leak in Hub, then build 4 admin features + 2 scoping docs.

## Final status (all items closed out)
- Bug fix: done, pushed, deployed, e2e-verified (see below).
- Feature 1 (per-project login/usage analytics): mostly already built by a
  prior session (`login_events` table + `/api/login-events` ingest+read +
  `/api/analytics` visitors/pageviews + `/api/status`+`/api/health`). Real gap
  was zero projects actually calling the ingest endpoint — added
  `reportLoginEvent()` to `shared-ui/src/lib/analytics.ts` as the one-line
  integration point (committed to main repo, `3e40bb1`).
- Feature 2 (login/session visibility table): already fully built
  (`app/login-events/page.tsx` + route), admin-gated. No gap found.
- Feature 3 (API key registry + "try as admin"): already fully built
  (`app/api-keys/page.tsx` + route + `apiKeyRegistry` schema table) —
  deliberately metadata-only (never stores real secret values), "try as
  admin" implemented as a deep-link to the project's own live URL rather than
  Hub replaying a stored secret server-side. Confirmed this is the same
  conclusion I'd have reached independently — safer than a Hub-side secrets
  vault. No gap found, no changes made.
- Feature 4 (config audit of agenttrace): done, see `HANDOFF-config-audit.md`
  — 3 real gaps found (hardcoded rate limits, hardcoded model IDs, env-var-
  only promo codes), fix shapes documented, none implemented (per "findings,
  not necessarily full implementation" instruction — the rate-limit one is
  small enough to do in a future pass, the model-routing one defers to
  Feature 5, the promo-code one needs a small Hub UI addition).
- Feature 5 (model-routing centralization scoping): done, see
  `HANDOFF-model-routing-centralization.md` — 3 options laid out (centralize
  per-project AI fallback config into Hub / read-only observability layer /
  centralize orchestrator — recommended against), explicit connection back to
  the `§0-EDGE-CONFIG-QUOTA` incident as the top risk if Option A is chosen.
  No code changed, per scope-only instruction.

## Done (this session)

### Bug fix (COMPLETE, pushed, deployed, e2e-verified)
- Root cause of "roster leak": `proxy.ts` (Next 16 middleware equivalent) had a
  hardcoded fallback password (`?? "siva2026"`, banned pattern) and did NOT
  allowlist `/portfolio` (the intentionally-public page) — public visitors were
  being redirected to `/login` while a leaked password could expose the real
  admin dashboard (`/`, `/marketing`, `/themes`, `/status`, `/access-codes` etc).
- Fixed: fail-closed password check (`PASSWORD && cookie === PASSWORD`, empty
  fallback) + `/portfolio` added to the public allowlist.
- Confirmed via code read: `/portfolio` only renders `emoji/name/tagline/url/
  accentColor` per site — never tips/competitors/toggles/health/analytics. Safe
  to be public. `/marketing` and `/themes` (the two files originally flagged)
  are correctly gated by the same proxy — no separate fix needed there.
- Verified all ~20 `/api/*` admin routes already call `requireAdmin()` from
  `lib/auth-guard.ts` — API layer was never actually part of the leak.
- Found + fixed adjacent bug during mandated Playwright console check:
  `lib/sites.ts` had two `id: "aitoolkit"` entries (same product, same url/
  vercelProject) causing a React duplicate-key console error on every page
  that maps over `SITES`. Merged into one entry (kept newer tagline/emoji/
  accent + the high-priority "stale domain" tip, kept richer competitors/
  stack from the older entry).
- QA: `npm run build` green. Playwright: 375px + 1280px screenshots read
  (not just captured) on `/portfolio` — clean, no leaked internal data, 0
  console errors post-fix. `/` correctly redirects to `/login` in-browser.
- Committed (`e352944`, only `proxy.ts` + `lib/sites.ts` staged — NOT the
  rest of the dirty tree, see below) and pushed to `origin/main`. Vercel
  deploy went green (`hub-26em11yor-infosivas-projects.vercel.app` → Ready).
- `node scripts/e2e-verify.mjs --project hub --url https://ai-products-hub.vercel.app`
  → 9/10 pass. The 1 fail (P8, "1280px nav") is a false positive: the check
  assumes a marketing-site layout with a nav bar, but it's hitting `/` which
  now correctly redirects to `/login` (a bare centered login form for an
  internal gated tool — correctly has no site nav). Not a regression, not
  worth gaming with a fake nav element.

### Important: pre-existing uncommitted work in hub/, NOT mine, NOT touched
`git status` in `hub/` shows many other modified/deleted files (`app/admin-codes/
page.tsx`, `app/api/analytics/route.ts`, `app/api/auth/route.ts`, `app/api/cron/
health/route.ts`, and more) plus a deleted `HANDOFF.md` — this is leftover
uncommitted state from the PRIOR session's access-codes feature (see
`hub/HANDOFF-access-codes.md`, all steps checked except final push). I did
NOT commit or touch any of this — only staged my 2 files by exact path. Do not
assume this HANDOFF.md being rewritten conflicts with that other work; it's a
separate, still-uncommitted change set sitting in the same working tree.

## Not done — remaining work, in order

### Breadcrumb pass (small, skipped — low value)
Original ask included a "content/breadcrumb pass on all pages, remove anything
not needed for outside visitor." Only `/portfolio` is actually public post-fix
— everything else is admin-only behind the gate, so a breadcrumb audit for
"outside visitor" experience only applies to `/portfolio` and `/login`, both
of which were already visually verified clean in this session. Treating this
sub-item as satisfied; no further action unless told otherwise.

### Feature 1 — Per-project admin analytics (NOT STARTED)
Who logged into any portfolio project, when, + basic usage/performance
signals. Design goal: addable per-project without much bespoke work.
Architectural lean (not yet built, not yet committed to): a shared Postgres
table in Hub's existing Neon DB (already wired for access-codes feature —
check `hub/HANDOFF-access-codes.md` for the connection setup it already did),
e.g. `project_events(project_id, event_type, user_identifier, metadata jsonb,
created_at)`. Projects POST to a Hub ingest endpoint (`/api/ingest/event` or
similar) using the existing `x-hub-secret` / `HUB_INGEST_SECRET` pattern from
`requireIngestSecret()` in `lib/auth-guard.ts` — reuse that, don't invent a
new auth mechanism. Hub admin UI reads it back per-project.

### Feature 2 — Hub login/session visibility (NOT STARTED)
Table view, admin-only, showing login/session activity across projects (who +
when). Likely reuses the same `project_events` table/ingest path as Feature 1
(event_type = 'login'), not a separate system — check before building a
second schema.

### Feature 3 — Per-project API key registry + "try as admin" (NOT STARTED)
Store/manage an API key per project in Hub, let admin exercise that project's
live functionality directly from Hub. Needs: encrypted-at-rest storage for
per-project keys (do NOT store plaintext — check if Neon/Vercel has a secrets
primitive already in use elsewhere in this repo before inventing one), a Hub
UI action per project card that calls out to that project's API using the
stored key server-side (never expose the key to the browser).

### Feature 4 — Config-via-Hub audit of agenttrace (NOT STARTED)
Go through `agents/agenttrace/apps/dashboard/` and find hardcoded rate
limits/feature flags/model routing/promo codes that should be Hub/Edge-Config-
driven instead. Write findings to `hub/HANDOFF-config-audit.md` (not full
implementation unless small). NOT STARTED — no files read yet in agenttrace
for this specific audit.

### Feature 5 — Model-routing/orchestrator centralization SCOPE ONLY (NOT STARTED)
Write scoping doc at `hub/HANDOFF-model-routing-centralization.md`. Must read
`ai-platform-template/lib/ai.ts` and `/Users/sivaprakasam/projects/agents/
orchestrator/` first. Explicitly scope-only — do not implement. NOT STARTED.

## Files touched so far
- `hub/proxy.ts` — auth gate fix (committed, pushed)
- `hub/lib/sites.ts` — dedupe aitoolkit entry (committed, pushed)

## Resume from here if interrupted
Bug fix + QA fully shipped and verified live. Next: start Feature 1 (analytics
schema) — check whether Neon DB connection env vars already exist in this repo
(likely yes, from access-codes work) before creating new ones. Then Feature 2
(shares schema), Feature 3 (API key registry), Feature 4 (audit doc, no code),
Feature 5 (scoping doc, no code).
