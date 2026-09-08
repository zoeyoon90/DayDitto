import { apiFetch } from './client'

export interface UserInfo {
  id: string
  email?: string
  nickname?: string | null
  provider?: string
}

export const fetchUser = () => apiFetch<UserInfo>('/users/me')
