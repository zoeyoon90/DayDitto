import { useEffect, useState } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export function useTossAuth() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const existingToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (existingToken) {
      setReady(true)
      return
    }

    // TossAuth.login()으로 인가코드 획득 후 서버에서 토큰 교환
    // TODO: @apps-in-toss/web-framework 설치 후 정확한 import 확인
    import('@apps-in-toss/web-framework')
      .then((sdk) => sdk.TossAuth.login())
      .then(({ authorizationCode }: { authorizationCode: string }) => {
        return fetch(`${BASE_URL}/auth/toss`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authorizationCode }),
        })
      })
      .then((res) => {
        if (!res.ok) throw new Error(`Auth failed: ${res.status}`)
        return res.json()
      })
      .then((data: { accessToken: string; refreshToken: string }) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setReady(true))
  }, [])

  return { ready, error }
}
