import { useCallback, useEffect, useRef, useState } from 'react'
import { User } from '@apps-in-toss/web-framework'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export function useTossAuth() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async () => {
    try {
      setError(null)
      const result = await User.getAnonymousKey()

      if (result.type !== 'HASH') {
        throw new Error(`getAnonymousKey failed: ${result.type}`)
      }

      const res = await fetch(`${BASE_URL}/auth/toss/anon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash: result.hash }),
      })

      if (!res.ok) throw new Error(`Auth failed: ${res.status}`)

      const data: { accessToken: string; refreshToken: string } =
        await res.json()
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setReady(true)
    }
  }, [])

  const loginCalled = useRef(false)

  useEffect(() => {
    if (localStorage.getItem(ACCESS_TOKEN_KEY)) {
      setReady(true)
      return
    }
    if (loginCalled.current) return
    loginCalled.current = true
    login()
  }, [login])

  return { ready, error, retry: login }
}
