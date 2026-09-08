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
  font?: string
}) => apiFetch<{ id: string }>('/daily-logs', { method: 'POST', body: JSON.stringify(body) })

export const translateText = (text: string) =>
  apiFetch<{ translated: string }>('/daily-logs/translate', {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
