import { useQuery } from '@tanstack/react-query';
import { fetchAdminInquiries, fetchAdminInquiry } from '@/api/admin.api';

export function useAdminInquiries() {
  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ['admin', 'inquiries'],
    queryFn: fetchAdminInquiries,
  });
  return { inquiries, isLoading };
}

export function useAdminInquiry(id: string) {
  const { data: inquiry, isLoading } = useQuery({
    queryKey: ['admin', 'inquiries', id],
    queryFn: () => fetchAdminInquiry(id),
    enabled: !!id,
  });
  return { inquiry, isLoading };
}
