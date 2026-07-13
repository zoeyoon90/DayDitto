import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchLogDetailServer } from '@/api/logs.server'
import DetailLogContainer from '@/domain/DetailLog/DetailLogContainer'

interface Props {
  searchParams: Promise<{ id?: string }>
}

export default async function DetailLogPage({ searchParams }: Props) {
  const { id } = await searchParams
  if (!id) return <main className="pt-15 text-center text-foreground/40">일기를 찾을 수 없습니다.</main>

  const queryClient = new QueryClient()
  try {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.log(id),
      queryFn: () => fetchLogDetailServer(id),
    })
  } catch {
    // prefetch 실패 시 클라이언트에서 재시도
  }

  return (
    <div className="flex flex-col items-center px-2 sm:px-4">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DetailLogContainer logId={id} />
      </HydrationBoundary>
    </div>
  )
}
