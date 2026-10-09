# HANDOFF — hub design lock + animated scope
**Date:** 2026-10-09  **Status:** COMPLETE (documentation of current UI)
**Goal:** Record the locked design and ANIMATED SCOPE of the hub control plane (production-gate item 19).

## Design lock
- Source of truth: `agents/design-system` (MASTER.md); pointer in `DESIGN.md`.
- Accent `#6366f1` on bg `#0b1120` (ops control plane, dark). Layout: app-shell dashboard (`DashboardGrid`, `SiteCard` grid, panels: Providers, AiHealth, AiDigest, DevStack, GlobalFlags, GlobalContent, LayoutPicker). Long lists scroll inside their panels.
- Logo: `components/Logo.tsx`. Favicon static. Hub theme overridable via Edge Config `theme_hub` (`lib/theme-loader.ts`, cached 600s).
- Routes: dashboard, portfolio, themes, status, marketing, login, login-events, access-codes, admin-codes, api-keys, privacy, terms.

## ANIMATED SCOPE
- What moves: `AnimatedBg` (aurora/mesh/dotgrid/gradient-shift), status-dot pulse on site health, card hover/press feedback, ChatBot panel open/close.
- Why: bg gives depth without competing with data; status pulse signals live health; press/hover confirms interactivity.
- Trigger: bg ambient (default `none`, hub-set `layout.bgAnimation`, speed `bgSpeed`); pulse on live sites; hover/press on pointer.
- Reduced motion: `AnimatedBg` and `ChatBot` both disable animation/transition under `prefers-reduced-motion: reduce`.
- Not animated: data tables, numbers, forms (dense ops UI, motion kept minimal).

## Agents per phase
design: UI Designer · build: Frontend Developer · QA: Evidence Collector, Accessibility Auditor · gate: Reality Checker.

## ai-core
Exempt (see DESIGN.md): no document upload/RAG; chat/digest on local free chain.

## Open gaps (owner-blocked)
- Edge Config / Vercel env changes and deploy need owner (vercel login).
