import CalenderContainer from '@/domain/Calender/CalenderContainer'

interface CalenderPageProps {
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function CalenderPage({ searchParams }: CalenderPageProps) {
  const params = await searchParams
  const now = new Date()
  const year = params.year ? parseInt(params.year, 10) : now.getFullYear()
  const month = params.month ? parseInt(params.month, 10) : now.getMonth() + 1

  return (
    <div className="flex flex-col items-center py-4 px-2 sm:py-6 sm:px-4">
      <CalenderContainer initialYear={year} initialMonth={month} />
    </div>
  )
}
