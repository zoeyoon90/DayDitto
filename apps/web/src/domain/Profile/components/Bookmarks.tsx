'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchFavorites } from '@/api/favorites.api';
import { useFavoriteAudioPlayer } from '@/hooks/profile/useFavoriteAudioPlayer';
import { useFavoriteMutations } from '@/hooks/profile/useFavoriteMutations';

export default function Bookmarks() {
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: queryKeys.favorites(),
    queryFn: () => fetchFavorites().catch(() => []),
  });

  const { playingId, ttsMutation, stopCurrent, handlePlay } = useFavoriteAudioPlayer();
  const { deleteMutation } = useFavoriteMutations((id) => {
    if (playingId === id) stopCurrent();
  });

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
