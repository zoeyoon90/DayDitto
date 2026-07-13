import { useQuery } from '@tanstack/react-query';
import { fetchUsersAction } from '@/actions/admin.actions';

export function useAdminUsers() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: fetchUsersAction,
  });
  return { users, isLoading };
}
