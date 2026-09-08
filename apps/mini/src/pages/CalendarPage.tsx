import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { fetchMonthlyLogs } from '@/api/logs.api'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export function CalendarPage() {
  const { user, authError, retryAuth } = useAuth()
  const navigate = useNavigate()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const { data } = useQuery({
    queryKey: ['calendar', year, month],
    queryFn: () => fetchMonthlyLogs(year, month),
    enabled: !!user,
  })

  const logDates = useMemo(() => {
    const map = new Map<string, string>()
    data?.logs.forEach((log) => map.set(log.logDate, log.id))
    return map
  }, [data])

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const days: (number | null)[] = Array(firstDay).fill(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    return days
  }, [year, month])

  const prevMonth = () => {
    if (month === 1) { setYear(year - 1); setMonth(12) }
    else setMonth(month - 1)
  }

  const nextMonth = () => {
    if (month === 12) { setYear(year + 1); setMonth(1) }
    else setMonth(month + 1)
  }

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-card px-4 gap-4">
        <p className="text-red-500 text-center">인증에 실패했습니다.<br />토스 앱에서 다시 시도해주세요.</p>
        <button
          onClick={retryAuth}
          className="bg-main text-white px-6 py-2 rounded-[var(--radius-base)] text-sm"
        >
          다시 시도
        </button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-card">
        <p className="text-foreground/60">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-card px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-main">DayDitto</h1>
        <button
          onClick={() => navigate(`/write?date=${todayStr}`)}
          className="bg-main text-white px-4 py-2 rounded-[var(--radius-base)] text-sm"
        >
          오늘 일기 쓰기
        </button>
      </div>

      <div className="flex items-center justify-center gap-6 mb-4">
        <button onClick={prevMonth} className="text-foreground/60 text-lg">&lt;</button>
        <span className="text-lg font-bold">{year}년 {month}월</span>
        <button onClick={nextMonth} className="text-foreground/60 text-lg">&gt;</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1 text-foreground/50 text-xs">{d}</div>
        ))}
        {calendarDays.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const logId = logDates.get(dateStr)
          const isToday = dateStr === todayStr

          return (
            <div key={dateStr} className="py-2">
              {logId ? (
                <button
                  onClick={() => navigate(`/detail?id=${logId}`)}
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-main/20 text-main font-bold ${isToday ? 'ring-2 ring-main' : ''}`}
                >
                  {day}
                </button>
              ) : (
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${isToday ? 'ring-2 ring-accent' : ''} text-foreground/70`}>
                  {day}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-2 mt-4 text-xs text-foreground/50">
        <span className="inline-block w-3 h-3 rounded-full bg-main/20" />
        <span>일기 작성됨</span>
      </div>
    </div>
  )
}
