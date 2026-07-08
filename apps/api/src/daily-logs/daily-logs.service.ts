import { Injectable } from '@nestjs/common';
import { and, eq, gte, isNull, lte } from 'drizzle-orm';
import { db } from '../db';
import { dailyLogs, users } from '../db/schema';
import { CreateLogDto } from './dto/create-log.dto';

@Injectable()
export class DailyLogsService {
  async getMonthlyLogs(userId: string, year: number, month: number) {
    const [user] = await db
      .select({ timezone: users.timezone })
      .from(users)
      .where(eq(users.id, userId));

    const timezone = user?.timezone ?? 'Asia/Seoul';

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const logs = await db
      .select({
        id: dailyLogs.id,
        logDate: dailyLogs.logDate,
        imageUrl: dailyLogs.imageUrl,
      })
      .from(dailyLogs)
      .where(
        and(
          eq(dailyLogs.userId, userId),
          gte(dailyLogs.logDate, startDate),
          lte(dailyLogs.logDate, endDate),
          isNull(dailyLogs.deletedAt),
        ),
      );

    return { year, month, timezone, logs };
  }

  async createLog(
    authUser: { id: string; email: string; provider: string },
    dto: CreateLogDto,
  ) {
    const validProviders = ['kakao', 'google', 'email'] as const;
    const provider = validProviders.includes(
      authUser.provider as (typeof validProviders)[number],
    )
      ? (authUser.provider as (typeof validProviders)[number])
      : 'email';

    // public.users에 없으면 upsert (첫 API 호출 시 자동 생성)
    await db
      .insert(users)
      .values({
        id: authUser.id,
        email: authUser.email ?? null,
        provider,
        providerId: authUser.id,
      })
      .onConflictDoNothing();

    const userId = authUser.id;
    const [existing] = await db
      .select({ id: dailyLogs.id })
      .from(dailyLogs)
      .where(
        and(eq(dailyLogs.userId, userId), eq(dailyLogs.logDate, dto.logDate)),
      );

    if (existing) {
      const [updated] = await db
        .update(dailyLogs)
        .set({
          koreanContent: dto.koreanContent,
          englishContent: dto.englishContent ?? null,
          imageUrl: dto.imageUrl ?? null,
          mood: dto.mood ?? null,
          weather: dto.weather ?? null,
          updatedAt: new Date(),
        })
        .where(eq(dailyLogs.id, existing.id))
        .returning({ id: dailyLogs.id });
      return updated;
    }

    const [created] = await db
      .insert(dailyLogs)
      .values({
        userId,
        logDate: dto.logDate,
        koreanContent: dto.koreanContent,
        englishContent: dto.englishContent ?? null,
        imageUrl: dto.imageUrl ?? null,
        mood: dto.mood ?? null,
        weather: dto.weather ?? null,
      })
      .returning({ id: dailyLogs.id });
    return created;
  }

  async getLogById(userId: string, id: string) {
    const [log] = await db
      .select()
      .from(dailyLogs)
      .where(
        and(
          eq(dailyLogs.id, id),
          eq(dailyLogs.userId, userId),
          isNull(dailyLogs.deletedAt),
        ),
      );
    return log ?? null;
  }
}
