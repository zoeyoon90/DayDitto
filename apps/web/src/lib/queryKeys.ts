export const queryKeys = {
  user: () => ['user'] as const,
  favorites: () => ['favorites'] as const,
  calendar: (year: number, month: number) => ['calendar', year, month] as const,
  log: (id: string) => ['log', id] as const,
  inquiries: () => ['inquiries'] as const,
  inquiry: (id: string) => ['inquiry', id] as const,
}
