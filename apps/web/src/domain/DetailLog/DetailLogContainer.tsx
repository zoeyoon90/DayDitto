'use client'

import { useRef, useState } from 'react'
import { DailyLogDetail } from '@/types/calendar'
import DetailNavBar from './components/DetailNavBar'
import DetailNoteBook from './components/DetailNoteBook'

interface Props {
  log: DailyLogDetail | null
}

export default function DetailLogContainer({ log }: Props) {
  const englishLines = log?.englishContent?.split('\n') ?? []

  const [urls, setUrls] = useState<(string | null)[]>(log?.lineAudioUrls ?? [])
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [playingAll, setPlayingAll] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  if (!log) return <p className="text-foreground/40">일기를 찾을 수 없습니다.</p>

  const getOrFetchUrl = async (index: number): Promise<string | null> => {
    if (urls[index]) return urls[index]!
    const line = englishLines[index]
    if (!line) return null
    setLoadingIndex(index)
    try {
      const res = await fetch('/api/tts-line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId: log.id, lineIndex: index, text: line }),
      })
      const data = (await res.json()) as { audioUrl?: string; error?: string }
      if (!res.ok || !data.audioUrl) return null
      setUrls((prev) => {
        const next = [...prev]
        next[index] = data.audioUrl!
        return next
      })
      return data.audioUrl!
    } finally {
      setLoadingIndex(null)
    }
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

  const hasAudio = englishLines.some(Boolean)

  return (
    <div className="max-w-2xl w-full py-6 flex flex-col gap-6">
      <DetailNavBar
        logDate={log.logDate}
        weather={log.weather}
        mood={log.mood}
        imageUrl={log.imageUrl}
        hasAudio={hasAudio}
        playingAll={playingAll}
        onPlayAll={playAll}
      />
      <DetailNoteBook
        koreanContent={log.koreanContent}
        englishContent={log.englishContent}
        urls={urls}
        loadingIndex={loadingIndex}
        playingIndex={playingIndex}
        onPlayLine={playLine}
      />
    </div>
  )
}
