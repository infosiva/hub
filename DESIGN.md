# DESIGN — Hub
Source of truth: `agents/design-system` (MASTER.md). This file is the project pointer.

- Accent: `#6366f1` on bg `#0b1120` (ops control plane, dark)
- Layout/palette/bg animation/GA4/flags: overridable by the hub via Edge Config `theme_hub` (loaded by `lib/theme-loader.ts`, applied in `app/layout.tsx`); hub values win over the defaults here.
- Background: `components/AnimatedBg.tsx` (hub `layout.bgAnimation`, reduced-motion safe, default `none` = unchanged look).
- Logo: `components/Logo.tsx`; favicon is a static icon (no `app/icon.tsx`).

## AI platform (ai-core) status
Exempt from ai-core adoption for now: the hub only routes/configures other sites and runs its chat/digest on the local free chain (Groq -> Gemini -> Cerebras, `lib/aiCascade.ts`). No document upload or RAG feature here. Revisit if hub gains retrieval.
