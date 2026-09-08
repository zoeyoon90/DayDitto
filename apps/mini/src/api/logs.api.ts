import { apiFetch } from './client'
import type { MonthlyLogsResponse, DailyLogDetail } from '@/types/calendar'

export const fetchMonthlyLogs = (year: number, month: number) =>
  apiFetch<MonthlyLogsResponse>(`/daily-logs/monthly?year=${year}&month=${month}`)

export const fetchLogDetail = (id: string) =>
  apiFetch<DailyLogDetail>(`/daily-logs/${id}`)

export const createLog = (body: {
  logDate: string
  koreanContent: string
  englishContent?: string
  mood?: string
  weather?: string
  imageUrl?: string
  font?: string
}) => apiFetch<{ id: string }>('/daily-logs', { method: 'POST', body: JSON.stringify(body) })

export const translateText = (text: string) =>
  apiFetch<{ translated: string }>('/daily-logs/translate', {
    method: 'POST',
    body: JSON.stringify({ text }),
  })

export const uploadImage = async (file: File): Promise<{ url: string }> => {
  const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
  const token = localStorage.getItem('access_token')
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  return res.json()
}

export const ttsLine = (body: { logId: string; lineIndex: number; text: string }) =>
  apiFetch<{ audioUrl: string }>('/tts/line', { method: 'POST', body: JSON.stringify(body) })

export const ttsBatch = (body: { logId: string; lines: string[] }) =>
  apiFetch<{ lineAudioUrls: string[] }>('/tts/batch', { method: 'POST', body: JSON.stringify(body) })
