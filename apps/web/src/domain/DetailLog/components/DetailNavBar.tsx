import Image from 'next/image'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

interface Props {
  logDate: string
  weather: string | null
  mood: string | null
  imageUrl: string | null
}

export default function DetailNavBar({ logDate, weather, mood, imageUrl }: Props) {
  return (
    <div className="flex items-center gap-2 px-1 py-2 border-b border-border/10">
      <div className="border border-border rounded-base px-2 h-7 flex items-center shrink-0">
        <p className="text-sm text-foreground/90 whitespace-nowrap">{formatDate(logDate)}</p>
      </div>

      <div className="w-px h-4 bg-border shrink-0" />
      <div className="border border-border rounded-base px-2 h-7 flex items-center gap-1 shrink-0">
        <span className="text-xs text-foreground/40">날씨</span>
        {weather && <span className="text-sm leading-none">{weather}</span>}
      </div>

      <div className="w-px h-4 bg-border shrink-0" />
      <div className="border border-border rounded-base px-2 h-7 flex items-center gap-1 shrink-0">
        <span className="text-xs text-foreground/40">감정</span>
        {mood && <span className="text-sm leading-none">{mood}</span>}
      </div>

      {imageUrl && (
        <>
          <div className="w-px h-4 bg-border shrink-0" />
          <div className="relative w-8 h-8 border border-border rounded-base overflow-hidden shrink-0">
            <Image src={imageUrl} alt="일기 이미지" fill unoptimized className="object-cover" />
          </div>
        </>
      )}
    </div>
  )
}
