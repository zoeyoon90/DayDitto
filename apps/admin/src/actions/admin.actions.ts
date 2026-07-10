'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  AdminUser,
  AdminInquiry,
  AdminInquiryDetail,
  AdminStats,
  AdminStatsTrend,
} from '@/api/admin.api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function getServerToken(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function serverFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getServerToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = new Error(`API error: ${res.status}`) as Error & {
      status: number;
    };
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const fetchUsersAction = async () =>
  serverFetch<AdminUser[]>('/admin/users');

export const fetchInquiriesAction = async () =>
  serverFetch<AdminInquiry[]>('/admin/inquiries');

export const fetchInquiryAction = async (id: string) =>
  serverFetch<AdminInquiryDetail>(`/admin/inquiries/${id}`);

export const fetchStatsAction = async () =>
  serverFetch<AdminStats>('/admin/stats');

export const fetchStatsTrendAction = async () =>
  serverFetch<AdminStatsTrend>('/admin/stats/trend');

export const replyToInquiryAction = async (id: string, adminReply: string) =>
  serverFetch<AdminInquiryDetail>(`/admin/inquiries/${id}/reply`, {
    method: 'PATCH',
    body: JSON.stringify({ adminReply }),
  });
