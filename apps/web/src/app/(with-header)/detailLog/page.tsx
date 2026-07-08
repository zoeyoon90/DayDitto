import Image from 'next/image'
import { apiFetchWithAuth } from '@/lib/api.server'
import { DailyLogDetail } from '@/types/calendar'

interface Props {
  searchParams: Promise<{ id?: string }>
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

const notebookStyle = {
  backgroundColor: '#fdfaf4',
  backgroundImage: `
    repeating-linear-gradient(
      transparent 0px,
      transparent 25px,
      rgba(150, 175, 220, 0.55) 25px,
      rgba(150, 175, 220, 0.55) 26px
    ),
    linear-gradient(
      90deg,
      transparent 0px,
      transparent 19px,
      rgba(210, 100, 100, 0.45) 15px,
      rgba(210, 100, 100, 0.45) 21px,
      transparent 1px
    )
  `,
  backgroundSize: '100% 26px, 100% 100%',
  backgroundPosition: '0 5px, 0 0',
  paddingTop: '5px',
}

export default async function DetailLogPage({ searchParams }: Props) {
  const { id } = await searchParams
  if (!id) return <main className="pt-24 text-center text-foreground/40">일기를 찾을 수 없습니다.</main>

  const log = await apiFetchWithAuth<DailyLogDetail>(`/daily-logs/${id}`)
  if (!log) return <main className="pt-24 text-center text-foreground/40">일기를 찾을 수 없습니다.</main>

  const koreanLines = log.koreanContent.split('\n')
  const englishLines = log.englishContent?.split('\n') ?? []

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* 날짜/이미지 navbar — create 구조 동일 */}
      <div className="flex items-center gap-2 px-1 py-2 border-b border-border/10">
        <div className="border border-border rounded-base px-2 h-7 flex items-center shrink-0">
          <p className="text-sm text-foreground/90 whitespace-nowrap">{formatDate(log.logDate)}</p>
        </div>

        {log.imageUrl && (
          <>
            <div className="w-px h-4 bg-border shrink-0" />
            <div className="relative w-8 h-8 border border-border rounded-base overflow-hidden shrink-0">
              <Image
                src={log.imageUrl}
                alt="일기 이미지"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          </>
        )}
      </div>

      {/* 노트북 카드 — Korean/English 교대 (DiaryLine 구조 동일) */}
      <div
        className="border-2 border-border shadow-shadow rounded-base overflow-hidden"
        style={notebookStyle}
      >
        {koreanLines.map((korean, i) => (
          <div key={i}>
            <div className="flex items-center h-[26px] pl-[25px] pr-4">
              <p className="text-sm text-foreground leading-6">{korean}</p>
            </div>
            {englishLines[i] && (
              <div className="flex items-center h-[26px] pl-[25px] pr-4 bg-background/50">
                <p className="text-xs text-accent leading-6">{englishLines[i]}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
