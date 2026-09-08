import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import * as jwt from 'jsonwebtoken';
import { Agent, fetch as undiciFetch } from 'undici';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';

interface TossTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

interface TossUserResponse {
  userKey: string;
}

@Injectable()
export class AuthService {
  private readonly supabaseAdmin: ReturnType<typeof createClient>;
  private readonly jwtSecret: string;
  private readonly refreshSecret: string;
  private readonly tossApiAgent: Agent | null = null;
  private readonly tossApiBaseUrl =
    'https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/user/oauth2';

  constructor(private readonly configService: ConfigService) {
    this.supabaseAdmin = createClient(
      configService.get<string>('SUPABASE_URL')!,
      configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    );
    this.jwtSecret = configService.get<string>('TOSS_JWT_SECRET')!;
    this.refreshSecret = configService.get<string>('TOSS_REFRESH_SECRET')!;

    // mTLS 클라이언트 인증서 설정 (없으면 토스 로그인만 비활성화)
    try {
      const certPath = configService.get<string>('TOSS_MTLS_CERT_PATH');
      const keyPath = configService.get<string>('TOSS_MTLS_KEY_PATH');
      if (certPath && keyPath) {
        this.tossApiAgent = new Agent({
          connect: {
            cert: fs.readFileSync(path.resolve(certPath)),
            key: fs.readFileSync(path.resolve(keyPath)),
          },
        });
      }
    } catch {
      // 인증서 없으면 토스 로그인 비활성화 (web/admin은 정상 동작)
    }
  }

  async loginWithTossAnonKey(anonKey: string) {
    const user = await this.findOrCreateTossUser(anonKey);
    return {
      accessToken: this.signJwt(user.id),
      refreshToken: await this.signRefreshToken(user.id),
    };
  }

  async loginWithTossAuthCode(authorizationCode: string, referrer?: string) {
    // 1. mTLS로 토스 API에 인가코드 교환
    const tossTokens = await this.exchangeTossToken(
      authorizationCode,
      referrer,
    );

    // 2. 토스 accessToken으로 유저 정보 조회
    const tossUser = await this.getTossUserInfo(tossTokens.accessToken);

    // 3. DB에서 유저 조회/생성 (userKey = providerId)
    const user = await this.findOrCreateTossUser(tossUser.userKey);

    // 4. 자체 JWT 발급
    return {
      accessToken: this.signJwt(user.id),
      refreshToken: await this.signRefreshToken(user.id),
      user: {
        id: user.id,
        nickname: user.nickname,
        provider: user.provider,
      },
    };
  }

  async refreshTossToken(refreshToken: string) {
    try {
      const payload = jwt.verify(
        refreshToken,
        this.refreshSecret,
      ) as jwt.JwtPayload;
      if (payload.type !== 'refresh' || !payload.jti)
        throw new Error('invalid token type');

      const userId = payload.sub!;
      const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      if (!dbUser) throw new Error('user not found');

      // jti 해시 대조 — 불일치면 재사용 탐지
      const hash = crypto
        .createHash('sha256')
        .update(payload.jti)
        .digest('hex');
      if (dbUser.refreshTokenHash !== hash) throw new Error('token reused');

      return {
        accessToken: this.signJwt(userId),
        refreshToken: await this.signRefreshToken(userId),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async exchangeTossToken(
    authorizationCode: string,
    referrer?: string,
  ): Promise<TossTokenResponse> {
    if (!this.tossApiAgent) {
      throw new UnauthorizedException('Toss login not configured');
    }

    const res = await undiciFetch(`${this.tossApiBaseUrl}/generate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorizationCode, referrer }),
      dispatcher: this.tossApiAgent,
    });

    if (!res.ok) {
      const body = await res.text();
      throw new UnauthorizedException(
        `Toss token exchange failed: ${res.status} ${body}`,
      );
    }

    return res.json() as Promise<TossTokenResponse>;
  }

  private async getTossUserInfo(
    accessToken: string,
  ): Promise<TossUserResponse> {
    if (!this.tossApiAgent) {
      throw new UnauthorizedException('Toss login not configured');
    }

    const res = await undiciFetch(`${this.tossApiBaseUrl}/login-me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      dispatcher: this.tossApiAgent,
    });

    if (!res.ok) {
      throw new UnauthorizedException('Failed to get Toss user info');
    }

    return res.json() as Promise<TossUserResponse>;
  }

  private async findOrCreateTossUser(userKey: string) {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.providerId, userKey));

    if (existing) return existing;

    // Supabase auth.users에 생성 (FK 충족용)
    const hash = crypto.createHash('sha256').update(userKey).digest('hex');
    const fakeEmail = `toss_${hash.slice(0, 16)}@toss.internal`;

    const { data, error } = await this.supabaseAdmin.auth.admin.createUser({
      email: fakeEmail,
      password: crypto.randomUUID(),
      email_confirm: true,
      app_metadata: { provider: 'toss' },
    });

    if (error || !data.user) {
      throw new Error(`Failed to create Supabase user: ${error?.message}`);
    }

    const [newUser] = await db
      .insert(users)
      .values({
        id: data.user.id,
        email: null,
        nickname: null,
        provider: 'toss',
        providerId: userKey,
        role: 'member',
      })
      .returning();

    return newUser;
  }

  private signJwt(userId: string): string {
    return jwt.sign(
      { sub: userId, provider: 'toss', iss: 'dayditto' },
      this.jwtSecret,
      { expiresIn: '1h' },
    );
  }

  private async signRefreshToken(userId: string): Promise<string> {
    const jti = crypto.randomUUID();
    const hash = crypto.createHash('sha256').update(jti).digest('hex');

    await db
      .update(users)
      .set({ refreshTokenHash: hash })
      .where(eq(users.id, userId));

    return jwt.sign({ sub: userId, type: 'refresh', jti }, this.refreshSecret, {
      expiresIn: '14d',
    });
  }
}
