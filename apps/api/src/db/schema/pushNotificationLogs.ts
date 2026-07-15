import { pgTable, uuid, timestamp, integer } from 'drizzle-orm/pg-core';

export const pushNotificationLogs = pgTable('push_notification_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  sentAt: timestamp('sent_at', { withTimezone: true }).notNull().defaultNow(),
  totalTargeted: integer('total_targeted').notNull().default(0),
  totalSent: integer('total_sent').notNull().default(0),
  totalExpired: integer('total_expired').notNull().default(0),
  totalFailed: integer('total_failed').notNull().default(0),
});
