import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { FavoriteExpression } from '@/api/favorites.api'
import { ttsFavorite } from '@/api/tts.api'

export function useFavoriteAudioPlayer() {
  const queryClient = useQueryClient()
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const ttsMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      ttsFavorite({ favoriteId: id, text }),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(queryKeys.favorites(), (prev: FavoriteExpression[]) =>
        prev.map((f) => (f.id === id ? { ...f, audioUrl: data.audioUrl } : f)),
      )
    },
  })

  const stopCurrent = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.onended = null
      audioRef.current = null
    }
    setPlayingId(null)
  }

  const handlePlay = async (item: FavoriteExpression) => {
    if (playingId === item.id) {
      stopCurrent()
      return
    }
    stopCurrent()

    let audioUrl = item.audioUrl

    if (!audioUrl) {
      const data = await ttsMutation.mutateAsync({ id: item.id, text: item.englishText })
      audioUrl = data.audioUrl
    }

    const audio = new Audio(audioUrl)
    audioRef.current = audio
    audio.onended = () => {
      setPlayingId(null)
      audioRef.current = null
    }
    audio.play()
    setPlayingId(item.id)
  }

  return { playingId, ttsMutation, stopCurrent, handlePlay }
}
