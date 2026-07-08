'use client'

import { useRouter } from 'next/navigation'
import { MonthlyLogsResponse } from '@/types/calendar'
import CalenderHeader from './components/CalenderHeader'
import CalenderGrid from './components/CalenderGrid'

interface CalenderContainerProps {
  data: MonthlyLogsResponse
  year: number
  month: number
}

export default function CalenderContainer({ data, year, month }: CalenderContainerProps) {
  const router = useRouter()

  const handlePrev = () => {
    const d = new Date(year, month - 2, 1)
    router.push(`/calender?year=${d.getFullYear()}&month=${d.getMonth() + 1}`)
  }

  const handleNext = () => {
    const d = new Date(year, month, 1)
    router.push(`/calender?year=${d.getFullYear()}&month=${d.getMonth() + 1}`)
  }

  return (
    <div className="bg-main/15 border-2 border-border shadow-shadow rounded-base p-2 sm:p-4 max-w-153.5 w-full mx-auto">
      <CalenderHeader
        year={year}
        month={month}
        onPrev={handlePrev}
        onNext={handleNext}
      />
      <CalenderGrid
        year={year}
        month={month}
        logs={data.logs}
        timezone={data.timezone}
      />
    </div>
  )
}
