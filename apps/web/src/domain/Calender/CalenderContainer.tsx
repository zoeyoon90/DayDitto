'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchMonthlyLogs } from '@/api/logs.api'
import CalenderHeader from './components/CalenderHeader'
import CalenderGrid from './components/CalenderGrid'
import { useMonthNavigation } from '@/hooks/calendar/useMonthNavigation'

interface CalenderContainerProps {
  initialYear: number
  initialMonth: number
}

export default function CalenderContainer({ initialYear, initialMonth }: CalenderContainerProps) {
  const { year, month, handlePrev, handleNext } = useMonthNavigation(initialYear, initialMonth)

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.calendar(year, month),
    queryFn: () => fetchMonthlyLogs(year, month),
  })

  return (
    <div className="bg-main/15 border-2 border-border shadow-shadow rounded-base p-2 sm:p-4 max-w-153.5 w-full mx-auto">
      <CalenderHeader
        year={year}
        month={month}
        onPrev={handlePrev}
        onNext={handleNext}
      />
      {isError ? (
        <div className="flex items-center justify-center h-64 text-foreground/40">불러오기 실패</div>
      ) : isLoading || !data ? (
        <div className="flex items-center justify-center h-64 text-foreground/40">불러오는 중...</div>
      ) : (
        <CalenderGrid
          year={year}
          month={month}
          logs={data.logs}
          timezone={data.timezone}
        />
      )}
    </div>
  )
}
