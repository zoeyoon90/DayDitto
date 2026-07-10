import {
  pgTable,
  uuid,
  date,
  timestamp,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const loginLogs = pgTable(
  'login_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // KST 기준 날짜: (NOW() AT TIME ZONE 'Asia/Seoul')::date
    // 서버 타임존(UTC) 무관하게 한국 자정 기준으로 집계
    date: date('date').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // UNIQUE: 유저당 하루 1행 보장 → ON CONFLICT DO NOTHING으로 race condition 방지
    unique('login_logs_user_date_unique').on(t.userId, t.date),
    // DAU 트렌드 쿼리용 인덱스
    index('login_logs_date_idx').on(t.date),
  ],
);
