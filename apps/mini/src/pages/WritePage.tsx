import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { createLog, translateText } from '@/api/logs.api'

export function WritePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const dateParam = searchParams.get('date') ?? new Date().toISOString().slice(0, 10)

  const [korean, setKorean] = useState('')
  const [english, setEnglish] = useState('')

  const translateMutation = useMutation({
    mutationFn: (text: string) => translateText(text),
    onSuccess: (data) => setEnglish(data.translated),
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      createLog({
        logDate: dateParam,
        koreanContent: korean,
        englishContent: english || undefined,
      }),
    onSuccess: () => navigate('/'),
  })

  const date = new Date(dateParam)
  const dateLabel = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`

  return (
    <div className="min-h-screen bg-card px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-foreground/60">&larr;</button>
          <h2 className="text-lg font-bold">{dateLabel}</h2>
        </div>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={!korean.trim() || saveMutation.isPending}
          className="bg-main text-white px-4 py-2 rounded-[var(--radius-base)] text-sm disabled:opacity-50"
        >
          {saveMutation.isPending ? '저장 중...' : '저장'}
        </button>
      </div>

      <section className="mb-4">
        <label className="text-sm text-foreground/50 mb-2 block">한국어 일기</label>
        <textarea
          value={korean}
          onChange={(e) => setKorean(e.target.value)}
          placeholder="오늘 하루를 한국어로 적어보세요..."
          rows={6}
          className="w-full border border-foreground/20 rounded-[var(--radius-base)] p-3 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </section>

      <button
        onClick={() => translateMutation.mutate(korean)}
        disabled={!korean.trim() || translateMutation.isPending}
        className="w-full bg-accent text-white py-2 rounded-[var(--radius-base)] text-sm mb-4 disabled:opacity-50"
      >
        {translateMutation.isPending ? '번역 중...' : '영어로 번역하기'}
      </button>

      {english && (
        <section>
          <label className="text-sm text-foreground/50 mb-2 block">English</label>
          <textarea
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            rows={6}
            className="w-full border border-foreground/20 rounded-[var(--radius-base)] p-3 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </section>
      )}

      {(translateMutation.isError || saveMutation.isError) && (
        <p className="text-red-500 text-sm mt-4">
          오류가 발생했습니다. 다시 시도해주세요.
        </p>
      )}
    </div>
  )
}
