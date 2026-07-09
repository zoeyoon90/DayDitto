'use client'

import { useState, useEffect } from 'react'
import { fetchFavorites, createFavorite, deleteFavorite } from '@/api/favorites.api'

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
  lineAudioUrls: (string | null)[]
  loadingIndex: number | null
  playingIndex: number | null
  onPlayLine: (index: number) => void
  font?: string
}

export default function DetailNoteBook({ logId, koreanContent, englishContent, lineAudioUrls, loadingIndex, playingIndex, onPlayLine, font }: Props) {
  const koreanLines = koreanContent.split('\n')
  const englishLines = englishContent?.split('\n') ?? []
  const [savedMap, setSavedMap] = useState<Map<number, string>>(new Map()) // index → favoriteId
  const [savingIndex, setSavingIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchFavorites(logId)
      .then((data) => {
        const map = new Map<number, string>()
        data.forEach((fav) => {
          const idx = koreanLines.indexOf(fav.koreanText)
          if (idx !== -1) map.set(idx, fav.id)
        })
        setSavedMap(map)
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logId])

  const handleFavorite = async (index: number) => {
    if (savingIndex !== null) return
    const korean = koreanLines[index]
    const english = englishLines[index]
    if (!korean || !english) return

    setSavingIndex(index)
    const existingId = savedMap.get(index)

    if (existingId) {
      try {
        await deleteFavorite(existingId)
        setSavedMap((prev) => { const next = new Map(prev); next.delete(index); return next })
      } catch {
        // ignore
      } finally {
        setSavingIndex(null)
      }
    } else {
      try {
        const data = await createFavorite({
          dailyLogId: logId,
          koreanText: korean,
          englishText: english,
          audioUrl: lineAudioUrls[index] ?? undefined,
        })
        setSavedMap((prev) => new Map(prev).set(index, data.id))
      } catch {
        // ignore
      } finally {
        setSavingIndex(null)
      }
    }
  }

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
                  onClick={() => handleFavorite(i)}
                  disabled={savingIndex !== null}
                  className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-foreground hover:text-yellow-400 transition-colors disabled:opacity-60"
                  aria-label="즐겨찾기"
                >
                  <span className="text-xs">{savedMap.has(i) ? '★' : savingIndex === i ? '...' : '☆'}</span>
                </button>
                <button
                  onClick={() => onPlayLine(i)}
                  disabled={loadingIndex !== null && loadingIndex !== i}
                  className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-foreground hover:text-accent transition-colors disabled:opacity-30"
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
