import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { createLog, uploadImage, ttsBatch } from '@/api/logs.api'
import { Button } from '@/components/Button'
import DayMeta from '@/components/DayMeta'
import DiaryLineList from '@/components/DiaryLineList'
import FontPickerModal, { type FontKey, FONTS } from '@/components/FontPickerModal'
import GifPickerModal from '@/components/GifPickerModal'
import { useDiaryLines } from '@/hooks/useDiaryLines'
import { useDiaryTranslation } from '@/hooks/useDiaryTranslation'

export function WritePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const dateParam = searchParams.get('date') ?? new Date().toISOString().slice(0, 10)

  const [mood, setMood] = useState<string | null>(null)
  const [weather, setWeather] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [font, setFont] = useState<FontKey>('yeongwol')
  const [showFontModal, setShowFontModal] = useState(false)
  const [showGifModal, setShowGifModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { lines, focusLineId, addLineAfter, removeLine, updateLine, applyTranslations } =
    useDiaryLines()
  const { isTranslating, handleTranslate } = useDiaryTranslation(lines, applyTranslations)

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadImage(file),
    onSuccess: (data) => setImageUrl(data.url),
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const koreanContent = lines.map((l) => l.korean).filter(Boolean).join('\n')
      const englishContent = lines.map((l) => l.english).filter(Boolean).join('\n') || undefined

      const { id } = await createLog({
        logDate: dateParam,
        koreanContent,
        englishContent,
        mood: mood || undefined,
        weather: weather || undefined,
        imageUrl: imageUrl || undefined,
        font,
      })

      // 번역된 영어가 있으면 TTS 자동 생성
      const englishLines = lines.map((l) => l.english).filter(Boolean)
      if (englishLines.length > 0) {
        await ttsBatch({ logId: id, lines: englishLines })
      }

      return id
    },
    onSuccess: () => navigate('/'),
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadMutation.mutate(file)
  }

  const hasContent = lines.some((l) => l.korean.trim())

  const date = new Date(dateParam)
  const dateLabel = date.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  })

  const selectedFont = FONTS.find((f) => f.key === font)!

  return (
    <div className="min-h-screen bg-background px-4 py-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-foreground/60 text-lg">←</button>
          <div className="border border-border rounded-base px-2 h-7 flex items-center">
            <p className="text-sm text-foreground/90 whitespace-nowrap">{dateLabel}</p>
          </div>
        </div>
        <Button
          variant="noShadow"
          size="sm"
          onClick={() => saveMutation.mutate()}
          disabled={!hasContent || saveMutation.isPending}
        >
          {saveMutation.isPending ? '저장 중...' : '저장'}
        </Button>
      </div>

      {/* Meta bar: mood/weather + image + gif + font */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center justify-center">
          <DayMeta mood={mood} weather={weather} onMoodChange={setMood} onWeatherChange={setWeather} />
        </div>
        <div className="flex items-center gap-2 justify-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 h-7 border-2 border-border bg-card rounded-base text-xs text-foreground/80 shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
          >
            {uploadMutation.isPending ? '업로드 중...' : imageUrl ? '이미지 변경' : '이미지 추가'}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <button
            onClick={() => setShowGifModal(true)}
            className="px-3 h-7 border-2 border-border bg-card rounded-base text-xs text-foreground/80 shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
          >
            GIF
          </button>
          <button
            onClick={() => setShowFontModal(true)}
            className="px-3 h-7 border-2 border-border bg-card rounded-base text-xs text-foreground/80 shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
          >
            폰트
          </button>
        </div>
      </div>

      {/* Image preview */}
      {imageUrl && (
        <div className="mb-4 border-2 border-border rounded-base overflow-hidden shadow-shadow">
          <img src={imageUrl} alt="업로드 이미지" className="w-full max-h-48 object-cover" />
        </div>
      )}

      {/* Notebook diary lines */}
      <div className="border-2 border-border shadow-shadow rounded-base overflow-x-auto mb-4">
        <div
          style={{
            backgroundColor: '#fdfaf4',
            backgroundImage: `
              repeating-linear-gradient(
                transparent 0px,
                transparent 25px,
                rgba(150, 175, 220, 0.55) 25px,
                rgba(150, 175, 220, 0.55) 26px
              ),
              linear-gradient(
                90deg,
                transparent 0px,
                transparent 19px,
                rgba(210, 100, 100, 0.45) 15px,
                rgba(210, 100, 100, 0.45) 21px,
                transparent 1px
              )
            `,
            backgroundSize: '100% 26px, 100% 100%',
            backgroundPosition: '0 5px, 0 0',
            paddingTop: '5px',
          }}
        >
          <DiaryLineList
            lines={lines}
            focusLineId={focusLineId}
            onChange={updateLine}
            onDelete={removeLine}
            onEnter={addLineAfter}
            font={selectedFont.cssVar}
          />
        </div>
      </div>

      {/* Translate button */}
      <Button
        variant="default"
        className="w-full mb-4"
        onClick={handleTranslate}
        disabled={!hasContent || isTranslating}
      >
        {isTranslating ? '번역 중...' : '번역하기'}
      </Button>

      {/* Error */}
      {(saveMutation.isError || uploadMutation.isError) && (
        <p className="text-red-500 text-sm mt-2">오류가 발생했습니다. 다시 시도해주세요.</p>
      )}

      {showFontModal && (
        <FontPickerModal currentFont={font} onSelect={setFont} onClose={() => setShowFontModal(false)} />
      )}
      {showGifModal && (
        <GifPickerModal onSelect={(url) => setImageUrl(url)} onClose={() => setShowGifModal(false)} />
      )}
    </div>
  )
}
