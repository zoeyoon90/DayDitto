'use client';

import { createContext, useContext, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchUser, UserInfo } from '@/api/user.api';
import { createClient } from '@/lib/supabase/client';
import { usePushNotification } from '@/hooks/notifications/usePushNotification';
import { useTossAuth } from '@/hooks/auth/useTossAuth';

const AuthContext = createContext<UserInfo | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { subscribe } = usePushNotification();
  const { isToss, ready: tossReady } = useTossAuth();

  useEffect(() => {
    const clearBadge = () => {
      if (document.visibilityState === 'visible') {
        navigator.clearAppBadge?.();
      }
    };
    navigator.clearAppBadge?.();
    document.addEventListener('visibilitychange', clearBadge);
    return () => document.removeEventListener('visibilitychange', clearBadge);
  }, []);

  // 유저 전환 시 캐시 정리 (토스 환경에선 스킵)
  useEffect(() => {
    if (isToss) return;
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        queryClient.invalidateQueries();
      }
    });
    return () => subscription.unsubscribe();
  }, [queryClient, isToss]);

  const { data: user = null } = useQuery({
    queryKey: queryKeys.user(),
    queryFn: () => fetchUser().catch(() => null),
    enabled: tossReady,
  });

  useEffect(() => {
    if (user && !isToss) {
      subscribe().catch(() => {});
    }
  }, [user, subscribe, isToss]);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
