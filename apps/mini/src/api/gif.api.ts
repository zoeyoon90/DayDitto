import { apiFetch } from './client'

export const fetchGifs = (q?: string) =>
  apiFetch<{ data?: { data?: unknown[] } }>(q ? `/gif?q=${encodeURIComponent(q)}` : '/gif')
