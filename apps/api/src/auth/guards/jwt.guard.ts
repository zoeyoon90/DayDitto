import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { createClient } from '@supabase/supabase-js';
import * as jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { eq, sql } from 'drizzle-orm';
import { db } from '../../db';
import { users, loginLogs } from '../../db/schema';

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly jwksClient: jwksRsa.JwksClient;
  private readonly supabaseAdmin: ReturnType<typeof createClient>;
  private readonly tossJwtSecret: string;

  constructor(configService: ConfigService) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL')!;
    const supabaseServiceKey = configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    )!;

    // JWKS 클라이언트: 공개키 캐시 (10분) → 로컬 JWT 검증
    this.jwksClient = jwksRsa({
      jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 600_000,
    });

    // Supabase admin 클라이언트: 신규 유저 첫 방문 시만 사용
    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    this.tossJwtSecret = configService.get<string>('TOSS_JWT_SECRET') ?? '';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException();

    // 자체 JWT (토스 anonKey) 먼저 시도
    const tossPayload = this.verifyTossJwt(token);
    if (tossPayload) {
      return this.handleTossUser(request, tossPayload);
    }

    // Supabase JWT 검증
    return this.handleSupabaseUser(request, token);
  }

  private verifyTossJwt(token: string): jwt.JwtPayload | null {
    if (!this.tossJwtSecret) return null;
    try {
      const payload = jwt.verify(token, this.tossJwtSecret) as jwt.JwtPayload;
      if (payload.iss === 'dayditto' && payload.provider === 'toss') {
        return payload;
      }
      return null;
    } catch {
      return null;
    }
  }

  private async handleTossUser(
    request: Request,
    payload: jwt.JwtPayload,
  ): Promise<boolean> {
    const userId = payload.sub!;

    const [dbUser] = await db
      .select({
        role: users.role,
        nickname: users.nickname,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!dbUser) throw new UnauthorizedException();

    (request as Request & { user: unknown }).user = {
      id: userId,
      email: dbUser.email ?? '',
      nickname: dbUser.nickname,
      provider: 'toss',
      role: dbUser.role ?? 'member',
    };

    await this.trackLogin(userId);
    return true;
  }

  private async handleSupabaseUser(
    request: Request,
    token: string,
  ): Promise<boolean> {
    let payload: jwt.JwtPayload;
    try {
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || typeof decoded === 'string')
        throw new Error('invalid token');

      const signingKey = await this.jwksClient.getSigningKey(
        decoded.header.kid,
      );
      payload = jwt.verify(token, signingKey.getPublicKey(), {
        audience: 'authenticated',
      }) as jwt.JwtPayload;
    } catch {
      throw new UnauthorizedException();
    }

    const userId = payload.sub!;
    const email = payload.email as string | undefined;
    const appMetadata = (payload.app_metadata as { provider?: string }) ?? {};
    const userMetadata = (payload.user_metadata as { nickname?: string }) ?? {};

    // DB에서 role 조회 (없으면 lazy create — 회원가입 후 첫 API 호출 시 생성)
    let [dbUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId));

    if (!dbUser) {
      // 신규 유저 첫 방문 시만 Supabase API 호출 (identities 등 상세 정보 필요)
      const {
        data: { user },
        error,
      } = await this.supabaseAdmin.auth.getUser(token);
      if (error || !user) throw new UnauthorizedException();

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
      id: userId,
      email: email ?? '',
      nickname: userMetadata.nickname,
      provider: appMetadata.provider ?? 'email',
      role: dbUser?.role ?? 'member',
    };

    await this.trackLogin(userId);
    return true;
  }

  private async trackLogin(userId: string): Promise<void> {
    const [inserted] = await db
      .insert(loginLogs)
      .values({
        userId,
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
        .where(eq(users.id, userId));
    }
  }

  private extractToken(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? (token ?? null) : null;
  }
}
