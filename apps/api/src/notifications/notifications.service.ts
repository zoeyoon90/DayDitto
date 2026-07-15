import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { eq } from 'drizzle-orm';
import * as webpush from 'web-push';
import { db } from '../db';
import { pushSubscriptions, pushNotificationLogs, users } from '../db/schema';

@Injectable()
export class NotificationsService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    webpush.setVapidDetails(
      this.configService.get<string>('VAPID_EMAIL')!,
      this.configService.get<string>('VAPID_PUBLIC_KEY')!,
      this.configService.get<string>('VAPID_PRIVATE_KEY')!,
    );
  }

  @Cron('0 * * * *')
  async sendDailyReminder() {
    const nowUtc = new Date();

    const subscriptions = await db
      .select({
        endpoint: pushSubscriptions.endpoint,
        p256dh: pushSubscriptions.p256dh,
        auth: pushSubscriptions.auth,
        timezone: users.timezone,
      })
      .from(pushSubscriptions)
      .innerJoin(users, eq(pushSubscriptions.userId, users.id));

    let totalTargeted = 0;
    let totalSent = 0;
    let totalExpired = 0;
    let totalFailed = 0;

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const tz = sub.timezone ?? 'Asia/Seoul';

        const localHour = parseInt(
          new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            hour12: false,
            timeZone: tz,
          }).format(nowUtc),
          10,
        );

        if (localHour !== 20) return;

        totalTargeted++;

        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            JSON.stringify({
              title: 'DayDitto',
              body: '오늘 하루는 어땠나요? DayDitto에 기록해봐요 ✍️',
              icon: '/Icon/logo_icon.png',
              url: '/',
            }),
          );
          totalSent++;
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await db
              .delete(pushSubscriptions)
              .where(eq(pushSubscriptions.endpoint, sub.endpoint));
            totalExpired++;
          } else {
            totalFailed++;
          }
        }
      }),
    );

    if (totalTargeted > 0) {
      await db.insert(pushNotificationLogs).values({
        totalTargeted,
        totalSent,
        totalExpired,
        totalFailed,
      });
    }
  }
}
