import { useState } from 'react'
import { translate } from '@/api/translate.api'
import { DiaryLineData } from '@/domain/CreateLog/components/DiaryLine'

function detectDirection(lines: DiaryLineData[]): 'ko→en' | 'en→ko' {
  const text = lines.find((l) => l.korean.trim())?.korean ?? ''
  return text.trim() && !/[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/.test(text)
    ? 'en→ko'
    : 'ko→en'
}

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

  return { isTranslating, handleTranslate, detectedDirection: detectDirection(lines) }
}
