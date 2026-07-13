import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deactivateNoticeAction, resendNoticeAction } from '@/actions/admin.actions';

export function useNoticeActions() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'notices'] });

  const { mutate: deactivate, isPending: isDeactivating } = useMutation({
    mutationFn: (id: string) => deactivateNoticeAction(id),
    onSuccess: invalidate,
  });

  const { mutate: resend, isPending: isResending } = useMutation({
    mutationFn: (id: string) => resendNoticeAction(id),
    onSuccess: invalidate,
  });

  return { deactivate, isDeactivating, resend, isResending };
}
