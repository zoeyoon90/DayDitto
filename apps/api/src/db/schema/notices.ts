import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const notices = pgTable('notices', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  resentAt: timestamp('resent_at', { withTimezone: true }),
});
