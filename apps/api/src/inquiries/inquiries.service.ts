import { Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { inquiries } from '../db/schema';
import { CreateInquiryDto } from './dto/create-inquiry.dto';

@Injectable()
export class InquiriesService {
  async create(userId: string, dto: CreateInquiryDto) {
    const [created] = await db
      .insert(inquiries)
      .values({ userId, title: dto.title, content: dto.content })
      .returning({ id: inquiries.id });
    return created;
  }

  async findByUser(userId: string) {
    return db
      .select({
        id: inquiries.id,
        title: inquiries.title,
        createdAt: inquiries.createdAt,
      })
      .from(inquiries)
      .where(eq(inquiries.userId, userId))
      .orderBy(desc(inquiries.createdAt));
  }

  async findOne(userId: string, id: string) {
    const [inquiry] = await db
      .select()
      .from(inquiries)
      .where(and(eq(inquiries.id, id), eq(inquiries.userId, userId)));

    if (!inquiry) throw new NotFoundException('문의를 찾을 수 없습니다.');
    return inquiry;
  }
}
