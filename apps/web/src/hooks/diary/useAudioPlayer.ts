import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ttsLine } from '@/api/tts.api'

export function useAudioPlayer(
  logId: string,
  englishLines: string[],
  lineAudioUrls: (string | null)[],
) {
  const [urls, setUrls] = useState<(string | null)[]>([])
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [playingAll, setPlayingAll] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const ttsMutation = useMutation({
    mutationFn: ({ lineIndex, text }: { lineIndex: number; text: string }) =>
      ttsLine({ logId, lineIndex, text }),
  })

  const getOrFetchUrl = async (index: number): Promise<string | null> => {
    const cached = urls[index] ?? lineAudioUrls[index] ?? null
    if (cached) return cached
    const line = englishLines[index]
    if (!line) return null
    const data = await ttsMutation.mutateAsync({ lineIndex: index, text: line })
    if (!data.audioUrl) return null
    setUrls((prev) => {
      const next = [...prev]
      next[index] = data.audioUrl
      return next
    })
    return data.audioUrl
  }

  const stopCurrent = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.onended = null
      audioRef.current = null
    }
    setPlayingIndex(null)
    setPlayingAll(false)
  }

  const playLine = async (index: number) => {
    if (playingIndex === index) {
      stopCurrent()
      return
    }
    stopCurrent()
    const url = await getOrFetchUrl(index)
    if (!url) return
    const audio = new Audio(url)
    audioRef.current = audio
    audio.onended = () => {
      setPlayingIndex(null)
      audioRef.current = null
    }
    audio.play()
    setPlayingIndex(index)
  }

  const playAll = async () => {
    if (playingAll) {
      stopCurrent()
      return
    }
    stopCurrent()
    setPlayingAll(true)

    const playNext = async (index: number) => {
      if (index >= englishLines.length) {
        setPlayingAll(false)
        setPlayingIndex(null)
        return
      }
      if (!englishLines[index]) {
        playNext(index + 1)
        return
      }
      const url = await getOrFetchUrl(index)
      if (!url) {
        playNext(index + 1)
        return
      }
      const audio = new Audio(url)
      audioRef.current = audio
      setPlayingIndex(index)
      audio.onended = () => playNext(index + 1)
      audio.play()
    }

    playNext(0)
  }

  const mergedUrls = lineAudioUrls.map((u, i) => urls[i] ?? u)
  const loadingIndex = ttsMutation.isPending ? (ttsMutation.variables?.lineIndex ?? null) : null

  return { playingIndex, playingAll, mergedUrls, loadingIndex, playLine, playAll, stopCurrent }
}
