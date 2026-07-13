import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { deleteFavorite } from '@/api/favorites.api'

export function useFavoriteMutations(onDeleteSuccess: (id: string) => void) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFavorite(id),
    onSuccess: (_, id) => {
      onDeleteSuccess(id)
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites() })
    },
  })

  return { deleteMutation }
}
