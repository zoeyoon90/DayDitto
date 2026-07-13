import { useMutation, useQueryClient } from '@tanstack/react-query';
import { replyToInquiryAction } from '@/actions/admin.actions';

export function useInquiryReply(id: string) {
  const queryClient = useQueryClient();

  const { mutate: submitReply, isPending } = useMutation({
    mutationFn: (adminReply: string) => replyToInquiryAction(id, adminReply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inquiries', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'inquiries'] });
    },
  });

  return { submitReply, isPending };
}
