/**
 * JwtGuard 유닛 테스트
 *
 * 핵심 검증 포인트:
 * 1. 토큰 없거나 잘못된 형식 → UnauthorizedException
 * 2. JWT 로컬 검증 실패 → UnauthorizedException
 * 3. 정상 토큰 + DB 유저 있음 → request.user 주입 후 통과
 * 4. 정상 토큰 + DB 유저 없음 → Supabase API 호출 후 자동 생성(lazy create) 후 통과
 *
 * Mock 전략:
 * - jwks-rsa: jose(pure ESM) 의존으로 Jest 파싱 불가 → 전체 mock
 * - jsonwebtoken: decode/verify mock → payload 제어
 * - @supabase/supabase-js: createClient mock → 신규 유저 getUser 응답 제어
 * - ../../db: DB 쿼리 전체 mock
 */
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtGuard } from './jwt.guard';
import { db } from '../../db';
import * as jwt from 'jsonwebtoken';

// jwks-rsa → jose(pure ESM) 의존으로 Jest CJS 환경에서 파싱 실패 → 전체 mock
// __esModule: true 필수 — ts-jest의 default import 처리 방식 때문
jest.mock('jwks-rsa', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({
    getSigningKey: jest.fn().mockResolvedValue({
      getPublicKey: jest.fn().mockReturnValue('mock-public-key'),
    }),
  }),
}));

jest.mock('jsonwebtoken', () => ({
  decode: jest.fn(),
  verify: jest.fn(),
}));

// 신규 유저 lazy create 시 Supabase API 호출 mock
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    auth: {
      getUser: jest.fn(),
    },
  }),
}));

const { createClient } = jest.requireMock('@supabase/supabase-js');
const mockGetUser = createClient().auth.getUser as jest.Mock;
const mockDecode = jwt.decode as jest.Mock;
const mockVerify = jwt.verify as jest.Mock;

jest.mock('../../db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  },
}));

const mockDb = db as unknown as {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
};

// ──────────────────────────────────────────────
// 헬퍼: NestJS ExecutionContext 가짜 객체 생성
// ──────────────────────────────────────────────
function makeExecutionContext(authHeader?: string) {
  const request: Record<string, unknown> = {
    headers: authHeader ? { authorization: authHeader } : {},
    user: undefined,
  };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    request,
  } as any;
}

// ──────────────────────────────────────────────
// 헬퍼: jwt.verify가 반환할 페이로드 생성
// ──────────────────────────────────────────────
function makeJwtPayload(override: Record<string, unknown> = {}) {
  return {
    sub: 'user-1',
    email: 'test@test.com',
    user_metadata: { nickname: '테스터' },
    app_metadata: { provider: 'email' },
    ...override,
  };
}

// ──────────────────────────────────────────────
// 헬퍼: Supabase 정상 유저 응답 생성 (신규 유저 lazy create 시 사용)
// ──────────────────────────────────────────────
function makeSupabaseUser(override: Record<string, unknown> = {}) {
  return {
    data: {
      user: {
        id: 'user-1',
        email: 'test@test.com',
        user_metadata: { nickname: '테스터' },
        app_metadata: { provider: 'email' },
        identities: [{ id: 'user-1' }],
        ...override,
      },
    },
    error: null,
  };
}

