import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { createClient } from '@supabase/supabase-js';
import { eq, sql } from 'drizzle-orm';
import { db } from '../../db';
import { users, loginLogs } from '../../db/schema';

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly supabaseUrl: string;
  private readonly supabaseServiceKey: string;

  constructor(configService: ConfigService) {
    this.supabaseUrl = configService.get<string>('SUPABASE_URL')!;
    this.supabaseServiceKey = configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    )!;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException();

    const adminSupabase = createClient(
      this.supabaseUrl,
      this.supabaseServiceKey,
    );
    const {
      data: { user },
      error,
    } = await adminSupabase.auth.getUser(token);

    if (error || !user) throw new UnauthorizedException();

    // DB에서 role 조회 (없으면 lazy create — 회원가입 후 첫 API 호출 시 생성)
    let [dbUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, user.id));

    if (!dbUser) {
      const provider = ((user.app_metadata as { provider?: string })
        ?.provider ?? 'email') as 'email' | 'kakao' | 'google';
      const providerId = user.identities?.[0]?.id ?? user.id;
      const nickname = (user.user_metadata as { nickname?: string })?.nickname;

      await db
        .insert(users)
        .values({
          id: user.id,
          email: user.email ?? null,
          nickname: nickname ?? null,
          provider,
          providerId,
          role: 'member',
        })
        .onConflictDoNothing();

      dbUser = { role: 'member' };
    }

    (request as Request & { user: unknown }).user = {
      id: user.id,
      email: user.email!,
      nickname: (user.user_metadata as { nickname?: string })?.nickname,
      provider:
        (user.app_metadata as { provider?: string })?.provider ?? 'email',
      role: dbUser?.role ?? 'member',
    };

    // KST 기준 오늘 login_log INSERT (atomic)
    // UNIQUE(user_id, date) + ON CONFLICT DO NOTHING → 병렬 요청 race condition 원천 차단
    const [inserted] = await db
      .insert(loginLogs)
      .values({
        userId: user.id,
        date: sql`(NOW() AT TIME ZONE 'Asia/Seoul')::date`,
      })
      .onConflictDoNothing()
      .returning({ id: loginLogs.id });

    if (inserted) {
      await db
        .update(users)
        .set({
          lastLoginAt: new Date(),
          loginCount: sql`login_count + 1`,
        })
        .where(eq(users.id, user.id));
    }

    return true;
  }

  private extractToken(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? (token ?? null) : null;
  }
}
