import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  unique,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const toneEnum = pgEnum('tone', ['formal', 'casual', 'friendly']);

export const dailyLogs = pgTable(
  'daily_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // users.id FK — user hard delete 시 cascade
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // 유저 timezone 기준 날짜 (서버에서 users.timezone 조회 후 결정)
    logDate: date('log_date').notNull(),
    imageUrl: text('image_url'), // 사진/GIF 첨부 (MVP)
    mood: text('mood'), // 기분 이모지
    weather: text('weather'), // 날씨 이모지
    tone: toneEnum('tone'), // 번역 말투 (Phase 2, nullable)
    koreanContent: text('korean_content').notNull(), // 원문 한국어
    englishContent: text('english_content'), // AI 번역 결과
    audioUrl: text('audio_url'), // TTS 오디오 URL (deprecated)
    lineAudioUrls: text('line_audio_urls').array(), // 줄별 TTS URL 배열
    aiFeedback: text('ai_feedback'), // AI 피드백/교정
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    // 1일 1일기 강제 (DB 레벨) + 복합 인덱스 역할도 겸함
    unique('daily_logs_user_id_log_date_unique').on(t.userId, t.logDate),
  ],
);
