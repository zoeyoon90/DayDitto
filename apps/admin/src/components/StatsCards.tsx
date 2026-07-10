'use client';

import { useAdminStats } from '@/hooks/useAdminStats';

interface StatCardProps {
  label: string;
  value: number;
  color?: string;
}

function StatCard({ label, value, color = 'bg-white' }: StatCardProps) {
  return (
    <div className={`${color} rounded-lg border border-gray-200 p-5`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  );
}

export function StatsCards() {
  const { stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-16 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const dayTranslation = stats.aiDay['translation'] ?? 0;
  const dayTts = stats.aiDay['tts'] ?? 0;
  const weekTranslation = stats.aiWeek['translation'] ?? 0;
  const weekTts = stats.aiWeek['tts'] ?? 0;
  const monthTranslation = stats.aiMonth['translation'] ?? 0;
  const monthTts = stats.aiMonth['tts'] ?? 0;

  return (
    <div className="space-y-6">
      {/* 활성 유저 */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-3">활성 유저</h3>
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="DAU (오늘)" value={stats.dau} />
          <StatCard label="WAU (7일)" value={stats.wau} />
          <StatCard label="MAU (30일)" value={stats.mau} />
        </div>
      </div>

      {/* AI 호출 */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-3">AI 호출 (번역 / TTS)</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <StatCard label="오늘 번역" value={dayTranslation} />
          <StatCard label="오늘 TTS" value={dayTts} />
          <StatCard label="7일 번역" value={weekTranslation} />
          <StatCard label="7일 TTS" value={weekTts} />
          <StatCard label="30일 번역" value={monthTranslation} />
          <StatCard label="30일 TTS" value={monthTts} />
        </div>
      </div>
    </div>
  );
}
