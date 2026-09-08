import { createContext, useContext, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTossAuth } from '@/hooks/useTossAuth'
import { fetchUser, type UserInfo } from '@/api/user.api'

interface AuthContextValue {
  user: UserInfo | null
  authError: string | null
  retryAuth: () => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  authError: null,
  retryAuth: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const { ready, error: authError, retry } = useTossAuth()

  const { data: user = null } = useQuery({
    queryKey: ['user'],
    queryFn: () => fetchUser().catch(() => null),
    enabled: ready && !authError,
  })

  return (
    <AuthContext.Provider value={{ user, authError, retryAuth: retry }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
