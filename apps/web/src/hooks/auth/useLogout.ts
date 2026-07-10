import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { signOut } from '@/lib/auth'

export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    queryClient.clear()
    await signOut()
    router.push('/login')
  }

  return { handleLogout }
}
