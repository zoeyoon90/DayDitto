'use client'

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

interface Props {
  koreanContent: string
  englishContent: string | null
  loadingIndex: number | null
  playingIndex: number | null
  onPlayLine: (index: number) => void
  font?: string
}

export default function DetailNoteBook({ koreanContent, englishContent, loadingIndex, playingIndex, onPlayLine, font }: Props) {
  const koreanLines = koreanContent.split('\n')
  const englishLines = englishContent?.split('\n') ?? []

  return (
    <div
      className="border-2 border-border shadow-shadow rounded-base overflow-x-auto"
      style={{ backgroundColor: '#fdfaf4' }}
    >
      <div className="min-w-max" style={{ ...notebookStyle, fontFamily: font }}>
        {koreanLines.map((korean, i) => (
          <div key={i}>
            <div className="flex items-center h-6.5 pl-6.25 pr-4">
              <p className="text-sm text-foreground leading-6 whitespace-nowrap">{korean}</p>
            </div>
            {englishLines[i] && (
              <div className="flex items-center h-6.5 pl-6.25 pr-2 bg-main">
                <p className="text-xs text-card leading-6 flex-1 whitespace-nowrap">{englishLines[i]}</p>
                <button
                  onClick={() => onPlayLine(i)}
                  disabled={loadingIndex !== null && loadingIndex !== i}
                  className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-foreground/40 hover:text-accent transition-colors disabled:opacity-30"
                  aria-label="발음 듣기"
                >
                  {loadingIndex === i ? (
                    <span className="text-[10px]">...</span>
                  ) : playingIndex === i ? (
                    <span className="text-xs">⏸</span>
                  ) : (
                    <span className="text-xs">🔊</span>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
