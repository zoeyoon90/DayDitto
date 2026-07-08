import { apiFetchWithAuth } from '@/lib/api.server'
import { DailyLogDetail } from '@/types/calendar'
import DetailLogContainer from '@/domain/DetailLog/DetailLogContainer'

interface Props {
  searchParams: Promise<{ id?: string }>
}

export default async function DetailLogPage({ searchParams }: Props) {
  const { id } = await searchParams
  if (!id) return <main className="pt-15 text-center text-foreground/40">일기를 찾을 수 없습니다.</main>

  const log = await apiFetchWithAuth<DailyLogDetail>(`/daily-logs/${id}`)

  return (
    <div className="flex flex-col items-center px-4">
      <DetailLogContainer log={log} />
    </div>
  )
}
