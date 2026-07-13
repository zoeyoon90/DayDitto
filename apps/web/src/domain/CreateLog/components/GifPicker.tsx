'use client';

import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useDebouncedGifSearch, KlipyGif } from '@/hooks/diary/useDebouncedGifSearch';

type GifPickerProps = {
  anchorRect: DOMRect;
  onSelect: (url: string) => void;
  onClose: () => void;
};

const getUrl = (gif: KlipyGif) =>
  gif.file?.hd?.gif?.url ?? gif.file?.sd?.gif?.url ?? '';

export default function GifPicker({ anchorRect, onSelect, onClose }: GifPickerProps) {
  const { query, setQuery, gifs, loading } = useDebouncedGifSearch();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const picker = (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: anchorRect.bottom + 4,
        left: anchorRect.left,
        zIndex: 9999,
      }}
      className="w-72 bg-card border-2 border-border rounded-base shadow-shadow overflow-hidden"
    >
      <div className="p-2 border-b border-border/20">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="GIF 검색..."
          autoFocus
          className="w-full px-2 py-1 text-xs bg-background/50 border border-border/30 rounded-base outline-none placeholder:text-foreground/30"
        />
      </div>
      <div className="h-48 overflow-y-auto p-1">
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs text-foreground/40">
            로딩 중...
          </div>
        ) : gifs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-foreground/40">
            결과 없음
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {gifs.map((gif) => {
              const url = getUrl(gif);
              return url ? (
                <button
                  key={gif.id}
                  onClick={() => {
                    onSelect(url);
                    onClose();
                  }}
                  className="relative aspect-square overflow-hidden rounded-base hover:opacity-80 transition-opacity"
                >
                  <Image src={url} alt="" fill unoptimized className="object-cover" />
                </button>
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(picker, document.body);
}
