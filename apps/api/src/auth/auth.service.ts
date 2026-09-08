import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import * as jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';

@Injectable()
export class AuthService {
  private readonly supabaseAdmin: ReturnType<typeof createClient>;
  private readonly tossJwtSecret: string;

  constructor(configService: ConfigService) {
    this.supabaseAdmin = createClient(
      configService.get<string>('SUPABASE_URL')!,
      configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    );
    this.tossJwtSecret = configService.get<string>('TOSS_JWT_SECRET')!;
  }

  async loginWithTossAnonKey(anonKey: string) {
    // anonKey를 providerId로 사용하여 기존 유저 조회
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.providerId, anonKey));

    if (existing) {
      const accessToken = this.signTossJwt(existing.id);
      return {
        accessToken,
        user: {
          id: existing.id,
          nickname: existing.nickname,
          provider: existing.provider,
        },
      };
    }

    // 신규 유저: Supabase auth.users에 생성 (FK 충족용)
    const fakeEmail = `toss_${anonKey.slice(0, 16)}@toss.internal`;
    const { data, error } = await this.supabaseAdmin.auth.admin.createUser({
      email: fakeEmail,
      password: crypto.randomUUID(),
      email_confirm: true,
      app_metadata: { provider: 'toss' },
      user_metadata: { nickname: null },
    });

    if (error || !data.user) {
      throw new Error(`Failed to create Supabase user: ${error?.message}`);
    }

    await db.insert(users).values({
      id: data.user.id,
      email: null,
      nickname: null,
      provider: 'toss',
      providerId: anonKey,
      role: 'member',
    });

    const accessToken = this.signTossJwt(data.user.id);
    return {
      accessToken,
      user: {
        id: data.user.id,
        nickname: null,
        provider: 'toss',
      },
    };
  }

  private signTossJwt(userId: string): string {
    return jwt.sign(
      { sub: userId, provider: 'toss', iss: 'dayditto' },
      this.tossJwtSecret,
      { expiresIn: '30d' },
    );
  }
}
