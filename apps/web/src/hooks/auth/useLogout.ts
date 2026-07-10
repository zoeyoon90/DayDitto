import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    const supabase = createClient()
    queryClient.clear()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return { handleLogout }
}
