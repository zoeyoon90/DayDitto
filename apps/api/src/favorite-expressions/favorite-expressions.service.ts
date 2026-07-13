import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { favoriteExpressions } from '../db/schema';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoriteExpressionsService {
  async findAll(userId: string, dailyLogId?: string) {
    const conditions = [eq(favoriteExpressions.userId, userId)];
    if (dailyLogId)
      conditions.push(eq(favoriteExpressions.dailyLogId, dailyLogId));
    return db
      .select()
      .from(favoriteExpressions)
      .where(and(...conditions))
      .orderBy(desc(favoriteExpressions.createdAt));
  }

  async create(userId: string, dto: CreateFavoriteDto) {
    const [created] = await db
      .insert(favoriteExpressions)
      .values({
        userId,
        dailyLogId: dto.dailyLogId ?? null,
        koreanText: dto.koreanText,
        englishText: dto.englishText,
        audioUrl: dto.audioUrl ?? null,
      })
      .returning();
    return created;
  }

  async updateAudioUrl(userId: string, id: string, audioUrl: string) {
    const [existing] = await db
      .select({ userId: favoriteExpressions.userId })
      .from(favoriteExpressions)
      .where(eq(favoriteExpressions.id, id));

    if (!existing) throw new NotFoundException('즐겨찾기를 찾을 수 없습니다.');
    if (existing.userId !== userId)
      throw new ForbiddenException('권한이 없습니다.');

    const [updated] = await db
      .update(favoriteExpressions)
      .set({ audioUrl })
      .where(
        and(
          eq(favoriteExpressions.id, id),
          eq(favoriteExpressions.userId, userId),
        ),
      )
      .returning();
    return updated;
  }

  async remove(userId: string, id: string) {
    const [existing] = await db
      .select({ userId: favoriteExpressions.userId })
      .from(favoriteExpressions)
      .where(eq(favoriteExpressions.id, id));

    if (!existing) throw new NotFoundException('즐겨찾기를 찾을 수 없습니다.');
    if (existing.userId !== userId)
      throw new ForbiddenException('권한이 없습니다.');

    await db
      .delete(favoriteExpressions)
      .where(
        and(
          eq(favoriteExpressions.id, id),
          eq(favoriteExpressions.userId, userId),
        ),
      );
  }
}
