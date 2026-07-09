'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import ImageUpload from './components/ImageUpload';
import DiaryLineList from './components/DiaryLineList';
import DiaryActionBar from './components/DiaryActionBar';
import DayMeta from './components/DayMeta';
import { DiaryLineData } from './components/DiaryLine';
import FontPickerModal, { FontKey, FONTS } from '@/components/FontPickerModal/FontPickerModal';

const createLine = (): DiaryLineData => ({
  id: crypto.randomUUID(),
  korean: '',
  english: '',
  isTranslated: false,
});

const formatDate = (date: Date) =>
  date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

export default function CreateLogContainer() {
  const router = useRouter();
  const [lines, setLines] = useState<DiaryLineData[]>([createLine()]);
  const [image, setImage] = useState<File | string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [mood, setMood] = useState<string | null>(null);
  const [weather, setWeather] = useState<string | null>(null);
  const [focusLineId, setFocusLineId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string>('');
  const [font, setFont] = useState<FontKey>('yeongwol');
  const [showFontModal, setShowFontModal] = useState(false);

  const addLineAfter = (id: string) => {
    const newLine = createLine();
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      const next = [...prev];
      next.splice(idx + 1, 0, newLine);
      return next;
    });
    setFocusLineId(newLine.id);
  };

  const removeLine = (id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const updateLine = (id: string, value: string) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, korean: value, isTranslated: false } : l)),
    );
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines: lines.map((l) => l.korean) }),
      });
      const json = await res.json() as { translations?: string[] };
      if (!res.ok || !json.translations) return;
      setLines((prev) =>
        prev.map((l, i) =>
          json.translations![i] ? { ...l, english: json.translations![i], isTranslated: true } : l,
        ),
      );
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async () => {
    const koreanContent = lines.map((l) => l.korean).filter(Boolean).join('\n');
    if (!koreanContent.trim()) return;

    setSaveStatus('saving');
    setSaveError('');
    try {
      let imageUrl: string | null = null;

      if (image instanceof File) {
        const formData = new FormData();
        formData.append('file', image);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!uploadRes.ok) {
          const { error } = await uploadRes.json() as { error: string };
          throw new Error(`이미지 업로드 실패: ${error}`);
        }
        const { url } = await uploadRes.json() as { url: string };
        imageUrl = url;
      } else if (typeof image === 'string') {
        imageUrl = image;
      }

      const englishContent = lines.map((l) => l.english).filter(Boolean).join('\n') || undefined;
      const logDate = new Date().toISOString().split('T')[0];

      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logDate, koreanContent, englishContent, imageUrl, mood: mood ?? undefined, weather: weather ?? undefined }),
      });
      if (!res.ok) throw new Error(`일기 저장 실패 (${res.status})`);

      const { id } = await res.json() as { id: string };
      const englishLines = lines.map((l) => l.english).filter(Boolean);
      if (englishLines.length > 0) {
        const ttsRes = await fetch('/api/tts-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logId: id, lines: englishLines }),
        });
        if (!ttsRes.ok) throw new Error('음성 생성 실패');
      }

      setSaveStatus('idle');
      router.push(`/detailLog?id=${id}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
      setSaveStatus('error');
    }
  };

  return (
    <div className="max-w-201.5 mx-auto px-2 py-4 sm:px-4 sm:py-6 flex flex-col gap-6">
      {/* 날짜/날씨/기분/이미지 navbar */}
      <div className="flex flex-col gap-2 px-1 py-2 border-b border-border/10 sm:flex-row sm:items-center sm:gap-2">
        {/* row1: 날짜(좌) + 이미지(우, 모바일만) / sm+: contents로 투명화 */}
        <div className="flex items-center gap-2 sm:contents">
          <div className="border border-border rounded-base px-2 h-7 flex items-center flex-1 sm:flex-none sm:shrink-0">
            <p className="text-sm text-foreground/90 whitespace-nowrap">{formatDate(new Date())}</p>
          </div>
          <div className="hidden sm:block w-px h-4 bg-border shrink-0" />
          <div className="sm:hidden shrink-0">
            <ImageUpload compact image={image} onImageChange={setImage} />
          </div>
        </div>

        {/* row2: DayMeta 중앙정렬 (모바일) / sm+: contents로 투명화 */}
        <div className="flex justify-center sm:contents">
          <DayMeta
            mood={mood}
            weather={weather}
            onMoodChange={setMood}
            onWeatherChange={setWeather}
          />
        </div>

        {/* sm+ 전용 구분선 + 이미지 */}
        <div className="hidden sm:block w-px h-4 bg-border shrink-0" />
        <div className="hidden sm:block shrink-0">
          <ImageUpload compact image={image} onImageChange={setImage} />
        </div>

        {/* 폰트 버튼 */}
        <button
          onClick={() => setShowFontModal(true)}
          className="px-3 h-7 border-2 border-border bg-card rounded-base text-xs font-base text-foreground/80 shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all whitespace-nowrap"
        >
          폰트
        </button>
      </div>

      {/* 일기 카드 */}
      <div
        className="border-2 border-border shadow-shadow rounded-base overflow-x-auto"
        style={{ backgroundColor: '#fdfaf4' }}
      >
        <div
          className="min-w-max"
          style={{
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
            font={FONTS.find((f) => f.key === font)!.cssVar}
          />
        </div>
      </div>

      {/* 액션 버튼 */}
      <DiaryActionBar
        isTranslating={isTranslating}
        isSaving={saveStatus === 'saving'}
        onTranslate={handleTranslate}
        onSave={handleSave}
      />
      {showFontModal && (
        <FontPickerModal
          currentFont={font}
          onSelect={setFont}
          onClose={() => setShowFontModal(false)}
        />
      )}

      {/* 저장 상태 모달 */}
      {saveStatus !== 'idle' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-bg border-2 border-border shadow-shadow rounded-base p-6 flex flex-col items-center gap-4 min-w-64">
            {saveStatus === 'saving' ? (
              <>
                <div className="w-8 h-8 border-4 border-border border-t-main rounded-full animate-spin" />
                <p className="text-sm text-foreground">저장 중...</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground">저장 실패</p>
                <p className="text-xs text-foreground/60 text-center">{saveError}</p>
                <button
                  onClick={() => setSaveStatus('idle')}
                  className="px-4 h-8 border-2 border-border bg-main rounded-base text-xs shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                >
                  닫기
                </button>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
