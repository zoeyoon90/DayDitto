import { MonthlyLogsResponse, DailyLogDetail } from '@/types/calendar'
import { apiFetch } from './client'

export const fetchMonthlyLogs = (year: number, month: number) =>
  apiFetch<MonthlyLogsResponse>(`/daily-logs/monthly?year=${year}&month=${month}`)

export const fetchLogDetail = (id: string) =>
  apiFetch<DailyLogDetail>(`/daily-logs/${id}`)

export const createLog = (body: {
  logDate: string
  koreanContent: string
  englishContent?: string
  imageUrl?: string | null
  mood?: string
  weather?: string
}) => apiFetch<{ id: string }>('/daily-logs', { method: 'POST', body: JSON.stringify(body) })
