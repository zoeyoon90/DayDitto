import ImagePreview from './ImagePreview'

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
  hasAudio?: boolean
  playingAll?: boolean
  onPlayAll?: () => void
}

export default function DetailNavBar({ logDate, weather, mood, imageUrl, hasAudio, playingAll, onPlayAll }: Props) {
  return (
    <div className="flex items-center gap-2 px-1 py-2 border-b border-border/10 overflow-x-auto">
      <div className="border border-border rounded-base px-2 h-7 flex items-center shrink-0">
        <p className="text-sm text-foreground/90 whitespace-nowrap">{formatDate(logDate)}</p>
      </div>

      <div className="w-px h-4 bg-border shrink-0" />
      <div className="border border-border rounded-base px-2 h-7 flex items-center shrink-0">
        {weather
          ? <span className="text-sm leading-none">{weather}</span>
          : <span className="text-xs text-foreground/40">날씨</span>}
      </div>

      <div className="w-px h-4 bg-border shrink-0" />
      <div className="border border-border rounded-base px-2 h-7 flex items-center shrink-0">
        {mood
          ? <span className="text-sm leading-none">{mood}</span>
          : <span className="text-xs text-foreground/40">감정</span>}
      </div>

      {imageUrl && (
        <>
          <div className="w-px h-4 bg-border shrink-0" />
          <ImagePreview src={imageUrl} />
        </>
      )}

      {hasAudio && onPlayAll && (
        <>
          <div className="w-px h-4 bg-border shrink-0" />
          <button
            onClick={onPlayAll}
            className={`flex items-center gap-1.5 border border-border rounded-base px-2.5 h-7 text-xs text-foreground/70 hover:text-foreground hover:bg-main/10 transition-colors shrink-0${!imageUrl ? ' ml-auto' : ''}`}
          >
            <span className="text-sm leading-none">{playingAll ? '⏹' : '▶'}</span>
            <span>{playingAll ? '정지' : '전체 듣기'}</span>
          </button>
        </>
      )}
    </div>
  )
}
