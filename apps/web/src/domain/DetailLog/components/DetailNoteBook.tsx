'use client'

import { useRef, useState } from 'react'

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
  logId: string
  koreanContent: string
  englishContent: string | null
  lineAudioUrls: string[] | null
}

export default function DetailNoteBook({ logId, koreanContent, englishContent, lineAudioUrls }: Props) {
  const koreanLines = koreanContent.split('\n')
  const englishLines = englishContent?.split('\n') ?? []

  const [urls, setUrls] = useState<(string | null)[]>(lineAudioUrls ?? [])
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [playingAll, setPlayingAll] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const getOrFetchUrl = async (index: number): Promise<string | null> => {
    if (urls[index]) return urls[index]!
    const line = englishLines[index]
    if (!line) return null

    setLoadingIndex(index)
    try {
      const res = await fetch('/api/tts-line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId, lineIndex: index, text: line }),
      })
      const data = (await res.json()) as { audioUrl?: string; error?: string }
      if (!res.ok || !data.audioUrl) return null
      setUrls((prev) => {
        const next = [...prev]
        next[index] = data.audioUrl!
        return next
      })
      return data.audioUrl!
    } finally {
      setLoadingIndex(null)
    }
  }

  const stopCurrent = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.onended = null
      audioRef.current = null
    }
    setPlayingIndex(null)
    setPlayingAll(false)
  }

  const playLine = async (index: number) => {
    if (playingIndex === index) {
      stopCurrent()
      return
    }
    stopCurrent()

    const url = await getOrFetchUrl(index)
    if (!url) return

    const audio = new Audio(url)
    audioRef.current = audio
    audio.onended = () => {
      setPlayingIndex(null)
      audioRef.current = null
    }
    audio.play()
    setPlayingIndex(index)
  }

  const playAll = async () => {
    if (playingAll) {
      stopCurrent()
      return
    }
    stopCurrent()
    setPlayingAll(true)

    const playNext = async (index: number) => {
      if (index >= englishLines.length) {
        setPlayingAll(false)
        setPlayingIndex(null)
        return
      }
      if (!englishLines[index]) {
        playNext(index + 1)
        return
      }
      const url = await getOrFetchUrl(index)
      if (!url) {
        playNext(index + 1)
        return
      }
      const audio = new Audio(url)
      audioRef.current = audio
      setPlayingIndex(index)
      audio.onended = () => playNext(index + 1)
      audio.play()
    }

    playNext(0)
  }

  const hasAny = englishLines.some(Boolean)

  return (
    <div className="flex flex-col gap-2">
      {hasAny && (
        <div className="flex justify-end">
          <button
            onClick={playAll}
            disabled={loadingIndex !== null}
            className="flex items-center gap-1.5 border border-border rounded-base px-3 h-7 text-xs text-foreground/70 hover:text-foreground hover:bg-main/10 transition-colors disabled:opacity-40"
          >
            <span className="text-sm leading-none">{playingAll ? '⏹' : '▶'}</span>
            <span>{playingAll ? '정지' : '전체 듣기'}</span>
          </button>
        </div>
      )}
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
              <div className="flex items-center h-[26px] pl-[25px] pr-2 bg-background/50">
                <p className="text-xs text-accent leading-6 flex-1">{englishLines[i]}</p>
                <button
                  onClick={() => playLine(i)}
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
