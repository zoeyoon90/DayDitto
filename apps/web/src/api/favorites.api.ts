import { apiFetch } from './client'

export interface FavoriteExpression {
  id: string
  koreanText: string
  englishText: string
  audioUrl: string | null
  createdAt: string
}

export const fetchFavorites = (dailyLogId?: string) =>
  apiFetch<FavoriteExpression[]>(
    dailyLogId ? `/favorite-expressions?dailyLogId=${dailyLogId}` : '/favorite-expressions',
  )

export const createFavorite = (body: {
  koreanText: string
  englishText: string
  dailyLogId?: string
  audioUrl?: string
}) =>
  apiFetch<FavoriteExpression>('/favorite-expressions', {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const deleteFavorite = (id: string) =>
  apiFetch<void>(`/favorite-expressions/${id}`, { method: 'DELETE' })
