const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

let refreshPromise: Promise<boolean> | null = null

async function refreshToken(): Promise<boolean> {
  const token = localStorage.getItem(REFRESH_TOKEN_KEY)
  if (!token) return false

  try {
    const res = await fetch(`${BASE_URL}/auth/toss/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token }),
    })
    if (!res.ok) return false

    const data = (await res.json()) as {
      accessToken: string
      refreshToken: string
    }
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
    return true
  } catch {
    return false
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  _retried = false,
): Promise<T> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  if (init?.headers) {
    Object.assign(headers, init.headers)
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
  })

  if (res.status === 401) {
    if (!_retried) {
      if (!refreshPromise) {
        refreshPromise = refreshToken().finally(() => {
          refreshPromise = null
        })
      }
      const refreshed = await refreshPromise
      if (refreshed) return apiFetch(path, init, true)
    }
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    throw new Error('AUTH_EXPIRED')
  }

  if (!res.ok) throw new Error(`API error: ${res.status}`)
  if (res.status === 204 || res.headers.get('content-length') === '0')
    return null as T
  return res.json() as Promise<T>
}
