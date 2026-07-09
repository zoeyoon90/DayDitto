'use client';

import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchFavorites, deleteFavorite, FavoriteExpression } from '@/api/favorites.api';
import { ttsFavorite } from '@/api/tts.api';

export default function Bookmarks() {
  const queryClient = useQueryClient();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: queryKeys.favorites(),
    queryFn: () => fetchFavorites().catch(() => []),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFavorite(id),
    onSuccess: (_, id) => {
      if (playingId === id) stopCurrent();
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites() });
    },
  });

  const ttsMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      ttsFavorite({ favoriteId: id, text }),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(queryKeys.favorites(), (prev: FavoriteExpression[]) =>
        prev.map((f) => (f.id === id ? { ...f, audioUrl: data.audioUrl } : f)),
      );
    },
  });

  const stopCurrent = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current = null;
    }
    setPlayingId(null);
  };

  const handlePlay = async (item: FavoriteExpression) => {
    if (playingId === item.id) {
      stopCurrent();
      return;
    }
    stopCurrent();

    let audioUrl = item.audioUrl;

    if (!audioUrl) {
      const data = await ttsMutation.mutateAsync({ id: item.id, text: item.englishText });
      audioUrl = data.audioUrl;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.onended = () => {
      setPlayingId(null);
      audioRef.current = null;
    };
    audio.play();
    setPlayingId(item.id);
  };

  if (isLoading) {
    return <p className="text-sm text-foreground/50">불러오는 중...</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">즐겨찾기</h2>

      {favorites.length === 0 ? (
        <p className="text-sm text-foreground/50">
          저장된 즐겨찾기가 없습니다.<br />
          일기 상세 페이지에서 마음에 드는 번역 문구를 저장해보세요.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {favorites.map((item) => {
            const isDeleting = deleteMutation.isPending && deleteMutation.variables === item.id;
            const isTtsLoading = ttsMutation.isPending && ttsMutation.variables?.id === item.id;

            return (
              <li
                key={item.id}
                className="border-2 border-border rounded-base p-4 bg-bw flex flex-col gap-1 shadow-shadow relative pr-16"
              >
                <p className="text-sm text-foreground">{item.koreanText}</p>
                <p className="text-sm text-foreground/60">{item.englishText}</p>

                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <button
                    onClick={() => handlePlay(item)}
                    disabled={ttsMutation.isPending && ttsMutation.variables?.id !== item.id}
                    className="w-6 h-6 flex items-center justify-center text-foreground hover:text-accent transition-colors disabled:opacity-30"
                    aria-label="발음 듣기"
                  >
                    {isTtsLoading ? (
                      <span className="text-[10px]">...</span>
                    ) : playingId === item.id ? (
                      <span className="text-xs">⏸</span>
                    ) : (
                      <span className="text-xs">🔊</span>
                    )}
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(item.id)}
                    disabled={isDeleting}
                    className="w-6 h-6 flex items-center justify-center text-foreground hover:text-red-400 transition-colors text-xs disabled:opacity-40"
                    aria-label="삭제"
                  >
                    {isDeleting ? '...' : '✕'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
