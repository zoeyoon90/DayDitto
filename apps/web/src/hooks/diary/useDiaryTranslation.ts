import { useState } from 'react'
import { translate } from '@/api/translate.api'
import { DiaryLineData } from '@/domain/CreateLog/components/DiaryLine'

export function useDiaryTranslation(
  lines: DiaryLineData[],
  applyTranslations: (translations: string[]) => void,
) {
  const [isTranslating, setIsTranslating] = useState(false)

  const handleTranslate = async () => {
    setIsTranslating(true)
    try {
      const json = await translate(lines.map((l) => l.korean))
      if (!json.translations) return
      applyTranslations(json.translations)
    } finally {
      setIsTranslating(false)
    }
  }

  return { isTranslating, handleTranslate }
}
