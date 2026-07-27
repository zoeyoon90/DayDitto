import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { signOut } from '@/lib/auth'

export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    queryClient.clear()
    await Promise.all([
      signOut(),
      new Promise<void>(resolve => setTimeout(resolve, 1500)),
    ])
    router.push('/login')
  }

  return { handleLogout, isLoggingOut }
}
