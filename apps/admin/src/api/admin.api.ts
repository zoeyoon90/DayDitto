'use client';

import { createClient } from '@/lib/supabase/client';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function getToken(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = new Error(`API error: ${res.status}`) as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  if (res.status === 204 || res.headers.get('content-length') === '0')
    return undefined as T;
  return res.json() as Promise<T>;
}

// --- Types ---

export interface AdminUser {
  id: string;
  email: string | null;
  nickname: string | null;
  provider: 'email' | 'kakao' | 'google';
  login_count: number;
  created_at: string;
  diary_count: number;
  translation_count: number;
  tts_count: number;
}

export interface AdminInquiry {
  id: string;
  userId: string;
  title: string;
  status: 'pending' | 'replied';
  createdAt: string;
  repliedAt: string | null;
}

export interface AdminInquiryDetail extends AdminInquiry {
  content: string;
  adminReply: string | null;
  updatedAt: string;
}

export interface AdminStats {
  dau: number;
  wau: number;
  mau: number;
  aiDay: Record<string, number>;
  aiWeek: Record<string, number>;
  aiMonth: Record<string, number>;
}

export interface DauTrend {
  date: string;
  dau: number;
}

export interface AiTrend {
  date: string;
  call_type: string;
  count: number;
}

export interface AdminStatsTrend {
  dau: DauTrend[];
  ai: AiTrend[];
}

// --- API Functions ---

export const fetchAdminMe = () => apiFetch<{ role: string; email: string }>('/admin/me');

export const fetchAdminUsers = () => apiFetch<AdminUser[]>('/admin/users');

export const fetchAdminInquiries = () =>
  apiFetch<AdminInquiry[]>('/admin/inquiries');

export const fetchAdminInquiry = (id: string) =>
  apiFetch<AdminInquiryDetail>(`/admin/inquiries/${id}`);

export const replyToInquiry = (id: string, adminReply: string) =>
  apiFetch<AdminInquiryDetail>(`/admin/inquiries/${id}/reply`, {
    method: 'PATCH',
    body: JSON.stringify({ adminReply }),
  });

export const fetchAdminStats = () => apiFetch<AdminStats>('/admin/stats');

export const fetchAdminStatsTrend = () =>
  apiFetch<AdminStatsTrend>('/admin/stats/trend');
