import { useQuery } from '@tanstack/react-query';
import { fetchAdminUsers } from '@/api/admin.api';

export function useAdminUsers() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: fetchAdminUsers,
  });
  return { users, isLoading };
}
