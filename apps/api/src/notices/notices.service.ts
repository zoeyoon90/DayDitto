import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../db';
import { notices } from '../db/schema';

@Injectable()
export class NoticesService {
  async getActive() {
    const [notice] = await db
      .select()
      .from(notices)
      .where(eq(notices.isActive, true))
      .orderBy(desc(sql`COALESCE(${notices.resentAt}, ${notices.createdAt})`))
      .limit(1);
    return notice ?? null;
  }

  async getAll() {
    return db
      .select()
      .from(notices)
      .orderBy(desc(sql`COALESCE(${notices.resentAt}, ${notices.createdAt})`));
  }

  async create(content: string) {
    const [created] = await db
      .insert(notices)
      .values({ content })
      .returning();
    return created;
  }

  async deactivate(id: string) {
    const [updated] = await db
      .update(notices)
      .set({ isActive: false })
      .where(eq(notices.id, id))
      .returning();
    if (!updated) throw new NotFoundException('공지를 찾을 수 없습니다.');
    return updated;
  }

  async resend(id: string) {
    const [updated] = await db
      .update(notices)
      .set({ resentAt: new Date(), isActive: true })
      .where(eq(notices.id, id))
      .returning();
    if (!updated) throw new NotFoundException('공지를 찾을 수 없습니다.');
    return updated;
  }
}
