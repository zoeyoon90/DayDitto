import { apiFetch } from './client'

export const ttsLine = (body: { logId: string; lineIndex: number; text: string }) =>
  apiFetch<{ audioUrl: string }>('/tts/line', { method: 'POST', body: JSON.stringify(body) })

export const ttsBatch = (body: { logId: string; lines: string[] }) =>
  apiFetch<{ lineAudioUrls: string[] }>('/tts/batch', {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const ttsFavorite = (body: { favoriteId: string; text: string }) =>
  apiFetch<{ audioUrl: string }>('/tts/favorite', {
    method: 'POST',
    body: JSON.stringify(body),
  })
