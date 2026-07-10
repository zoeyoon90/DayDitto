import {
  pgTable,
  uuid,
  text,
  pgEnum,
  timestamp,
  unique,
  pgSchema,
  integer,
} from 'drizzle-orm/pg-core';

// auth.users 참조용 (Supabase 내부 스키마)
const authSchema = pgSchema('auth');
const authUsers = authSchema.table('users', { id: uuid('id') });

export const providerEnum = pgEnum('provider', ['kakao', 'google', 'email']);
export const roleEnum = pgEnum('role', ['member', 'admin']);

export const users = pgTable(
  'users',
  {
    // auth.users.id FK — auth에서 hard delete 시 cascade
    id: uuid('id')
      .primaryKey()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    email: text('email'), // nullable, 소셜 로그인 시 미제공 가능
    nickname: text('nickname'), // 2~8자 검증은 앱 레벨
    provider: providerEnum('provider').notNull(),
    providerId: text('provider_id').notNull(),
    role: roleEnum('role').notNull().default('member'),
    timezone: text('timezone').notNull().default('Asia/Seoul'), // IANA timezone
    loginCount: integer('login_count').notNull().default(0), // 활성 일수 카운터 (JwtGuard에서 일 1회 증가)
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }), // DAU/WAU/MAU 계산용
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    unique('users_email_unique').on(t.email), // null 허용, null끼리는 중복 아님
    unique('users_provider_provider_id_unique').on(t.provider, t.providerId),
  ],
);
