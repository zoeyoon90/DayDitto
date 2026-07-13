import { useState } from 'react'
import { DiaryLineData } from '@/domain/CreateLog/components/DiaryLine'

const createLine = (): DiaryLineData => ({
  id: crypto.randomUUID(),
  korean: '',
  english: '',
  isTranslated: false,
})

export function useDiaryLines() {
  const [lines, setLines] = useState<DiaryLineData[]>([createLine()])
  const [focusLineId, setFocusLineId] = useState<string | null>(null)

  const addLineAfter = (id: string) => {
    const newLine = createLine()
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.id === id)
      const next = [...prev]
      next.splice(idx + 1, 0, newLine)
      return next
    })
    setFocusLineId(newLine.id)
  }

  const removeLine = (id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id))
  }

  const updateLine = (id: string, value: string) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, korean: value, isTranslated: false } : l)),
    )
  }

  const applyTranslations = (translations: string[]) => {
    setLines((prev) =>
      prev.map((l, i) =>
        translations[i] ? { ...l, english: translations[i], isTranslated: true } : l,
      ),
    )
  }

  return { lines, focusLineId, addLineAfter, removeLine, updateLine, applyTranslations }
}
