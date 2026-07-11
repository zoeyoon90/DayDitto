/**
 * NoticesService 유닛 테스트
 *
 * 전략: DB를 jest.mock으로 완전히 교체. 실제 DB 없이 서비스 로직만 검증.
 * 각 테스트마다 mockReturnValueOnce로 DB 응답을 순서대로 제어.
 */
import { NotFoundException } from '@nestjs/common';
import { NoticesService } from './notices.service';
import { db } from '../db';

// db 모듈 전체를 mock으로 교체 — 실제 PostgreSQL 연결 없이 테스트
jest.mock('../db', () => ({
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

const mockNotice = {
  id: 'notice-1',
  content: '공지 내용입니다.',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  resentAt: null,
};

describe('NoticesService', () => {
  let service: NoticesService;

  beforeEach(() => {
    service = new NoticesService();
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  // getActive
  // ──────────────────────────────────────────────
  describe('getActive', () => {
    /**
     * DB 호출: db.select().from(notices).where(isActive=true).orderBy(...).limit(1)
     * select → from → where → orderBy → limit 체인
     */

    it('활성 공지 있으면 공지 객체 반환', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([mockNotice]),
            }),
          }),
        }),
      });

      const result = await service.getActive();

      expect(result).toEqual(mockNotice);
    });

    it('활성 공지 없으면 null 반환', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      const result = await service.getActive();

      expect(result).toBeNull();
    });
  });

  // ──────────────────────────────────────────────
  // getAll
  // ──────────────────────────────────────────────
  describe('getAll', () => {
    /**
     * DB 호출: db.select().from(notices).orderBy(...)
     */

    it('전체 공지 목록 반환', async () => {
      const mockList = [
        mockNotice,
        { ...mockNotice, id: 'notice-2', isActive: false },
      ];
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue(mockList),
        }),
      });

      const result = await service.getAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('notice-1');
    });

    it('공지 없으면 빈 배열 반환', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.getAll();

      expect(result).toEqual([]);
    });
  });

  // ──────────────────────────────────────────────
  // create
  // ──────────────────────────────────────────────
  describe('create', () => {
    /**
     * DB 호출: db.insert(notices).values({content}).returning()
     */

    it('공지 생성 후 생성된 공지 반환', async () => {
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockNotice]),
        }),
      });

      const result = await service.create('공지 내용입니다.');

      expect(result).toEqual(mockNotice);
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
    });
  });

  // ──────────────────────────────────────────────
  // deactivate
  // ──────────────────────────────────────────────
  describe('deactivate', () => {
    /**
     * DB 호출: db.update(notices).set({isActive: false}).where(id).returning()
     */

    it('isActive false로 업데이트 후 반환', async () => {
      const deactivated = { ...mockNotice, isActive: false };
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([deactivated]),
          }),
        }),
      });

      const result = await service.deactivate('notice-1');

      expect(result.isActive).toBe(false);
    });

    it('없는 id → NotFoundException', async () => {
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(service.deactivate('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ──────────────────────────────────────────────
  // resend
  // ──────────────────────────────────────────────
  describe('resend', () => {
    /**
     * DB 호출: db.update(notices).set({resentAt, isActive: true}).where(id).returning()
     */

    it('resentAt 갱신 + isActive true로 업데이트 후 반환', async () => {
      const resent = { ...mockNotice, resentAt: new Date(), isActive: true };
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([resent]),
          }),
        }),
      });

      const result = await service.resend('notice-1');

      expect(result.resentAt).not.toBeNull();
      expect(result.isActive).toBe(true);
    });

    it('없는 id → NotFoundException', async () => {
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(service.resend('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
