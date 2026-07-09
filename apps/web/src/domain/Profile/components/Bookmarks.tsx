'use client';

import { useEffect, useRef, useState } from 'react';

interface FavoriteExpression {
  id: string;
  koreanText: string;
  englishText: string;
  audioUrl: string | null;
  createdAt: string;
}

export default function Bookmarks() {
  const [favorites, setFavorites] = useState<FavoriteExpression[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch('/api/favorites')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: FavoriteExpression[]) => setFavorites(data))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, []);

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
      setLoadingId(item.id);
      try {
        const res = await fetch('/api/tts-favorite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ favoriteId: item.id, text: item.englishText }),
        });
        const data = (await res.json()) as { audioUrl?: string; error?: string };
        if (!res.ok || !data.audioUrl) return;
        audioUrl = data.audioUrl;
        // 로컬 state에도 URL 반영
        setFavorites((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, audioUrl: data.audioUrl! } : f)),
        );
      } finally {
        setLoadingId(null);
      }
    }

    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.onended = () => {
      setPlayingId(null);
      audioRef.current = null;
    };
    audio.play();
    setPlayingId(item.id);
  };

  const handleDelete = async (id: string) => {
    if (playingId === id) stopCurrent();
    setDeletingId(id);
    try {
      const res = await fetch(`/api/favorites/${id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        setFavorites((prev) => prev.filter((f) => f.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
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
          {favorites.map((item) => (
            <li
              key={item.id}
              className="border-2 border-border rounded-base p-4 bg-bw flex flex-col gap-1 shadow-shadow relative pr-16"
            >
              <p className="text-sm text-foreground">{item.koreanText}</p>
              <p className="text-sm text-foreground/60">{item.englishText}</p>

              <div className="absolute top-3 right-3 flex items-center gap-1">
                <button
                  onClick={() => handlePlay(item)}
                  disabled={loadingId !== null && loadingId !== item.id}
                  className="w-6 h-6 flex items-center justify-center text-foreground hover:text-accent transition-colors disabled:opacity-30"
                  aria-label="발음 듣기"
                >
                  {loadingId === item.id ? (
                    <span className="text-[10px]">...</span>
                  ) : playingId === item.id ? (
                    <span className="text-xs">⏸</span>
                  ) : (
                    <span className="text-xs">🔊</span>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="w-6 h-6 flex items-center justify-center text-foreground hover:text-red-400 transition-colors text-xs disabled:opacity-40"
                  aria-label="삭제"
                >
                  {deletingId === item.id ? '...' : '✕'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
