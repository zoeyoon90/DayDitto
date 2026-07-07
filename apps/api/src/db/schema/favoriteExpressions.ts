import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { dailyLogs } from './dailyLogs';

export const favoriteExpressions = pgTable(
  'favorite_expressions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // 일기 삭제돼도 즐겨찾기 보존
    dailyLogId: uuid('daily_log_id').references(() => dailyLogs.id, {
      onDelete: 'set null',
    }),
    koreanText: text('korean_text').notNull(), // 원문 한국어 표현
    englishText: text('english_text').notNull(), // 번역된 영어 표현
    memo: text('memo'), // 유저 메모 (nullable)
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('fav_expr_user_id_idx').on(t.userId)],
);
