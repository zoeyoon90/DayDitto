'use client'

import { apiFetch } from './client'

export interface ActiveNotice {
  id: string
  content: string
  createdAt: string
  resentAt: string | null
}

export function getActiveNotice() {
  return apiFetch<ActiveNotice | null>('/notices/active')
}
