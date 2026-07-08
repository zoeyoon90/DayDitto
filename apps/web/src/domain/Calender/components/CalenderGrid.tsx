import { MonthlyLog } from '@/types/calendar';
import {
  buildCalendarGrid,
  formatDateKey,
  getTodayInTimezone,
} from '@/lib/calendar';
import CalenderCell from './CalenderCell';

const DAY_LABELS = [
  { label: '일', className: 'text-red-500' },
  { label: '월', className: 'text-foreground' },
  { label: '화', className: 'text-foreground' },
  { label: '수', className: 'text-foreground' },
  { label: '목', className: 'text-foreground' },
  { label: '금', className: 'text-foreground' },
  { label: '토', className: 'text-blue-500' },
];

interface CalenderGridProps {
  year: number;
  month: number;
  logs: MonthlyLog[];
  timezone: string;
}

export default function CalenderGrid({
  year,
  month,
  logs,
  timezone,
}: CalenderGridProps) {
  const grid = buildCalendarGrid(year, month);
  const todayStr = getTodayInTimezone(timezone);

  const logMap = new Map<string, MonthlyLog>();
  logs.forEach((log) => logMap.set(log.logDate, log));

  return (
    <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
      {DAY_LABELS.map(({ label, className }) => (
        <div
          key={label}
          className={
            `text-center text-xs font-bold py-1 ${className}`
          }
        >
          {label}
        </div>
      ))}
      {grid.map((date, idx) => {
        const dayOfWeek = idx % 7;
        const dateKey = date ? formatDateKey(date) : null;
        const log = dateKey ? (logMap.get(dateKey) ?? null) : null;
        const isToday = dateKey === todayStr;

        return (
          <CalenderCell
            key={idx}
            date={date}
            log={log}
            isToday={isToday}
            isSunday={dayOfWeek === 0}
            isSaturday={dayOfWeek === 6}
          />
        );
      })}
    </div>
  );
}