describe('JwtGuard', () => {
  let guard: JwtGuard;

  beforeEach(() => {
    const configService = {
      get: (key: string) => {
        if (key === 'SUPABASE_URL') return 'https://test.supabase.co';
        if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'test-service-role-key';
        return undefined;
      },
    } as unknown as ConfigService;

    guard = new JwtGuard(configService);
    jest.clearAllMocks();

    // decode 기본값: 유효한 헤더 반환
    mockDecode.mockReturnValue({ header: { kid: 'test-kid' } });
  });

  // ──────────────────────────────────────────────
  // 토큰 추출 검증
  // ──────────────────────────────────────────────
  describe('토큰 추출 실패', () => {
    it('Authorization 헤더 없으면 UnauthorizedException', async () => {
      const ctx = makeExecutionContext();
      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('Bearer 스키마가 아니면 UnauthorizedException', async () => {
      const ctx = makeExecutionContext('Basic some-credentials');
      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('Bearer는 있지만 토큰 값 없으면 UnauthorizedException', async () => {
      const ctx = makeExecutionContext('Bearer ');
      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ──────────────────────────────────────────────
  // JWT 로컬 검증 실패
  // ──────────────────────────────────────────────
  describe('JWT 로컬 검증 실패', () => {
    it('jwt.decode가 null 반환 → UnauthorizedException', async () => {
      const ctx = makeExecutionContext('Bearer invalid-token');
      mockDecode.mockReturnValue(null);

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('jwt.verify가 throw → UnauthorizedException', async () => {
      const ctx = makeExecutionContext('Bearer expired-token');
      mockVerify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ──────────────────────────────────────────────
  // 정상 인증 — DB에 유저 있음
  // ──────────────────────────────────────────────
  describe('정상 인증 - DB에 유저 존재', () => {
    /**
     * DB 호출 순서 (유저 있는 경우):
     * 1. db.select({role}).from(users).where(id)
     * 2. db.insert(loginLogs).values(...).onConflictDoNothing().returning()
     * 3. db.update(users).set({lastLoginAt, loginCount}).where(id)
     */

    it('request.user에 유저 정보 주입 후 true 반환', async () => {
      const ctx = makeExecutionContext('Bearer valid-token');
      mockVerify.mockReturnValue(makeJwtPayload());

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ role: 'member' }]),
        }),
      });
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          onConflictDoNothing: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ id: 'login-log-1' }]),
          }),
        }),
      });
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await guard.canActivate(ctx);

      expect(result).toBe(true);
      expect(ctx.request.user).toMatchObject({
        id: 'user-1',
        email: 'test@test.com',
        role: 'member',
      });
    });

    it('role이 admin인 유저도 정상 통과', async () => {
      const ctx = makeExecutionContext('Bearer admin-token');
      mockVerify.mockReturnValue(makeJwtPayload());

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ role: 'admin' }]),
        }),
      });
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          onConflictDoNothing: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ id: 'log-2' }]),
          }),
        }),
      });
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      await guard.canActivate(ctx);

      expect(ctx.request.user.role).toBe('admin');
    });

    it('로그인 로그 중복(당일 이미 로그인)이면 users UPDATE 안 함', async () => {
      const ctx = makeExecutionContext('Bearer valid-token');
      mockVerify.mockReturnValue(makeJwtPayload());

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ role: 'member' }]),
        }),
      });
      // onConflictDoNothing으로 INSERT 무시 → returning 빈 배열
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          onConflictDoNothing: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await guard.canActivate(ctx);

      // loginCount UPDATE가 호출되지 않아야 함
      expect(mockDb.update).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────
  // 신규 유저 — DB에 없으면 Supabase API 호출 후 자동 생성
  // ──────────────────────────────────────────────
  describe('신규 유저 lazy create', () => {
    /**
     * DB 호출 순서 (유저 없는 경우):
     * 1. db.select({role}).from(users).where(id) → []
     * 2. supabaseAdmin.auth.getUser(token) → identities 등 상세 정보
     * 3. db.insert(users).values(...).onConflictDoNothing()
     * 4. db.insert(loginLogs).values(...).onConflictDoNothing().returning()
     * 5. db.update(users).set({lastLoginAt, loginCount}).where(id)
     */

    it('DB에 유저 없으면 Supabase API 호출 후 자동 생성, member role로 통과', async () => {
      const ctx = makeExecutionContext('Bearer new-user-token');
      mockVerify.mockReturnValue(
        makeJwtPayload({
          sub: 'new-user-id',
          email: 'new@test.com',
          app_metadata: { provider: 'google' },
          user_metadata: {},
        }),
      );
      mockGetUser.mockResolvedValueOnce(
        makeSupabaseUser({
          id: 'new-user-id',
          email: 'new@test.com',
          app_metadata: { provider: 'google' },
          identities: [{ id: 'google-id-123' }],
        }),
      );

      // 1. 유저 조회 → 없음
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });
      // 2. 신규 유저 INSERT (lazy create)
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          onConflictDoNothing: jest.fn().mockResolvedValue([]),
        }),
      });
      // 3. 로그인 로그
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          onConflictDoNothing: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ id: 'log-3' }]),
          }),
        }),
      });
      // 4. 마지막 로그인 갱신
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await guard.canActivate(ctx);

      expect(result).toBe(true);
      expect(ctx.request.user.role).toBe('member');
    });

    it('신규 유저 생성 시 insert가 2번 호출됨 (users + loginLogs)', async () => {
      const ctx = makeExecutionContext('Bearer new-user-token-2');
      mockVerify.mockReturnValue(makeJwtPayload({ sub: 'another-new-user' }));
      mockGetUser.mockResolvedValueOnce(
        makeSupabaseUser({ id: 'another-new-user' }),
      );

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });
      mockDb.insert
        .mockReturnValueOnce({
          values: jest.fn().mockReturnValue({
            onConflictDoNothing: jest.fn().mockResolvedValue([]),
          }),
        })
        .mockReturnValueOnce({
          values: jest.fn().mockReturnValue({
            onConflictDoNothing: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([{ id: 'log-4' }]),
            }),
          }),
        });
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      await guard.canActivate(ctx);

      // db.insert 2번: 1번은 users lazy create, 2번은 loginLogs
      expect(mockDb.insert).toHaveBeenCalledTimes(2);
    });
  });
});
