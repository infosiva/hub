# Scoping: centralizing AI model routing into Hub

**Date:** 2026-09-22
**Status:** SCOPE ONLY — not implemented, per task instruction.

## What exists today (read in full before writing this)

Two genuinely different systems, both called "model routing" but solving
different problems:

### 1. `ai-platform-template/lib/ai.ts` — per-project runtime AI fallback
Each deployed project (kwizzo, aicoachlab, agenttrace, etc.) imports its own
copy of `ai.ts`. At request time it:
- Reads **that project's own Edge Config store** for `fallback_order`,
  `disabled_providers`, and per-provider `<name>_tiers` overrides (5min cache).
- Falls back through a 16-provider cascade (Ollama → Groq → Gemini → ... →
  Anthropic), free-first, skipping exhausted/rate-limited providers with a
  5min cooldown, alerting via Telegram when it falls through to paid tiers.
- Already fully config-driven, already cached correctly — this file's runtime
  behavior is NOT hardcoded, only its *defaults* are (sensible fallback if
  Edge Config has nothing set).

**This is per-project by design** — each project's Edge Config store, own
provider keys, own quota/exhaustion state (in-memory `Map`, per server
instance, per project deployment).

### 2. `orchestrator/` — local Claude Code task-tiering (different axis entirely)
Not a runtime app AI cascade at all. It's a dev-tool: takes a task description
(from a CLI or Claude Code session), classifies it trivial/moderate/hard via
keyword heuristics (`router.py`, no LLM call, deterministic), and picks which
*Claude Code model* (fable-5 / sonnet-5 / opus-4-8) should execute that task.
Runs locally (`orchestrator dashboard` on :8731), reads/writes `stats.db`
locally, has zero relationship to any deployed project's runtime AI calls.

**These two systems don't share config, code, or a data model today.** Any
"centralization" plan has to treat them separately — conflating them would be
a mistake.

## Option A — Centralize (1): per-project AI fallback config into Hub

**What it would mean:** instead of N projects each reading their own Edge
Config store, all projects read `fallback_order`/`disabled_providers`/
`*_tiers` from ONE shared store that Hub's admin UI writes to — a single
"kill Anthropic globally" or "bump Gemini above Groq everywhere" toggle.

**Pros:** one dashboard for provider health/routing across all ~40+ projects,
faster incident response (a provider outage → one Hub toggle instead of N
Edge Config edits), Hub already has a `ProvidersPanel` component and reads
provider status somehow (worth checking what it currently shows before
building this — may already be halfway there).

**Cons / risks:**
- **This is the exact failure mode `§0-EDGE-CONFIG-QUOTA` was written to
  prevent.** That incident happened because ALL ~43 projects read ONE shared
  Edge Config store uncached — pausing the whole Vercel account. Moving AI
  routing config to a single shared store re-creates that architecture,
  just for a different config domain. Any implementation MUST treat this as
  the top risk and cache aggressively (the existing 5min TTL in `ai.ts` is a
  reasonable floor, but a shared store means 40x the read volume for the same
  cache window — the math on quota consumption needs to be redone, not
  assumed safe because "it's already cached").
- Per-project autonomy is lost — a project with an unusual key setup (e.g. one
  project pinned to a specific model version for reproducibility, or one
  using a provider none of the others use) now has to either opt out or live
  with global config, adding a per-project-override layer back on top, which
  erodes most of the simplicity gain.
- Blast radius: a bad global `fallback_order` push breaks AI for every
  project simultaneously, not just one. Same class of risk as the Edge Config
  incident, different payload.
- Exhaustion/cooldown state (`EXHAUSTED_UNTIL` Map) is currently per-server-
  instance, per-project — centralizing config doesn't centralize this state,
  so "Groq is exhausted for project X" wouldn't automatically inform project
  Y's routing decisions without a much bigger change (shared state store,
  real-time propagation) that's arguably a different project entirely.

**Effort:** medium if config-only (new Edge Config store + Hub UI tab +
switch `ai.ts`'s `getEdgeConfig()` to point at the shared store, keep local
override capability) — roughly 1-2 days. Large if attempting to also
centralize exhaustion/cooldown state — different project, don't bundle it in.

## Option B — Leave (1) alone, build Hub as a read-only observability layer

Instead of Hub *controlling* routing, Hub polls each project's
`getProviderStatus()` (already exported from `ai.ts`) via each project's own
API and displays cross-portfolio provider health/model usage in one place —
no write path, no shared config store, no new blast radius. Admin still edits
per-project Edge Config directly (via Hub's existing `/themes`-style editor,
or Vercel dashboard) when a change is needed, but sees the aggregate picture
in Hub first.

**Pros:** zero new failure mode, reuses `getProviderStatus()` which already
exists, much smaller build (a fetch-and-display panel, similar to the
existing `ProvidersPanel`/`fetchAnalytics()` pattern in `app/page.tsx`).
**Cons:** doesn't achieve "control plane" — admin still edits N places to
make a cross-portfolio change, just sees them in one dashboard first.

**Effort:** small — 2-4 hours, following the exact pattern already in
`hub/app/page.tsx`'s `fetchStatus`/`fetchAnalytics`/`fetchHealth` (cached
fetch → per-site map → render). Recommend this as the pragmatic first step
regardless of whether Option A is pursued later.

## Option C — Centralize (2): orchestrator task-tiering into Hub

Doesn't make sense as a "control plane" concept — orchestrator is a local dev
tool tied to one person's Claude Code sessions (`stats.db` is local session
history, "task tiering" isn't a live production concern the way AI provider
routing is). If anything, the useful integration is the *reverse* of
centralization: point orchestrator's dashboard link from Hub (a nav link, "Dev
Tools → Orchestrator @ localhost:8731") rather than trying to move its logic
into a deployed multi-tenant Hub. Recommend not pursuing centralization here
at all — flagging as a non-fit rather than a scoped option.

## Recommendation (not a decision — for the reader to make)

1. Ship **Option B** first (read-only observability) — small, safe, immediately
   useful, and it's the natural first half of Option A if that's wanted later.
2. Only pursue **Option A** (real control-plane writes) if/when there's an
   actual recurring pain point of editing N Edge Config stores by hand for
   the same change — and if so, budget real time to redo the quota-safety
   math per `§0-EDGE-CONFIG-QUOTA`, don't assume the existing 5min TTL scales
   to 40x read volume from one shared store.
3. Skip **Option C** — different problem domain, a nav link is enough.

No code changed as part of this doc, per the "scope only" instruction.
