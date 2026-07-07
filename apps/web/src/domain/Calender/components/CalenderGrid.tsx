import { MonthlyLog } from '@/types/calendar'
import { buildCalendarGrid, formatDateKey, getTodayInTimezone } from '@/lib/calendar'
import CalenderCell from './CalenderCell'

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

interface CalenderGridProps {
  year: number
  month: number
  logs: MonthlyLog[]
  timezone: string
}

export default function CalenderGrid({ year, month, logs, timezone }: CalenderGridProps) {
  const grid = buildCalendarGrid(year, month)
  const todayStr = getTodayInTimezone(timezone)

  const logMap = new Map<string, MonthlyLog>()
  logs.forEach((log) => logMap.set(log.logDate, log))

  return (
    <div className="grid grid-cols-7 gap-1">
      {DAY_LABELS.map((label) => (
        <div
          key={label}
          className="text-center text-xs font-bold text-foreground py-1"
        >
          {label}
        </div>
      ))}
      {grid.map((date, idx) => {
        const dateKey = date ? formatDateKey(date) : null
        const log = dateKey ? (logMap.get(dateKey) ?? null) : null
        const isToday = dateKey === todayStr

        return (
          <CalenderCell
            key={idx}
            date={date}
            log={log}
            isToday={isToday}
          />
        )
      })}
    </div>
  )
}
