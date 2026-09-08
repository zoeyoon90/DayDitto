import { useState, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { fetchLogDetail, ttsBatch } from '@/api/logs.api'
import { Button } from '@/components/Button'
import { FONTS } from '@/components/FontPickerModal'

export function DetailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')

  const { data: log, isLoading } = useQuery({
    queryKey: ['log', id],
    queryFn: () => fetchLogDetail(id!),
    enabled: !!id,
  })

  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const batchMutation = useMutation({
    mutationFn: ({ logId, lines }: { logId: string; lines: string[] }) => ttsBatch({ logId, lines }),
  })

  const playLine = useCallback((url: string, index: number) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (playingIndex === index) {
      setPlayingIndex(null)
      return
    }
    const audio = new Audio(url)
    audioRef.current = audio
    setPlayingIndex(index)
    audio.onended = () => setPlayingIndex(null)
    audio.play()
  }, [playingIndex])

  const handlePlayAll = async () => {
    if (!log) return
    const lines = log.englishContent?.split('\n').filter(Boolean)
    if (!lines?.length) return

    let urls = log.lineAudioUrls
    if (!urls?.length) {
      const result = await batchMutation.mutateAsync({ logId: log.id, lines })
      urls = result.lineAudioUrls
    }

    for (let i = 0; i < urls.length; i++) {
      setPlayingIndex(i)
      await new Promise<void>((resolve) => {
        const audio = new Audio(urls![i])
        audioRef.current = audio
        audio.onended = () => resolve()
        audio.play()
      })
    }
    setPlayingIndex(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-main rounded-full animate-spin" />
      </div>
    )
  }

  if (!log) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <p className="text-foreground/60">일기를 찾을 수 없습니다</p>
        <Button variant="neutral" onClick={() => navigate('/')}>돌아가기</Button>
      </div>
    )
  }

  const date = new Date(log.logDate)
  const dateLabel = date.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  })

  const fontCss = FONTS.find((f) => f.key === log.font)?.cssVar ?? 'var(--font-yeongwol)'
  const englishLines = log.englishContent?.split('\n').filter(Boolean) ?? []

  return (
    <div className="min-h-screen bg-background px-4 py-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="text-foreground/60 text-lg">←</button>
        <div className="border border-border rounded-base px-2 h-7 flex items-center">
          <p className="text-sm text-foreground/90">{dateLabel}</p>
        </div>
      </div>

      {/* Mood & Weather */}
      {(log.mood || log.weather) && (
        <div className="flex items-center gap-2 mb-4 text-lg">
          {log.weather && <span>{log.weather}</span>}
          {log.mood && <span>{log.mood}</span>}
        </div>
      )}

      {/* Image */}
      {log.imageUrl && (
        <div className="mb-4 border-2 border-border rounded-base overflow-hidden shadow-shadow">
          <img src={log.imageUrl} alt="일기 이미지" className="w-full max-h-56 object-cover" />
        </div>
      )}

      {/* Korean Content */}
      <div className="border-2 border-border shadow-shadow rounded-base overflow-hidden mb-4">
        <div className="px-3 py-1.5 border-b border-border/30 bg-main/10">
          <span className="text-xs text-foreground/50">한국어</span>
        </div>
        <div
          className="p-3"
          style={{
            backgroundColor: '#fdfaf4',
            backgroundImage: `repeating-linear-gradient(transparent 0px, transparent 25px, rgba(150,175,220,0.55) 25px, rgba(150,175,220,0.55) 26px)`,
            backgroundSize: '100% 26px',
            backgroundPosition: '0 5px',
          }}
        >
          <p className="whitespace-pre-wrap leading-[26px] text-sm" style={{ fontFamily: fontCss }}>
            {log.koreanContent}
          </p>
        </div>
      </div>

      {/* English Content with TTS */}
      {log.englishContent && (
        <div className="border-2 border-border shadow-shadow rounded-base overflow-hidden mb-4 bg-card">
          <div className="px-3 py-1.5 border-b border-border/30 flex items-center justify-between">
            <span className="text-xs text-foreground/50">English</span>
            <button
              onClick={handlePlayAll}
              disabled={batchMutation.isPending}
              className="text-xs text-accent hover:text-main transition-colors disabled:opacity-50"
            >
              {batchMutation.isPending ? '생성 중...' : '▶ 전체 듣기'}
            </button>
          </div>
          <div className="p-3">
            {englishLines.map((line, i) => (
              <div key={i} className="flex items-start gap-2 mb-1">
                {log.lineAudioUrls?.[i] && (
                  <button
                    onClick={() => playLine(log.lineAudioUrls![i], i)}
                    className={`shrink-0 w-5 h-5 rounded-full border border-border flex items-center justify-center text-[10px] transition-colors ${
                      playingIndex === i ? 'bg-main text-white' : 'hover:bg-main/20'
                    }`}
                  >
                    {playingIndex === i ? '■' : '▶'}
                  </button>
                )}
                <p className="text-sm leading-relaxed">{line}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
