import { relations } from 'drizzle-orm';
import { users } from './users';
import { dailyLogs } from './dailyLogs';

export const usersRelations = relations(users, ({ many }) => ({
  dailyLogs: many(dailyLogs),
}));

export const dailyLogsRelations = relations(dailyLogs, ({ one }) => ({
  user: one(users, {
    fields: [dailyLogs.userId],
    references: [users.id],
  }),
}));
