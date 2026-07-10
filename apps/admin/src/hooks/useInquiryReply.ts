import { useMutation, useQueryClient } from '@tanstack/react-query';
import { replyToInquiry } from '@/api/admin.api';

export function useInquiryReply(id: string) {
  const queryClient = useQueryClient();

  const { mutate: submitReply, isPending } = useMutation({
    mutationFn: (adminReply: string) => replyToInquiry(id, adminReply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inquiries', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'inquiries'] });
    },
  });

  return { submitReply, isPending };
}
