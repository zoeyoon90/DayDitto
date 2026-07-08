'use client'

import { useRef, useState } from 'react'

interface Props {
  logId: string
  initialAudioUrl: string | null
  englishContent: string | null
}

export default function AudioPlayer({ logId, initialAudioUrl, englishContent }: Props) {
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl)
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  if (!englishContent?.trim()) return null

  const handlePlay = async () => {
    if (playing) {
      audioRef.current?.pause()
      setPlaying(false)
      return
    }

    let url = audioUrl

    if (!url) {
      setLoading(true)
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logId, text: englishContent }),
        })
        const data = (await res.json()) as { audioUrl?: string; error?: string }
        if (!res.ok || !data.audioUrl) throw new Error(data.error ?? 'TTS 생성 실패')
        url = data.audioUrl
        setAudioUrl(url)
      } catch (e) {
        console.error('[AudioPlayer]', e)
        setLoading(false)
        return
      } finally {
        setLoading(false)
      }
    }

    const audio = new Audio(url)
    audioRef.current = audio
    audio.onended = () => setPlaying(false)
    audio.play()
    setPlaying(true)
  }

  return (
    <button
      onClick={handlePlay}
      disabled={loading}
      className="flex items-center gap-2 border border-border rounded-base px-3 h-8 text-sm text-foreground/70 hover:text-foreground hover:bg-main/10 transition-colors disabled:opacity-40"
    >
      {loading ? (
        <span className="text-xs">생성 중...</span>
      ) : playing ? (
        <>
          <span className="text-base leading-none">⏸</span>
          <span className="text-xs">일시정지</span>
        </>
      ) : (
        <>
          <span className="text-base leading-none">🔊</span>
          <span className="text-xs">{audioUrl ? '발음 듣기' : '발음 생성'}</span>
        </>
      )}
    </button>
  )
}
