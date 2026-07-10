import { useState, useEffect, useRef } from 'react'
import { fetchGifs } from '@/api/gif.api'

export type KlipyGif = {
  id: number
  file?: {
    hd?: { gif?: { url: string }; webp?: { url: string } }
    sd?: { gif?: { url: string }; webp?: { url: string } }
  }
}

export function useDebouncedGifSearch() {
  const [query, setQuery] = useState('')
  const [gifs, setGifs] = useState<KlipyGif[]>([])
  const [loading, setLoading] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (!query.trim()) {
      loadGifs('')
      return
    }
    debounceRef.current = setTimeout(() => loadGifs(query), 300)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  const loadGifs = async (q: string) => {
    setLoading(true)
    try {
      const json = await fetchGifs(q || undefined)
      setGifs((json.data?.data ?? []) as KlipyGif[])
    } finally {
      setLoading(false)
    }
  }

  return { query, setQuery, gifs, loading }
}
