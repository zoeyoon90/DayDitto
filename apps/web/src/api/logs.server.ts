'use server'
import { apiFetchWithAuth } from '@/lib/api.server'
import { MonthlyLogsResponse, DailyLogDetail } from '@/types/calendar'

export const fetchLogDetailServer = async (id: string) =>
  apiFetchWithAuth<DailyLogDetail>(`/daily-logs/${id}`)

export const fetchMonthlyLogsServer = async (year: number, month: number) =>
  apiFetchWithAuth<MonthlyLogsResponse>(`/daily-logs/monthly?year=${year}&month=${month}`)
