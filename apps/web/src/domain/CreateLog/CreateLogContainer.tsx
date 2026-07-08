'use client';

import { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import DiaryLineList from './components/DiaryLineList';
import DiaryActionBar from './components/DiaryActionBar';
import DayMeta from './components/DayMeta';
import { DiaryLineData } from './components/DiaryLine';

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
  const [lines, setLines] = useState<DiaryLineData[]>([createLine()]);
  const [image, setImage] = useState<File | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [mood, setMood] = useState<string | null>(null);
  const [weather, setWeather] = useState<string | null>(null);
  const [focusLineId, setFocusLineId] = useState<string | null>(null);

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
      // TODO: Claude Haiku API 연동 — POST /api/translate { lines: korean[] }
      // 임시 stub: 각 줄에 placeholder 번역 표시
      await new Promise((r) => setTimeout(r, 800));
      setLines((prev) =>
        prev.map((l) =>
          l.korean.trim()
            ? { ...l, english: `(번역 예정) ${l.korean}`, isTranslated: true }
            : l,
        ),
      );
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = () => {
    // TODO: POST /api/logs — { date, imageUrl, lines }
    console.log('저장:', { lines, image });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* 날짜/날씨/기분/이미지 navbar */}
      <div className="flex items-center gap-2 px-1 py-2 border-b border-border/10">
        <DayMeta
          date={formatDate(new Date())}
          mood={mood}
          weather={weather}
          onMoodChange={setMood}
          onWeatherChange={setWeather}
        />
        <div className="w-px h-4 bg-border shrink-0" />
        <ImageUpload compact image={image} onImageChange={setImage} />
      </div>

      {/* 일기 카드 */}
      <div
        className="border-2 border-border shadow-shadow rounded-base overflow-hidden"
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
        />
      </div>

      {/* 액션 버튼 */}
      <DiaryActionBar
        isTranslating={isTranslating}
        onTranslate={handleTranslate}
        onSave={handleSave}
      />
    </div>
  );
}
