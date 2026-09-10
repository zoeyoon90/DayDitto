import { useState } from 'react'
import { translateText } from '@/api/logs.api'
import type { DiaryLineData } from '@/components/DiaryLine'

export function useDiaryTranslation(
  lines: DiaryLineData[],
  applyTranslations: (translations: string[]) => void,
) {
  const [isTranslating, setIsTranslating] = useState(false)

  const handleTranslate = async () => {
    setIsTranslating(true)
    try {
      const json = await translateText(lines.map((l) => l.korean))
      if (!json.translations) return
      applyTranslations(json.translations)
    } finally {
      setIsTranslating(false)
    }
  }

  return { isTranslating, handleTranslate }
}
