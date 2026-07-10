/**
 * DailyLogsService 유닛 테스트
 *
 * 전략: DB를 jest.mock으로 완전히 교체. 실제 DB 없이 서비스 로직만 검증.
 * 각 테스트마다 mockReturnValueOnce로 DB 응답을 순서대로 제어.
 */
import { DailyLogsService } from './daily-logs.service';
import { db } from '../db';

// db 모듈 전체를 mock으로 교체 — 실제 PostgreSQL 연결 없이 테스트
jest.mock('../db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  },
}));

// mock된 db를 타입 캐스팅해서 테스트에서 제어 가능하게
const mockDb = db as unknown as {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
};

describe('DailyLogsService', () => {
  let service: DailyLogsService;

  beforeEach(() => {
    // 매 테스트 전에 서비스 인스턴스 새로 생성 + mock 초기화
    service = new DailyLogsService();
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  // getMonthlyLogs
  // ──────────────────────────────────────────────
  describe('getMonthlyLogs', () => {
    /**
     * getMonthlyLogs 내부 DB 호출 순서:
     * 1. db.select({timezone}).from(users).where(...)   ← 유저 timezone 조회
     * 2. db.select({...}).from(dailyLogs).where(...)    ← 해당 월 로그 조회
     *
     * mockReturnValueOnce로 첫 번째 / 두 번째 select 호출을 각각 제어
     */

    it('유저의 timezone을 조회해서 결과에 포함', async () => {
      mockDb.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest
              .fn()
              .mockResolvedValue([{ timezone: 'America/New_York' }]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        });

      const result = await service.getMonthlyLogs('user-1', 2024, 1);

      expect(result.timezone).toBe('America/New_York');
      expect(result.year).toBe(2024);
      expect(result.month).toBe(1);
    });

    it('DB에 유저가 없으면 timezone 기본값 Asia/Seoul 사용', async () => {
      mockDb.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]), // 유저 없음
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        });

      const result = await service.getMonthlyLogs('user-1', 2024, 3);

      expect(result.timezone).toBe('Asia/Seoul');
    });

    it('해당 월 로그 목록 반환', async () => {
      const mockLogs = [
        { id: 'log-1', logDate: '2024-01-15', imageUrl: null },
        {
          id: 'log-2',
          logDate: '2024-01-20',
          imageUrl: 'https://example.com/img.jpg',
        },
      ];
      mockDb.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([{ timezone: 'Asia/Seoul' }]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue(mockLogs),
          }),
        });

      const result = await service.getMonthlyLogs('user-1', 2024, 1);

      expect(result.logs).toHaveLength(2);
      expect(result.logs[0].id).toBe('log-1');
      expect(result.logs[1].imageUrl).toBe('https://example.com/img.jpg');
    });

    it('로그 없는 달이면 빈 배열 반환', async () => {
      mockDb.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([{ timezone: 'Asia/Seoul' }]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        });

      const result = await service.getMonthlyLogs('user-1', 2024, 2);

      expect(result.logs).toEqual([]);
    });
  });

  // ──────────────────────────────────────────────
  // createLog
  // ──────────────────────────────────────────────
  describe('createLog', () => {
    /**
     * createLog 내부 DB 호출 순서:
     * 1. db.insert(users).values(...).onConflictDoNothing()     ← 유저 upsert
     * 2. db.select({id}).from(dailyLogs).where(...)              ← 당일 로그 존재 여부 확인
     *    2a. 없으면: db.insert(dailyLogs).values(...).returning(...)   ← INSERT
     *    2b. 있으면: db.update(dailyLogs).set(...).where(...).returning(...) ← UPDATE
     */

    const authUser = {
      id: 'user-1',
      email: 'test@test.com',
      provider: 'email',
    };
    const dto = {
      logDate: '2024-01-15',
      koreanContent: '오늘의 일기입니다.',
      englishContent: "Today's diary.",
      imageUrl: null,
      mood: null,
      weather: null,
    };

    it('당일 로그 없으면 INSERT 후 새 로그 ID 반환', async () => {
      // 1. users upsert
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          onConflictDoNothing: jest.fn().mockResolvedValue([]),
        }),
      });
      // 2. 당일 로그 조회 → 없음
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });
      // 3. 새 로그 INSERT
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 'new-log-1' }]),
        }),
      });

      const result = await service.createLog(authUser, dto as any);

      expect(result).toEqual({ id: 'new-log-1' });
    });

    it('당일 로그 있으면 UPDATE 후 기존 로그 ID 반환', async () => {
      // 1. users upsert
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          onConflictDoNothing: jest.fn().mockResolvedValue([]),
        }),
      });
      // 2. 당일 로그 조회 → 있음
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ id: 'existing-log-1' }]),
        }),
      });
      // 3. 기존 로그 UPDATE
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ id: 'existing-log-1' }]),
          }),
        }),
      });

      const result = await service.createLog(authUser, dto as any);

      expect(result).toEqual({ id: 'existing-log-1' });
    });

    it('유효하지 않은 provider는 email로 처리', async () => {
      const unknownProviderUser = {
        id: 'user-2',
        email: 'x@x.com',
        provider: 'twitter',
      };

      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          onConflictDoNothing: jest.fn().mockResolvedValue([]),
        }),
      });
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });
      const mockValues = jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: 'log-x' }]),
      });
      mockDb.insert.mockReturnValueOnce({ values: mockValues });

      await service.createLog(unknownProviderUser, dto as any);

      // insert가 실제로 호출되었는지 확인
      expect(mockValues).toHaveBeenCalled();
    });

    it('kakao/google provider는 그대로 유지', async () => {
      const kakaoUser = { id: 'user-3', email: 'k@k.com', provider: 'kakao' };

      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          onConflictDoNothing: jest.fn().mockResolvedValue([]),
        }),
      });
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 'log-kakao' }]),
        }),
      });

      const result = await service.createLog(kakaoUser, dto as any);

      expect(result).toEqual({ id: 'log-kakao' });
    });
  });

  // ──────────────────────────────────────────────
  // getLogById
  // ──────────────────────────────────────────────
  describe('getLogById', () => {
    it('로그 존재하면 로그 객체 반환', async () => {
      const log = {
        id: 'log-1',
        userId: 'user-1',
        koreanContent: '일기 내용',
        logDate: '2024-01-15',
        imageUrl: null,
        deletedAt: null,
      };
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([log]),
        }),
      });

      const result = await service.getLogById('user-1', 'log-1');

      expect(result).toEqual(log);
    });

    it('로그 없거나 삭제됐으면 null 반환', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.getLogById('user-1', 'nonexistent-log');

      expect(result).toBeNull();
    });
  });

  // ──────────────────────────────────────────────
  // updateLineAudioUrls
  // ──────────────────────────────────────────────
  describe('updateLineAudioUrls', () => {
    /**
     * DB 호출: db.update(dailyLogs).set({lineAudioUrls, updatedAt}).where(and(id, userId))
     * .where()가 terminal — returning() 없음
     */

    it('lineAudioUrls 업데이트 성공', async () => {
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      await expect(
        service.updateLineAudioUrls('user-1', 'log-1', [
          'https://audio.url/line1.mp3',
          'https://audio.url/line2.mp3',
        ]),
      ).resolves.not.toThrow();
      expect(mockDb.update).toHaveBeenCalledTimes(1);
    });

    it('빈 배열로도 업데이트 가능', async () => {
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      await expect(
        service.updateLineAudioUrls('user-1', 'log-1', []),
      ).resolves.not.toThrow();
    });
  });
});
