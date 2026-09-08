'use client';

import { useEffect, useState } from 'react';
import { isTossWebView } from '@/lib/toss';

const TOSS_TOKEN_KEY = 'toss_access_token';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export function getTossToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOSS_TOKEN_KEY);
}

export function useTossAuth() {
  const [ready, setReady] = useState(false);
  const [isToss, setIsToss] = useState(false);

  useEffect(() => {
    if (!isTossWebView()) {
      setReady(true);
      return;
    }

    setIsToss(true);

    const existingToken = getTossToken();
    if (existingToken) {
      setReady(true);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const anonKey = params.get('tossAnonKey');
    if (!anonKey) {
      setReady(true);
      return;
    }

    fetch(`${BASE_URL}/auth/toss`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anonKey }),
    })
      .then((res) => res.json())
      .then((data: { accessToken: string }) => {
        localStorage.setItem(TOSS_TOKEN_KEY, data.accessToken);
        // anonKey를 URL에서 제거
        params.delete('tossAnonKey');
        const clean = params.toString();
        const url = window.location.pathname + (clean ? `?${clean}` : '');
        window.history.replaceState({}, '', url);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  return { isToss, ready };
}
