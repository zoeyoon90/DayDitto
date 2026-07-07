export interface MonthlyLog {
  id: string
  logDate: string // "YYYY-MM-DD"
  imageUrl: string | null
}

export interface MonthlyLogsResponse {
  year: number
  month: number
  timezone: string // IANA e.g. "Asia/Seoul"
  logs: MonthlyLog[]
}
