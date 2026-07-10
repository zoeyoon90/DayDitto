'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchMonthlyLogs } from '@/api/logs.api'
import { queryKeys } from '@/lib/queryKeys'

export function useTodayLogExists() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const todayStr = today.toISOString().split('T')[0]!

  const { data } = useQuery({
    queryKey: queryKeys.calendar(year, month),
    queryFn: () => fetchMonthlyLogs(year, month),
  })

  return data?.logs.some((log) => log.logDate === todayStr) ?? false
}
