'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPushNotificationStatsAction } from '@/actions/admin.actions';

export function useAdminPushNotificationStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'push-notifications', 'stats'],
    queryFn: fetchPushNotificationStatsAction,
  });
  return { stats: data, isLoading };
}
