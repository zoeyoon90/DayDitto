'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from './components/ImageUpload';
import DiaryLineList from './components/DiaryLineList';
import DiaryActionBar from './components/DiaryActionBar';
import DayMeta from './components/DayMeta';
import { DiaryLineData } from './components/DiaryLine';
import { createClient } from '@/lib/supabase/client';

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

    let imageUrl: string | null = null;

    if (image instanceof File) {
      const supabase = createClient();
      const ext = image.name.split('.').pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('diary-images')
        .upload(path, image);
      if (!error && data) {
        const { data: urlData } = supabase.storage.from('diary-images').getPublicUrl(data.path);
        imageUrl = urlData.publicUrl;
      }
    } else if (typeof image === 'string') {
      imageUrl = image;
    }

    const englishContent = lines.map((l) => l.english).filter(Boolean).join('\n') || undefined;
    const logDate = new Date().toISOString().split('T')[0];

    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logDate, koreanContent, englishContent, imageUrl }),
    });
    if (res.ok) {
      const { id } = await res.json() as { id: string };
      router.push(`/detailLog?id=${id}`);
    }
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
