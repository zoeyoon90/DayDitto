/**
 * Notices E2E 테스트
 *
 * 범위: HTTP 라우팅 + Guard 적용 + 응답 구조
 * - appAdmin: JwtGuard + AdminGuard 둘 다 override → 관리자 요청 시뮬레이션
 * - appUser:  JwtGuard만 override (role: member) → AdminGuard 실제 동작 → 403 검증
 * - appNoAuth: Guard 실제 동작 → 401 검증
 *
 * DB 쓰기: notices 테이블은 FK 제약 없음 → POST /admin/notices 실제 INSERT 가능
 * 생성된 테스트 데이터는 afterAll에서 정리
 */
import 'dotenv/config';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { AppModule } from '../src/app.module';
import { JwtGuard } from '../src/auth/guards/jwt.guard';
import { AdminGuard } from '../src/auth/guards/admin.guard';
import { db } from '../src/db';
import { notices } from '../src/db/schema';
import { eq } from 'drizzle-orm';

const TEST_ADMIN = {
  id: randomUUID(),
  email: 'admin@dayditto.test',
  nickname: 'AdminTester',
  provider: 'email',
  role: 'admin',
};

const TEST_USER = {
  id: randomUUID(),
  email: 'user@dayditto.test',
  nickname: 'UserTester',
  provider: 'email',
  role: 'member',
};

describe('Notices (e2e)', () => {
  let appAdmin: INestApplication;
  let appUser: INestApplication;
  let appNoAuth: INestApplication;
  const createdNoticeIds: string[] = [];

  beforeAll(async () => {
    // 관리자용 앱 — JwtGuard + AdminGuard 둘 다 override
    const adminFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          ctx.switchToHttp().getRequest().user = TEST_ADMIN;
          return true;
        },
      })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    appAdmin = adminFixture.createNestApplication();
    await appAdmin.init();

    // 일반 유저용 앱 — JwtGuard만 override (role: member), AdminGuard 실제 동작 → 403
    const userFixture: TestingModule = await Test.createTestingModule({
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

    appUser = userFixture.createNestApplication();
    await appUser.init();

    // 인증 없는 앱 — 실제 Guard 동작 → 401
    const noAuthFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    appNoAuth = noAuthFixture.createNestApplication();
    await appNoAuth.init();
  });

  afterAll(async () => {
    // 테스트 중 생성된 notices 정리
    for (const id of createdNoticeIds) {
      await db.delete(notices).where(eq(notices.id, id));
    }
    await appAdmin.close();
    await appUser.close();
    await appNoAuth.close();
  });

  // ──────────────────────────────────────────────
  // GET /notices/active
  // ──────────────────────────────────────────────
  describe('GET /notices/active', () => {
    it('인증 없음 → 401', () => {
      return request(appNoAuth.getHttpServer())
        .get('/notices/active')
        .expect(401);
    });

    it('인증 있음 → 200, null/빈객체 또는 공지 객체', async () => {
      const res = await request(appUser.getHttpServer())
        .get('/notices/active')
        .expect(200);

      // 활성 공지 없으면 null or {} 반환, 있으면 공지 객체 구조 검증
      if (res.body && res.body.id) {
        expect(res.body).toMatchObject({
          id: expect.any(String),
          content: expect.any(String),
          createdAt: expect.any(String),
        });
      }
    });
  });

  // ──────────────────────────────────────────────
  // GET /admin/notices
  // ──────────────────────────────────────────────
  describe('GET /admin/notices', () => {
    it('인증 없음 → 401', () => {
      return request(appNoAuth.getHttpServer())
        .get('/admin/notices')
        .expect(401);
    });

    it('일반 유저 → 403', () => {
      return request(appUser.getHttpServer())
        .get('/admin/notices')
        .expect(403);
    });

    it('관리자 → 200, 배열', async () => {
      const res = await request(appAdmin.getHttpServer())
        .get('/admin/notices')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ──────────────────────────────────────────────
  // POST /admin/notices
  // ──────────────────────────────────────────────
  describe('POST /admin/notices', () => {
    it('인증 없음 → 401', () => {
      return request(appNoAuth.getHttpServer())
        .post('/admin/notices')
        .send({ content: '테스트 공지' })
        .expect(401);
    });

    it('일반 유저 → 403', () => {
      return request(appUser.getHttpServer())
        .post('/admin/notices')
        .send({ content: '테스트 공지' })
        .expect(403);
    });

    it('관리자, 정상 content → 201, 공지 객체 반환', async () => {
      const res = await request(appAdmin.getHttpServer())
        .post('/admin/notices')
        .send({ content: 'E2E 테스트 공지입니다.' })
        .expect(201);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        content: 'E2E 테스트 공지입니다.',
        isActive: true,
        createdAt: expect.any(String),
      });

      // afterAll 정리를 위해 ID 저장
      createdNoticeIds.push(res.body.id);
    });
  });

  // ──────────────────────────────────────────────
  // PATCH /admin/notices/:id/deactivate
  // ──────────────────────────────────────────────
  describe('PATCH /admin/notices/:id/deactivate', () => {
    it('인증 없음 → 401', () => {
      return request(appNoAuth.getHttpServer())
        .patch(`/admin/notices/${randomUUID()}/deactivate`)
        .expect(401);
    });

    it('일반 유저 → 403', () => {
      return request(appUser.getHttpServer())
        .patch(`/admin/notices/${randomUUID()}/deactivate`)
        .expect(403);
    });

    it('없는 id → 404', () => {
      return request(appAdmin.getHttpServer())
        .patch(`/admin/notices/${randomUUID()}/deactivate`)
        .expect(404);
    });
  });

  // ──────────────────────────────────────────────
  // POST /admin/notices/:id/resend
  // ──────────────────────────────────────────────
  describe('POST /admin/notices/:id/resend', () => {
    it('인증 없음 → 401', () => {
      return request(appNoAuth.getHttpServer())
        .post(`/admin/notices/${randomUUID()}/resend`)
        .expect(401);
    });

    it('일반 유저 → 403', () => {
      return request(appUser.getHttpServer())
        .post(`/admin/notices/${randomUUID()}/resend`)
        .expect(403);
    });

    it('없는 id → 404', () => {
      return request(appAdmin.getHttpServer())
        .post(`/admin/notices/${randomUUID()}/resend`)
        .expect(404);
    });
  });
});
