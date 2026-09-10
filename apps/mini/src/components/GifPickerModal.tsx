import { createPortal } from 'react-dom'
import { useEffect } from 'react'
import { useDebouncedGifSearch, type KlipyGif } from '@/hooks/useDebouncedGifSearch'

interface Props {
  onSelect: (url: string) => void
  onClose: () => void
}

const getUrl = (gif: KlipyGif) =>
  gif.file?.hd?.gif?.url ?? gif.file?.sd?.gif?.url ?? ''

export default function GifPickerModal({ onSelect, onClose }: Props) {
  const { query, setQuery, gifs, loading } = useDebouncedGifSearch()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-card border-2 border-border shadow-shadow rounded-t-base w-full max-w-md max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-border/30 flex items-center justify-between">
          <span className="text-sm text-foreground/70">GIF 검색</span>
          <button onClick={onClose} className="text-foreground/50 text-lg leading-none">&times;</button>
        </div>
        <div className="px-3 py-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색어 입력..."
            autoFocus
            className="w-full px-3 py-1.5 text-sm bg-background/50 border border-border/30 rounded-base outline-none placeholder:text-foreground/30"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2 min-h-0">
          {loading ? (
            <div className="h-32 flex items-center justify-center text-xs text-foreground/40">
              로딩 중...
            </div>
          ) : gifs.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-xs text-foreground/40">
              결과 없음
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {gifs.map((gif) => {
                const url = getUrl(gif)
                return url ? (
                  <button
                    key={gif.id}
                    onClick={() => {
                      onSelect(url)
                      onClose()
                    }}
                    className="relative aspect-square overflow-hidden rounded-base hover:opacity-80 transition-opacity"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ) : null
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
