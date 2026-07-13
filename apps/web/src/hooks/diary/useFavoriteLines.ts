import { useState, useEffect } from 'react'
import { fetchFavorites, createFavorite, deleteFavorite } from '@/api/favorites.api'

export function useFavoriteLines(
  logId: string,
  koreanLines: string[],
  englishLines: string[],
  lineAudioUrls: (string | null)[],
) {
  const [savedMap, setSavedMap] = useState<Map<number, string>>(new Map())
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
        setSavedMap((prev) => {
          const next = new Map(prev)
          next.delete(index)
          return next
        })
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

  return { savedMap, savingIndex, handleFavorite }
}
