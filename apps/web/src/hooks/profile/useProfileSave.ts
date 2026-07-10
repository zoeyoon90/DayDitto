import { useState } from 'react'
import { updateUser } from '@/api/user.api'

export function useProfileSave(initialNickname: string | null) {
  const [nickname, setNickname] = useState(initialNickname ?? '')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setSaveMessage(null)
    try {
      await updateUser(nickname)
      setSaveMessage('저장되었습니다.')
      setTimeout(() => setSaveMessage(null), 2000)
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return { nickname, setNickname, saving, saveMessage, handleSave }
}
