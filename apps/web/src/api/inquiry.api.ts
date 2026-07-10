'use client'

import { apiFetch } from './client'

export interface Inquiry {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  adminReply: string | null
  status: 'pending' | 'replied'
  repliedAt: string | null
}

export interface InquiryListItem {
  id: string
  title: string
  createdAt: string
}

export const createInquiry = (body: { title: string; content: string }) =>
  apiFetch<{ id: string }>('/inquiries', {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const fetchMyInquiries = () =>
  apiFetch<InquiryListItem[]>('/inquiries')

export const fetchInquiryDetail = (id: string) =>
  apiFetch<Inquiry>(`/inquiries/${id}`)
