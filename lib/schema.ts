import { pgTable, text, integer, timestamp, uuid, index } from 'drizzle-orm/pg-core'

export const accessCodes = pgTable('access_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  project: text('project'), // null = valid on any project
  daysUnlocked: integer('days_unlocked').notNull(),
  feature: text('feature').notNull().default('pro'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  revokedAt: timestamp('revoked_at'),
})

// Per-project login/session events, POSTed by each project's own auth flow.
// Admin visibility only — "who logged into which project, when."
export const loginEvents = pgTable('login_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  project: text('project').notNull(),
  userEmail: text('user_email'),
  event: text('event').notNull().default('login'), // login | signup | logout
  ip: text('ip'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  projectIdx: index('login_events_project_idx').on(t.project),
  createdAtIdx: index('login_events_created_at_idx').on(t.createdAt),
}))

// Metadata-only registry: which key exists for which project/provider, and a
// masked preview. Never stores the live secret value here — the real secret
// stays in that project's own Vercel env vars. "Try as admin" reads the
// masked value for display; exercising the live functionality happens by
// deep-linking into the project's own admin surface, not by Hub replaying
// the raw key server-side (smaller blast radius if Hub itself is compromised).
export const apiKeyRegistry = pgTable('api_key_registry', {
  id: uuid('id').defaultRandom().primaryKey(),
  project: text('project').notNull(),
  provider: text('provider').notNull(), // e.g. groq, gemini, stripe, resend
  envVarName: text('env_var_name').notNull(),
  maskedValue: text('masked_value'), // e.g. "gsk_****ab12"
  notes: text('notes'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  projectIdx: index('api_key_registry_project_idx').on(t.project),
}))
