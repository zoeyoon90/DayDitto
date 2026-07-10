/**
 * DailyLogsController 유닛 테스트
 *
 * 핵심 검증 포인트: 컨트롤러 자체 입력값 검증 로직
 * - year, month 파라미터 유효성 검사 (BadRequestException)
 * - 정상 파라미터는 서비스로 위임
 *
 * 참고: @UseGuards(JwtGuard)는 컨트롤러 메서드를 직접 호출하면 작동 안 함
 * → Guard 테스트는 jwt.guard.spec.ts에서 따로 진행
 */
import { BadRequestException } from '@nestjs/common'
import { DailyLogsController } from './daily-logs.controller'
import { DailyLogsService } from './daily-logs.service'

// DailyLogsService를 완전히 mock으로 교체
// 컨트롤러는 서비스를 "호출하기만" 하는지 확인 — 서비스 내부 로직은 검증 안 함
jest.mock('./daily-logs.service')

describe('DailyLogsController', () => {
  let controller: DailyLogsController
  let service: jest.Mocked<DailyLogsService>

  // 테스트용 인증 유저 객체 (JwtGuard가 request.user에 주입하는 형태)
  const mockReq = {
    user: {
      id: 'user-1',
      email: 'test@test.com',
      provider: 'email',
      role: 'member',
    },
  } as any

  beforeEach(() => {
    // jest.Mocked: 서비스의 모든 메서드를 jest.fn()으로 교체
    service = {
      getMonthlyLogs: jest.fn(),
      createLog: jest.fn(),
      getLogById: jest.fn(),
      updateAudioUrl: jest.fn(),
      updateLineAudioUrls: jest.fn(),
    } as unknown as jest.Mocked<DailyLogsService>

    controller = new DailyLogsController(service)
    jest.clearAllMocks()
  })

  // ──────────────────────────────────────────────
  // getMonthly — 입력값 검증
  // ──────────────────────────────────────────────
  describe('getMonthly', () => {
    /**
     * 컨트롤러 검증 조건:
     * if (!year || isNaN(year) || isNaN(month) || month < 1 || month > 12)
     *   → BadRequestException
     */

    it('month=0 → BadRequestException (1 미만)', () => {
      expect(() => controller.getMonthly(mockReq, '2024', '0')).toThrow(BadRequestException)
    })

    it('month=13 → BadRequestException (12 초과)', () => {
      expect(() => controller.getMonthly(mockReq, '2024', '13')).toThrow(BadRequestException)
    })

    it('month=-1 → BadRequestException', () => {
      expect(() => controller.getMonthly(mockReq, '2024', '-1')).toThrow(BadRequestException)
    })

    it('year 빈 문자열 → BadRequestException (parseInt 결과 NaN)', () => {
      expect(() => controller.getMonthly(mockReq, '', '6')).toThrow(BadRequestException)
    })

    it('month 빈 문자열 → BadRequestException', () => {
      expect(() => controller.getMonthly(mockReq, '2024', '')).toThrow(BadRequestException)
    })

    it('year에 숫자 아닌 문자열 → BadRequestException', () => {
      expect(() => controller.getMonthly(mockReq, 'abc', '6')).toThrow(BadRequestException)
    })

    it('year=0 → BadRequestException (!year는 0도 falsy)', () => {
      // parseInt('0', 10) = 0 → !year가 true → BadRequestException
      expect(() => controller.getMonthly(mockReq, '0', '6')).toThrow(BadRequestException)
    })

    it('정상 파라미터 → 서비스 getMonthlyLogs 호출', () => {
      service.getMonthlyLogs.mockResolvedValue({
        year: 2024,
        month: 6,
        timezone: 'Asia/Seoul',
        logs: [],
      } as any)

      controller.getMonthly(mockReq, '2024', '6')

      expect(service.getMonthlyLogs).toHaveBeenCalledTimes(1)
      expect(service.getMonthlyLogs).toHaveBeenCalledWith('user-1', 2024, 6)
    })

    it('month=1 (경계값 최솟값) 정상 처리', () => {
      service.getMonthlyLogs.mockResolvedValue({} as any)

      controller.getMonthly(mockReq, '2024', '1')

      expect(service.getMonthlyLogs).toHaveBeenCalledWith('user-1', 2024, 1)
    })

    it('month=12 (경계값 최댓값) 정상 처리', () => {
      service.getMonthlyLogs.mockResolvedValue({} as any)

      controller.getMonthly(mockReq, '2024', '12')

      expect(service.getMonthlyLogs).toHaveBeenCalledWith('user-1', 2024, 12)
    })
  })

  // ──────────────────────────────────────────────
  // createLog
  // ──────────────────────────────────────────────
  describe('createLog', () => {
    it('request.user와 body를 서비스에 전달', () => {
      const dto = {
        logDate: '2024-06-15',
        koreanContent: '오늘 일기',
      }
      service.createLog.mockResolvedValue({ id: 'new-log' } as any)

      controller.createLog(mockReq, dto as any)

      expect(service.createLog).toHaveBeenCalledWith(mockReq.user, dto)
    })
  })

  // ──────────────────────────────────────────────
  // getLog (by ID)
  // ──────────────────────────────────────────────
  describe('getLog', () => {
    it('request.user.id와 param id를 서비스에 전달', () => {
      service.getLogById.mockResolvedValue({ id: 'log-1' } as any)

      controller.getLog(mockReq, 'log-1')

      expect(service.getLogById).toHaveBeenCalledWith('user-1', 'log-1')
    })
  })

  // ──────────────────────────────────────────────
  // updateAudio
  // ──────────────────────────────────────────────
  describe('updateAudio', () => {
    it('audioUrl 업데이트 서비스 호출', () => {
      service.updateAudioUrl.mockResolvedValue(undefined)

      controller.updateAudio(mockReq, 'log-1', { audioUrl: 'https://audio.url/1.mp3' })

      expect(service.updateAudioUrl).toHaveBeenCalledWith('user-1', 'log-1', 'https://audio.url/1.mp3')
    })
  })

  // ──────────────────────────────────────────────
  // updateLineAudio
  // ──────────────────────────────────────────────
  describe('updateLineAudio', () => {
    it('lineAudioUrls 업데이트 서비스 호출', () => {
      service.updateLineAudioUrls.mockResolvedValue(undefined)

      controller.updateLineAudio(mockReq, 'log-1', { lineAudioUrls: ['url1', 'url2'] })

      expect(service.updateLineAudioUrls).toHaveBeenCalledWith('user-1', 'log-1', ['url1', 'url2'])
    })
  })
})
