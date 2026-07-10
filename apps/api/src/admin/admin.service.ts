import { Injectable, NotFoundException } from '@nestjs/common';
import { sql, eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { users, inquiries } from '../db/schema';

@Injectable()
export class AdminService {
  async getUsers() {
    const result = await db.execute(sql`
      SELECT
        u.id,
        u.email,
        u.nickname,
        u.provider,
        u.login_count,
        u.created_at,
        COALESCE(dc.diary_count, 0)       AS diary_count,
        COALESCE(tc.translation_count, 0) AS translation_count,
        COALESCE(tc.tts_count, 0)         AS tts_count
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*) AS diary_count
        FROM daily_logs
        GROUP BY user_id
      ) dc ON dc.user_id = u.id
      LEFT JOIN (
        SELECT user_id,
          COUNT(*) FILTER (WHERE call_type = 'translation') AS translation_count,
          COUNT(*) FILTER (WHERE call_type = 'tts')         AS tts_count
        FROM ai_usage_logs
        GROUP BY user_id
      ) tc ON tc.user_id = u.id
      WHERE u.deleted_at IS NULL
      ORDER BY u.created_at DESC
    `);
    return result;
  }

  async getInquiries() {
    return db
      .select({
        id: inquiries.id,
        userId: inquiries.userId,
        title: inquiries.title,
        status: inquiries.status,
        createdAt: inquiries.createdAt,
        repliedAt: inquiries.repliedAt,
      })
      .from(inquiries)
      .orderBy(desc(inquiries.createdAt));
  }

  async getInquiry(id: string) {
    const [inquiry] = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, id));

    if (!inquiry) throw new NotFoundException('문의를 찾을 수 없습니다.');
    return inquiry;
  }

  async replyToInquiry(id: string, adminReply: string) {
    const [updated] = await db
      .update(inquiries)
      .set({
        adminReply,
        repliedAt: new Date(),
        status: 'replied',
        updatedAt: new Date(),
      })
      .where(eq(inquiries.id, id))
      .returning();

    if (!updated) throw new NotFoundException('문의를 찾을 수 없습니다.');
    return updated;
  }

  async getStats() {
    const [dauResult, wauResult, mauResult, aiDayResult, aiWeekResult, aiMonthResult] =
      await Promise.all([
        // DAU: 오늘 KST 기준 (UNIQUE constraint로 COUNT(*) = 활성 유저 수)
        db.execute(sql`
          SELECT COUNT(*)::int AS count FROM login_logs
          WHERE date = (NOW() AT TIME ZONE 'Asia/Seoul')::date
        `),
        // WAU: 최근 7일
        db.execute(sql`
          SELECT COUNT(DISTINCT user_id)::int AS count FROM login_logs
          WHERE date >= (NOW() AT TIME ZONE 'Asia/Seoul')::date - 6
        `),
        // MAU: 최근 30일
        db.execute(sql`
          SELECT COUNT(DISTINCT user_id)::int AS count FROM login_logs
          WHERE date >= (NOW() AT TIME ZONE 'Asia/Seoul')::date - 29
        `),
        // 일별 AI 호출
        db.execute(sql`
          SELECT call_type, COUNT(*)::int AS count FROM ai_usage_logs
          WHERE created_at >= DATE_TRUNC('day', NOW() AT TIME ZONE 'Asia/Seoul') AT TIME ZONE 'Asia/Seoul'
          GROUP BY call_type
        `),
        // 주별 AI 호출
        db.execute(sql`
          SELECT call_type, COUNT(*)::int AS count FROM ai_usage_logs
          WHERE created_at >= NOW() - INTERVAL '7 days'
          GROUP BY call_type
        `),
        // 월별 AI 호출
        db.execute(sql`
          SELECT call_type, COUNT(*)::int AS count FROM ai_usage_logs
          WHERE created_at >= NOW() - INTERVAL '30 days'
          GROUP BY call_type
        `),
      ]);

    const toMap = (rows: { call_type: string; count: number }[]) =>
      Object.fromEntries(rows.map((r) => [r.call_type, r.count]));

    return {
      dau: (dauResult[0] as { count: number }).count,
      wau: (wauResult[0] as { count: number }).count,
      mau: (mauResult[0] as { count: number }).count,
      aiDay: toMap(aiDayResult as unknown as { call_type: string; count: number }[]),
      aiWeek: toMap(aiWeekResult as unknown as { call_type: string; count: number }[]),
      aiMonth: toMap(aiMonthResult as unknown as { call_type: string; count: number }[]),
    };
  }

  async getStatsTrend() {
    const [dauTrend, aiTrend] = await Promise.all([
      // 7일치 DAU 트렌드
      db.execute(sql`
        SELECT date::text, COUNT(*)::int AS dau
        FROM login_logs
        WHERE date >= (NOW() AT TIME ZONE 'Asia/Seoul')::date - 6
        GROUP BY date
        ORDER BY date
      `),
      // 7일치 API 호출 트렌드 (callType별)
      db.execute(sql`
        SELECT
          DATE(created_at AT TIME ZONE 'Asia/Seoul')::text AS date,
          call_type,
          COUNT(*)::int AS count
        FROM ai_usage_logs
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at AT TIME ZONE 'Asia/Seoul'), call_type
        ORDER BY date
      `),
    ]);

    return {
      dau: dauTrend,
      ai: aiTrend,
    };
  }
}
