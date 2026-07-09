'use client';

import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchUser, UserInfo } from '@/api/user.api';

const AuthContext = createContext<UserInfo | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user = null } = useQuery({
    queryKey: queryKeys.user(),
    queryFn: () => fetchUser().catch(() => null),
  });

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
