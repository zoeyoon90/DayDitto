import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchLogDetail } from '@/api/logs.api'

export function DetailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')

  const { data: log, isLoading } = useQuery({
    queryKey: ['log', id],
    queryFn: () => fetchLogDetail(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-card">
        <p className="text-foreground/60">로딩 중...</p>
      </div>
    )
  }

  if (!log) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-card">
        <p className="text-foreground/60">일기를 찾을 수 없습니다</p>
      </div>
    )
  }

  const date = new Date(log.logDate)
  const dateLabel = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`

  return (
    <div className="min-h-screen bg-card px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-foreground/60">&larr;</button>
        <h2 className="text-lg font-bold">{dateLabel}</h2>
      </div>

      <section className="mb-6">
        <h3 className="text-sm text-foreground/50 mb-2">한국어</h3>
        <p className="whitespace-pre-wrap leading-relaxed">{log.koreanContent}</p>
      </section>

      {log.englishContent && (
        <section className="mb-6">
          <h3 className="text-sm text-foreground/50 mb-2">English</h3>
          <p className="whitespace-pre-wrap leading-relaxed">{log.englishContent}</p>
        </section>
      )}

      {(log.mood || log.weather) && (
        <div className="flex gap-4 text-sm text-foreground/60">
          {log.mood && <span>기분: {log.mood}</span>}
          {log.weather && <span>날씨: {log.weather}</span>}
        </div>
      )}
    </div>
  )
}
