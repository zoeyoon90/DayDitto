import { useQuery } from '@tanstack/react-query';
import { fetchAdminNoticesAction } from '@/actions/admin.actions';

export function useAdminNotices() {
  const { data: notices = [], isLoading } = useQuery({
    queryKey: ['admin', 'notices'],
    queryFn: fetchAdminNoticesAction,
  });
  return { notices, isLoading };
}
