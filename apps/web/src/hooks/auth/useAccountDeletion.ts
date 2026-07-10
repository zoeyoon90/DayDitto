import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteUser } from '@/api/user.api'

export function useAccountDeletion() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    setError(null)
    try {
      await deleteUser()
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원탈퇴 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, handleDelete }
}
