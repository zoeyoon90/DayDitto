/**
 * DailyLogs E2E 테스트
 *
 * 범위: HTTP 라우팅 + Guard 적용 + 입력값 검증
 * - DB 쓰기 테스트 제외: public.users.id → auth.users.id FK 제약으로 임의 UUID INSERT 불가
 * - DB 읽기 테스트 포함: SELECT는 FK 제약 없음 (없는 유저 → 기본값 반환)
 * - 401/400 테스트: 유닛 테스트가 로직을 커버, E2E는 라우트에 실제 Guard 적용됐는지 검증
 */
import 'dotenv/config';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { AppModule } from '../src/app.module';
import { JwtGuard } from '../src/auth/guards/jwt.guard';

const TEST_USER_ID = randomUUID();
const TEST_USER = {
  id: TEST_USER_ID,
  email: 'e2e-test@dayditto.test',
  nickname: 'E2E테스터',
  provider: 'email',
  role: 'member',
};

describe('DailyLogs (e2e)', () => {
  let app: INestApplication;
  let appNoAuth: INestApplication;

  beforeAll(async () => {
    // 인증된 요청용 앱 — Guard override로 TEST_USER 주입
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          ctx.switchToHttp().getRequest().user = TEST_USER;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 401 테스트용 앱 — 실제 Guard 사용
    // 토큰 없으면 Guard가 Supabase 호출 전에 throw → 실제 Supabase 불필요
    const realFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    appNoAuth = realFixture.createNestApplication();
    await appNoAuth.init();
  });

  afterAll(async () => {
    await app.close();
    await appNoAuth.close();
  });

  // ──────────────────────────────────────────────
  // 401 — Guard가 라우트에 실제로 적용됐는지 검증
  // ──────────────────────────────────────────────
  describe('인증 없음 → 401', () => {
    it('GET /daily-logs/monthly → 401', () => {
      return request(appNoAuth.getHttpServer())
        .get('/daily-logs/monthly?year=2024&month=6')
        .expect(401);
    });

    it('POST /daily-logs → 401', () => {
      return request(appNoAuth.getHttpServer())
        .post('/daily-logs')
        .send({ logDate: '2099-01-01', koreanContent: '테스트' })
        .expect(401);
    });

    it('GET /daily-logs/:id → 401', () => {
      return request(appNoAuth.getHttpServer())
        .get(`/daily-logs/${randomUUID()}`)
        .expect(401);
    });
  });

  // ──────────────────────────────────────────────
  // 400 — 컨트롤러 입력값 검증이 HTTP 레벨에서 동작하는지 검증
  // ──────────────────────────────────────────────
  describe('getMonthly 입력값 검증 → 400', () => {
    it('month=0', () => {
      return request(app.getHttpServer())
        .get('/daily-logs/monthly?year=2024&month=0')
        .expect(400);
    });

    it('month=13', () => {
      return request(app.getHttpServer())
        .get('/daily-logs/monthly?year=2024&month=13')
        .expect(400);
    });

    it('year 없음', () => {
      return request(app.getHttpServer())
        .get('/daily-logs/monthly?month=6')
        .expect(400);
    });

    it('year=0', () => {
      return request(app.getHttpServer())
        .get('/daily-logs/monthly?year=0&month=6')
        .expect(400);
    });

    it('year 문자열', () => {
      return request(app.getHttpServer())
        .get('/daily-logs/monthly?year=abc&month=6')
        .expect(400);
    });
  });

  // ──────────────────────────────────────────────
  // 200 — 정상 응답 구조 검증 (DB 읽기 — 없는 유저 → 기본값)
  // ──────────────────────────────────────────────
  describe('정상 응답', () => {
    it('GET /daily-logs/monthly → 200, { year, month, timezone, logs }', async () => {
      const res = await request(app.getHttpServer())
        .get('/daily-logs/monthly?year=2099&month=6')
        .expect(200);

      expect(res.body).toMatchObject({
        year: 2099,
        month: 6,
        timezone: expect.any(String),
      });
      expect(Array.isArray(res.body.logs)).toBe(true);
    });

    it('GET /daily-logs/monthly 경계값 month=1 → 200', () => {
      return request(app.getHttpServer())
        .get('/daily-logs/monthly?year=2024&month=1')
        .expect(200);
    });

    it('GET /daily-logs/monthly 경계값 month=12 → 200', () => {
      return request(app.getHttpServer())
        .get('/daily-logs/monthly?year=2024&month=12')
        .expect(200);
    });

    it('GET /daily-logs/:id 없는 로그 → 200', async () => {
      // 없는 ID: service가 null 반환 → NestJS는 200으로 응답
      await request(app.getHttpServer())
        .get(`/daily-logs/${randomUUID()}`)
        .expect(200);
    });
  });
});
