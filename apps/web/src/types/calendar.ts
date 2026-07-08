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

export interface DailyLogDetail {
  id: string
  logDate: string
  imageUrl: string | null
  mood: string | null
  weather: string | null
  koreanContent: string
  englishContent: string | null
}
