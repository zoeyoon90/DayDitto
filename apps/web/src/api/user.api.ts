import { apiFetch } from './client'

export interface UserInfo {
  id: string
  email?: string
  nickname?: string | null
  provider?: string
}

export const fetchUser = () => apiFetch<UserInfo>('/users/me')

export const updateUser = (nickname: string) =>
  apiFetch<{ success: boolean }>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify({ nickname }),
  })

export const deleteUser = () => apiFetch<{ success: boolean }>('/users/me', { method: 'DELETE' })
