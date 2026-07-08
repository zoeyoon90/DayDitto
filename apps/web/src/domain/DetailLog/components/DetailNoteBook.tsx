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
}

export default function DetailNoteBook({ koreanContent, englishContent }: Props) {
  const koreanLines = koreanContent.split('\n')
  const englishLines = englishContent?.split('\n') ?? []

  return (
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
  )
}
