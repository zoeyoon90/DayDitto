import Image from 'next/image'
import Link from 'next/link'
import { MonthlyLog } from '@/types/calendar'
import { formatDateKey } from '@/lib/calendar'
import { cn } from '@/lib/utils'

interface CalenderCellProps {
  date: Date | null
  log: MonthlyLog | null
  isToday: boolean
}

export default function CalenderCell({ date, log, isToday }: CalenderCellProps) {
  if (!date) {
    return <div className="aspect-square" />
  }

  const day = date.getDate()
  const dateKey = formatDateKey(date)

  const cellClass = cn(
    'relative aspect-square rounded-base border-2 border-border overflow-hidden flex flex-col',
    isToday && 'ring-2 ring-accent ring-offset-1',
  )

  const content = (
    <>
      {log?.imageUrl ? (
        <Image
          src={log.imageUrl}
          alt={`${dateKey} 일기`}
          fill
          sizes="(max-width: 768px) 14vw, 120px"
          className="object-cover"
        />
      ) : null}
      <span
        className={cn(
          'relative z-10 text-xs font-bold leading-none p-1',
          log?.imageUrl ? 'text-bw drop-shadow-sm' : 'text-foreground',
          isToday && !log?.imageUrl && 'text-main',
        )}
      >
        {day}
      </span>
      {log && !log.imageUrl && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-main" />
      )}
    </>
  )

  if (log) {
    return (
      <Link href={`/detailLog?id=${log.id}`} className={cellClass}>
        {content}
      </Link>
    )
  }

  return <div className={cellClass}>{content}</div>
}
