import { Injectable } from '@nestjs/common';
import { and, eq, gte, isNull, lte } from 'drizzle-orm';
import { db } from '../db';
import { dailyLogs, users } from '../db/schema';

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
}
