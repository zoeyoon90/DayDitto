import { apiFetchWithAuth } from '@/lib/api.server'
import { MonthlyLogsResponse } from '@/types/calendar'
import CalenderContainer from '@/domain/Calender/CalenderContainer'

interface CalenderPageProps {
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function CalenderPage({ searchParams }: CalenderPageProps) {
  const params = await searchParams
  const now = new Date()
  const year = params.year ? parseInt(params.year, 10) : now.getFullYear()
  const month = params.month ? parseInt(params.month, 10) : now.getMonth() + 1

  const data = await apiFetchWithAuth<MonthlyLogsResponse>(
    `/daily-logs/monthly?year=${year}&month=${month}`,
  )

  return (
    <div className="flex flex-col items-center py-6 px-4">
      <CalenderContainer data={data} year={year} month={month} />
    </div>
  )
}
