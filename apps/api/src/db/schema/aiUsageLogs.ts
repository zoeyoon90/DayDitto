import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { dailyLogs } from './dailyLogs';

export const callTypeEnum = pgEnum('call_type', ['translation', 'tts', 'feedback']);

export const aiUsageLogs = pgTable(
  'ai_usage_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // 일기 삭제돼도 usage 로그는 보존
    dailyLogId: uuid('daily_log_id').references(() => dailyLogs.id, {
      onDelete: 'set null',
    }),
    callType: callTypeEnum('call_type').notNull(),
    model: text('model').notNull(), // e.g. 'claude-haiku-4-5'
    tokensUsed: integer('tokens_used'), // 유료화 대비, 현재 nullable
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // MAU/기간별 쿼리: WHERE user_id = ? AND created_at >= ?
    index('ai_usage_logs_user_id_created_at_idx').on(t.userId, t.createdAt),
  ],
);
