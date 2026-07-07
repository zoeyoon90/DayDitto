'use server'
import { createClient } from './supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

export async function apiFetchWithAuth<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log('BASE_URL:', BASE_URL)
  console.log('full URL:', `${BASE_URL}${path}`)
  
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json() as Promise<T>
}
