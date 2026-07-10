/**
 * FavoriteExpressions E2E 테스트
 *
 * 범위: HTTP 라우팅 + Guard 적용
 * - DB 쓰기 테스트 제외: favorite_expressions.user_id → users.id → auth.users.id FK 체인
 *   으로 임의 UUID INSERT 불가 (Supabase 제약)
 * - DB 읽기 테스트 포함: SELECT는 FK 제약 없음
 * - 컨트롤러에 @UseGuards(JwtGuard) 클래스 레벨 적용 → 모든 라우트 401 검증
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
  email: 'e2e-fav@dayditto.test',
  nickname: 'E2E즐겨찾기',
  provider: 'email',
  role: 'member',
};

describe('FavoriteExpressions (e2e)', () => {
  let app: INestApplication;
  let appNoAuth: INestApplication;

  beforeAll(async () => {
    // 인증된 요청용 앱 — Guard override
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

    // 401 테스트용 앱 — 실제 Guard
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
  // 401 — 클래스 레벨 Guard가 모든 라우트에 적용됐는지 검증
  // ──────────────────────────────────────────────
  describe('인증 없음 → 401', () => {
    it('GET /favorite-expressions → 401', () => {
      return request(appNoAuth.getHttpServer())
        .get('/favorite-expressions')
        .expect(401);
    });

    it('POST /favorite-expressions → 401', () => {
      return request(appNoAuth.getHttpServer())
        .post('/favorite-expressions')
        .send({ koreanText: '안녕', englishText: 'Hello' })
        .expect(401);
    });

    it('DELETE /favorite-expressions/:id → 401', () => {
      return request(appNoAuth.getHttpServer())
        .delete(`/favorite-expressions/${randomUUID()}`)
        .expect(401);
    });
  });

  // ──────────────────────────────────────────────
  // 200 — 정상 응답 구조 검증 (DB 읽기 — 없는 유저 → 빈 배열)
  // ──────────────────────────────────────────────
  describe('정상 응답', () => {
    it('GET /favorite-expressions → 200, 배열', async () => {
      const res = await request(app.getHttpServer())
        .get('/favorite-expressions')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /favorite-expressions?dailyLogId=xxx → 200, 배열', async () => {
      const res = await request(app.getHttpServer())
        .get(`/favorite-expressions?dailyLogId=${randomUUID()}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
