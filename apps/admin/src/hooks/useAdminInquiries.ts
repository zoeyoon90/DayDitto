import { useQuery } from '@tanstack/react-query';
import { fetchInquiriesAction, fetchInquiryAction } from '@/actions/admin.actions';

export function useAdminInquiries() {
  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ['admin', 'inquiries'],
    queryFn: fetchInquiriesAction,
  });
  return { inquiries, isLoading };
}

export function useAdminInquiry(id: string) {
  const { data: inquiry, isLoading } = useQuery({
    queryKey: ['admin', 'inquiries', id],
    queryFn: () => fetchInquiryAction(id),
    enabled: !!id,
  });
  return { inquiry, isLoading };
}
