import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { fetchMonthlyLogs } from '@/api/logs.api'
import { Button } from '@/components/Button'

const WEEKDAYS = [
  { label: '일', color: 'text-red-500' },
  { label: '월', color: 'text-foreground' },
  { label: '화', color: 'text-foreground' },
  { label: '수', color: 'text-foreground' },
  { label: '목', color: 'text-foreground' },
  { label: '금', color: 'text-foreground' },
  { label: '토', color: 'text-blue-500' },
]

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
    const map = new Map<string, { id: string; imageUrl: string | null }>()
    data?.logs.forEach((log) => map.set(log.logDate, { id: log.id, imageUrl: log.imageUrl }))
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 gap-4">
        <p className="text-red-500 text-center">인증에 실패했습니다.<br />토스 앱에서 다시 시도해주세요.</p>
        <p className="text-xs text-red-400 text-center break-all px-2">{authError}</p>
        <Button variant="noShadow" onClick={retryAuth}>다시 시도</Button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-main rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-main" style={{ fontFamily: 'var(--font-yeongwol)' }}>
          DayDitto
        </h1>
        <Button variant="noShadow" size="sm" onClick={() => navigate(`/write?date=${todayStr}`)}>
          오늘 일기 쓰기
        </Button>
      </div>

      {/* Calendar Card */}
      <div className="bg-main/15 border-2 border-border shadow-shadow rounded-base p-3">
        {/* Month Nav */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="noShadow" size="icon" onClick={prevMonth}>‹</Button>
          <h2 className="text-lg font-bold text-foreground">{year}년 {month}월</h2>
          <Button variant="noShadow" size="icon" onClick={nextMonth}>›</Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {WEEKDAYS.map(({ label, color }) => (
            <div key={label} className={`text-center text-xs font-bold py-1 ${color}`}>{label}</div>
          ))}
          {calendarDays.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="aspect-square" />
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const logInfo = logDates.get(dateStr)
            const isToday = dateStr === todayStr
            const dayOfWeek = i % 7

            return (
              <div key={dateStr} className="aspect-square">
                {logInfo ? (
                  <button
                    onClick={() => navigate(`/detail?id=${logInfo.id}`)}
                    className={`relative w-full h-full rounded-base border-2 border-border overflow-hidden flex items-start ${
                      isToday ? 'ring-4 ring-main ring-offset-0' : ''
                    }`}
                  >
                    {logInfo.imageUrl ? (
                      <img src={logInfo.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : null}
                    <span className={`relative z-10 text-[10px] font-bold p-0.5 ${
                      logInfo.imageUrl ? 'text-bw drop-shadow-sm' : 'text-foreground'
                    }`}>{day}</span>
                    {!logInfo.imageUrl && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-main" />
                    )}
                  </button>
                ) : (
                  <div className={`w-full h-full rounded-base border-2 border-border flex items-start ${
                    isToday ? 'ring-4 ring-main ring-offset-0' : ''
                  }`}>
                    <span className={`text-[10px] font-bold p-0.5 ${
                      isToday ? 'text-main' : dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : 'text-foreground'
                    }`}>{day}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-foreground/50">
        <span className="inline-block w-2 h-2 rounded-full bg-main" />
        <span>일기 작성됨</span>
      </div>
    </div>
  )
}
