import DetailLogContainer from '@/domain/DetailLog/DetailLogContainer'

interface Props {
  searchParams: Promise<{ id?: string }>
}

export default async function DetailLogPage({ searchParams }: Props) {
  const { id } = await searchParams
  if (!id) return <main className="pt-15 text-center text-foreground/40">일기를 찾을 수 없습니다.</main>

  return (
    <div className="flex flex-col items-center px-2 sm:px-4">
      <DetailLogContainer logId={id} />
    </div>
  )
}
