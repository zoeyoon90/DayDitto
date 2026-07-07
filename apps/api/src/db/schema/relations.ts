import { relations } from 'drizzle-orm';
import { users } from './users';
import { dailyLogs } from './dailyLogs';
import { aiUsageLogs } from './aiUsageLogs';

export const usersRelations = relations(users, ({ many }) => ({
  dailyLogs: many(dailyLogs),
  aiUsageLogs: many(aiUsageLogs),
}));

export const dailyLogsRelations = relations(dailyLogs, ({ one, many }) => ({
  user: one(users, {
    fields: [dailyLogs.userId],
    references: [users.id],
  }),
  aiUsageLogs: many(aiUsageLogs),
}));

export const aiUsageLogsRelations = relations(aiUsageLogs, ({ one }) => ({
  user: one(users, {
    fields: [aiUsageLogs.userId],
    references: [users.id],
  }),
  dailyLog: one(dailyLogs, {
    fields: [aiUsageLogs.dailyLogId],
    references: [dailyLogs.id],
  }),
}));
