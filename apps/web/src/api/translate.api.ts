import { apiFetch } from './client'

export const translate = (lines: string[]) =>
  apiFetch<{ translations: string[] }>('/translate', {
    method: 'POST',
    body: JSON.stringify({ lines }),
  })
