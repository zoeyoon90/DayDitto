'use client'

import { useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchLogDetail } from '@/api/logs.api'
import { ttsLine } from '@/api/tts.api'
import DetailNavBar from './components/DetailNavBar'
import DetailNoteBook from './components/DetailNoteBook'
import FontPickerModal, { FontKey, FONTS } from '@/components/FontPickerModal/FontPickerModal'

interface Props {
  logId: string
}

export default function DetailLogContainer({ logId }: Props) {
  const { data: log, isLoading } = useQuery({
    queryKey: queryKeys.log(logId),
    queryFn: () => fetchLogDetail(logId),
  })

  const englishLines = log?.englishContent?.split('\n') ?? []

  const [urls, setUrls] = useState<(string | null)[]>([])
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [playingAll, setPlayingAll] = useState(false)
  const [font, setFont] = useState<FontKey>('yeongwol')
  const [showFontModal, setShowFontModal] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const lineAudioUrls = log?.lineAudioUrls ?? []

  const ttsMutation = useMutation({
    mutationFn: ({ lineIndex, text }: { lineIndex: number; text: string }) =>
      ttsLine({ logId, lineIndex, text }),
  })

  if (isLoading) {
    return <p className="text-foreground/40">불러오는 중...</p>
  }

  if (!log) return <p className="text-foreground/40">일기를 찾을 수 없습니다.</p>

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

  const hasAudio = englishLines.some(Boolean)
  const currentFontVar = FONTS.find((f) => f.key === font)!.cssVar
  const mergedUrls = lineAudioUrls.map((u, i) => urls[i] ?? u)

  return (
    <div className="max-w-201.5 w-full py-6 flex flex-col gap-6">
      <DetailNavBar
        logDate={log.logDate}
        weather={log.weather}
        mood={log.mood}
        imageUrl={log.imageUrl}
        hasAudio={hasAudio}
        playingAll={playingAll}
        onPlayAll={playAll}
        onFontClick={() => setShowFontModal(true)}
      />
      <DetailNoteBook
        logId={log.id}
        koreanContent={log.koreanContent}
        englishContent={log.englishContent}
        lineAudioUrls={mergedUrls}
        loadingIndex={ttsMutation.isPending ? (ttsMutation.variables?.lineIndex ?? null) : null}
        playingIndex={playingIndex}
        onPlayLine={playLine}
        font={currentFontVar}
      />
      {showFontModal && (
        <FontPickerModal
          currentFont={font}
          onSelect={setFont}
          onClose={() => setShowFontModal(false)}
        />
      )}
    </div>
  )
}
