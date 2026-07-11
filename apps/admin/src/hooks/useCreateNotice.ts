import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNoticeAction } from '@/actions/admin.actions';

export function useCreateNotice() {
  const queryClient = useQueryClient();

  const { mutate: createNotice, isPending } = useMutation({
    mutationFn: (content: string) => createNoticeAction(content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notices'] });
    },
  });

  return { createNotice, isPending };
}
