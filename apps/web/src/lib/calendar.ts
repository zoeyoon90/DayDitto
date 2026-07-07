export function buildCalendarGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month - 1, 1)
  const startDayOfWeek = firstDay.getDay() // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate()

  const grid: (Date | null)[] = []

  for (let i = 0; i < startDayOfWeek; i++) {
    grid.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push(new Date(year, month - 1, d))
  }
  while (grid.length < 42) {
    grid.push(null)
  }

  return grid
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getTodayInTimezone(timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}
