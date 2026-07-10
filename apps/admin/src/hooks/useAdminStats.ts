import { useQuery } from '@tanstack/react-query';
import { fetchAdminStats, fetchAdminStatsTrend } from '@/api/admin.api';

export function useAdminStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchAdminStats,
  });
  return { stats, isLoading };
}

export function useAdminStatsTrend() {
  const { data: trend, isLoading } = useQuery({
    queryKey: ['admin', 'stats', 'trend'],
    queryFn: fetchAdminStatsTrend,
  });
  return { trend, isLoading };
}
