'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchLogDetail } from '@/api/logs.api'
import DetailNavBar from './components/DetailNavBar'
import DetailNoteBook from './components/DetailNoteBook'
import FontPickerModal, { FontKey, FONTS } from '@/components/FontPickerModal/FontPickerModal'
import { useAudioPlayer } from '@/hooks/diary/useAudioPlayer'

interface Props {
  logId: string
}

export default function DetailLogContainer({ logId }: Props) {
  const { data: log, isLoading } = useQuery({
    queryKey: queryKeys.log(logId),
    queryFn: () => fetchLogDetail(logId),
  })

  const englishLines = log?.englishContent?.split('\n') ?? []
  const lineAudioUrls = log?.lineAudioUrls ?? []

  const [font, setFont] = useState<FontKey>('yeongwol')
  const [showFontModal, setShowFontModal] = useState(false)

  const { playingIndex, playingAll, mergedUrls, loadingIndex, playLine, playAll } =
    useAudioPlayer(logId, englishLines, lineAudioUrls)

  if (isLoading) {
    return <p className="text-foreground/40">불러오는 중...</p>
  }

  if (!log) return <p className="text-foreground/40">일기를 찾을 수 없습니다.</p>

  const hasAudio = englishLines.some(Boolean)
  const currentFontVar = FONTS.find((f) => f.key === font)!.cssVar

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
        loadingIndex={loadingIndex}
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
