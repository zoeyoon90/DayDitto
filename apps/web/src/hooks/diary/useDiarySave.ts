import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DiaryLineData } from '@/domain/CreateLog/components/DiaryLine'
import { uploadImage } from '@/api/upload.api'
import { createLog } from '@/api/logs.api'
import { ttsBatch } from '@/api/tts.api'

export function useDiarySave(
  lines: DiaryLineData[],
  image: File | string | null,
  mood: string | null,
  weather: string | null,
) {
  const router = useRouter()
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string>('')

  const handleSave = async () => {
    const koreanContent = lines.map((l) => l.korean).filter(Boolean).join('\n')
    if (!koreanContent.trim()) return

    setSaveStatus('saving')
    setSaveError('')
    try {
      let imageUrl: string | null = null

      if (image instanceof File) {
        const { url } = await uploadImage(image)
        imageUrl = url
      } else if (typeof image === 'string') {
        imageUrl = image
      }

      const englishContent = lines.map((l) => l.english).filter(Boolean).join('\n') || undefined
      const logDate = new Date().toISOString().split('T')[0]!

      const { id } = await createLog({
        logDate,
        koreanContent,
        englishContent,
        imageUrl,
        mood: mood ?? undefined,
        weather: weather ?? undefined,
      })

      const englishLines = lines.map((l) => l.english).filter(Boolean)
      if (englishLines.length > 0) {
        await ttsBatch({ logId: id, lines: englishLines })
      }

      setSaveStatus('idle')
      router.push(`/detailLog?id=${id}`)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.')
      setSaveStatus('error')
    }
  }

  const dismissSaveError = () => setSaveStatus('idle')

  return { saveStatus, saveError, handleSave, dismissSaveError }
}
