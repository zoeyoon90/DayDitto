import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function useLogout() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return { handleLogout }
}
