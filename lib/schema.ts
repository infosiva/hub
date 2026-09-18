import { pgTable, text, integer, timestamp, uuid } from 'drizzle-orm/pg-core'

export const accessCodes = pgTable('access_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  project: text('project'), // null = valid on any project
  daysUnlocked: integer('days_unlocked').notNull(),
  feature: text('feature').notNull().default('pro'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  revokedAt: timestamp('revoked_at'),
})
