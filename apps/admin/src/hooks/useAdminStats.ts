import { useQuery } from '@tanstack/react-query';
import { fetchStatsAction, fetchStatsTrendAction } from '@/actions/admin.actions';

export function useAdminStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchStatsAction,
  });
  return { stats, isLoading };
}

export function useAdminStatsTrend() {
  const { data: trend, isLoading } = useQuery({
    queryKey: ['admin', 'stats', 'trend'],
    queryFn: fetchStatsTrendAction,
  });
  return { trend, isLoading };
}
