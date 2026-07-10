import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchMonthlyLogsServer } from '@/api/logs.server'
import CalendarContainer from '@/domain/Calendar/CalendarContainer'

interface CalendarPageProps {
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams
  const now = new Date()
  const year = params.year ? parseInt(params.year, 10) : now.getFullYear()
  const month = params.month ? parseInt(params.month, 10) : now.getMonth() + 1

  const queryClient = new QueryClient()
  try {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.calendar(year, month),
      queryFn: () => fetchMonthlyLogsServer(year, month),
    })
  } catch {
    // prefetch 실패 시 클라이언트에서 재시도
  }

  return (
    <div className="flex flex-col items-center py-4 px-2 sm:py-6 sm:px-4">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CalendarContainer initialYear={year} initialMonth={month} />
      </HydrationBoundary>
    </div>
  )
}
