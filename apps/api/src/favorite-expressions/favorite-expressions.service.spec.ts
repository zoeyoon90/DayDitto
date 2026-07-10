/**
 * FavoriteExpressionsService 유닛 테스트
 *
 * 핵심 검증 포인트: 권한 체크 (본인 것만 수정/삭제 가능)
 * - NotFoundException: 존재하지 않는 ID
 * - ForbiddenException: 다른 유저의 리소스 접근
 */
import { NotFoundException, ForbiddenException } from '@nestjs/common'
import { FavoriteExpressionsService } from './favorite-expressions.service'
import { db } from '../db'

jest.mock('../db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockDb = db as unknown as {
  select: jest.Mock
  insert: jest.Mock
  update: jest.Mock
  delete: jest.Mock
}

describe('FavoriteExpressionsService', () => {
  let service: FavoriteExpressionsService

  beforeEach(() => {
    service = new FavoriteExpressionsService()
    jest.clearAllMocks()
  })

  // ──────────────────────────────────────────────
  // findAll
  // ──────────────────────────────────────────────
  describe('findAll', () => {
    /**
     * DB 호출: db.select().from().where().orderBy()
     * orderBy가 terminal (마지막 호출)
     */

    it('유저의 즐겨찾기 전체 반환', async () => {
      const items = [
        { id: 'f1', koreanText: '안녕하세요', englishText: 'Hello', userId: 'user-1' },
        { id: 'f2', koreanText: '감사합니다', englishText: 'Thank you', userId: 'user-1' },
      ]
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(items),
          }),
        }),
      })

      const result = await service.findAll('user-1')

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('f1')
    })

    it('즐겨찾기 없으면 빈 배열 반환', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await service.findAll('user-1')

      expect(result).toEqual([])
    })

    it('dailyLogId 필터링 가능', async () => {
      const filteredItem = [
        { id: 'f1', koreanText: '좋다', englishText: 'Good', userId: 'user-1', dailyLogId: 'log-1' },
      ]
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(filteredItem),
          }),
        }),
      })

      const result = await service.findAll('user-1', 'log-1')

      expect(result).toHaveLength(1)
      expect(result[0].dailyLogId).toBe('log-1')
    })
  })

  // ──────────────────────────────────────────────
  // create
  // ──────────────────────────────────────────────
  describe('create', () => {
    it('즐겨찾기 생성 후 생성된 객체 반환', async () => {
      const created = {
        id: 'fav-new',
        userId: 'user-1',
        koreanText: '배가 고프다',
        englishText: 'I am hungry',
        audioUrl: null,
        dailyLogId: null,
        createdAt: new Date(),
      }
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([created]),
        }),
      })

      const result = await service.create('user-1', {
        koreanText: '배가 고프다',
        englishText: 'I am hungry',
      })

      expect(result).toEqual(created)
    })

    it('audioUrl과 dailyLogId 선택 필드 포함 가능', async () => {
      const created = {
        id: 'fav-2',
        userId: 'user-1',
        koreanText: '날씨가 좋다',
        englishText: 'The weather is nice',
        audioUrl: 'https://audio.url/1.mp3',
        dailyLogId: 'log-1',
      }
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([created]),
        }),
      })

      const result = await service.create('user-1', {
        koreanText: '날씨가 좋다',
        englishText: 'The weather is nice',
        audioUrl: 'https://audio.url/1.mp3',
        dailyLogId: 'log-1',
      })

      expect(result.audioUrl).toBe('https://audio.url/1.mp3')
    })
  })

  // ──────────────────────────────────────────────
  // remove
  // ──────────────────────────────────────────────
  describe('remove', () => {
    /**
     * remove 내부 DB 호출 순서:
     * 1. db.select({userId}).from(favoriteExpressions).where(eq(id))  ← 존재/소유자 확인
     * 2. db.delete(favoriteExpressions).where(and(id, userId))        ← 삭제
     *
     * 권한 체크 로직:
     * - 없음 → NotFoundException
     * - userId 불일치 → ForbiddenException
     * - 일치 → 삭제 진행
     */

    it('본인 즐겨찾기 삭제 성공', async () => {
      // 1. 존재 확인 → 본인 소유
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ userId: 'user-1' }]),
        }),
      })
      // 2. 삭제 실행
      mockDb.delete.mockReturnValueOnce({
        where: jest.fn().mockResolvedValue([]),
      })

      await expect(service.remove('user-1', 'fav-1')).resolves.not.toThrow()
      expect(mockDb.delete).toHaveBeenCalledTimes(1)
    })

    it('존재하지 않는 ID → NotFoundException', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]), // 없음
        }),
      })

      await expect(service.remove('user-1', 'nonexistent')).rejects.toThrow(NotFoundException)
      // 삭제 호출 없어야 함
      expect(mockDb.delete).not.toHaveBeenCalled()
    })

    it('다른 유저 즐겨찾기 삭제 시도 → ForbiddenException', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ userId: 'other-user' }]), // 다른 유저 소유
        }),
      })

      await expect(service.remove('user-1', 'fav-1')).rejects.toThrow(ForbiddenException)
      expect(mockDb.delete).not.toHaveBeenCalled()
    })
  })

  // ──────────────────────────────────────────────
  // updateAudioUrl
  // ──────────────────────────────────────────────
  describe('updateAudioUrl', () => {
    /**
     * updateAudioUrl 내부 DB 호출 순서:
     * 1. db.select({userId}).from().where()    ← 존재/소유자 확인
     * 2. db.update().set().where().returning() ← 업데이트
     */

    it('본인 즐겨찾기 audioUrl 업데이트 성공', async () => {
      const updated = {
        id: 'fav-1',
        userId: 'user-1',
        koreanText: '안녕',
        englishText: 'Hello',
        audioUrl: 'https://audio.url/hello.mp3',
      }
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ userId: 'user-1' }]),
        }),
      })
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updated]),
          }),
        }),
      })

      const result = await service.updateAudioUrl('user-1', 'fav-1', 'https://audio.url/hello.mp3')

      expect(result).toEqual(updated)
      expect(result.audioUrl).toBe('https://audio.url/hello.mp3')
    })

    it('존재하지 않으면 NotFoundException', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      })

      await expect(
        service.updateAudioUrl('user-1', 'nonexistent', 'url'),
      ).rejects.toThrow(NotFoundException)
      expect(mockDb.update).not.toHaveBeenCalled()
    })

    it('다른 유저 즐겨찾기 수정 시도 → ForbiddenException', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ userId: 'other-user' }]),
        }),
      })

      await expect(
        service.updateAudioUrl('user-1', 'fav-1', 'url'),
      ).rejects.toThrow(ForbiddenException)
      expect(mockDb.update).not.toHaveBeenCalled()
    })
  })
})
