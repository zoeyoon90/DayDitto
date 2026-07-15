import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { pushSubscriptions } from '../db/schema';
import { SaveSubscriptionDto } from './dto/save-subscription.dto';

@Injectable()
export class PushSubscriptionsService {
  async save(userId: string, dto: SaveSubscriptionDto) {
    await db
      .insert(pushSubscriptions)
      .values({ userId, ...dto })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: { userId, p256dh: dto.p256dh, auth: dto.auth },
      });
  }

  async remove(endpoint: string) {
    await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint));
  }

  async findAll() {
    return db
      .select()
      .from(pushSubscriptions);
  }
}
