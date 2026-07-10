'use client';

import { useAdminStatsTrend } from '@/hooks/useAdminStats';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function StatsCharts() {
  const { trend, isLoading } = useAdminStatsTrend();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 h-72 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
            <div className="h-full bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!trend) return null;

  // DAU 트렌드 데이터 가공
  const dauData = trend.dau.map((d) => ({
    date: formatDate(d.date),
    DAU: d.dau,
  }));

  // AI 호출 트렌드 데이터 가공 (날짜별 translation/tts 합산)
  const aiMap = new Map<string, { date: string; 번역: number; TTS: number }>();
  trend.ai.forEach(({ date, call_type, count }) => {
    const key = date;
    if (!aiMap.has(key)) {
      aiMap.set(key, { date: formatDate(date), 번역: 0, TTS: 0 });
    }
    const entry = aiMap.get(key)!;
    if (call_type === 'translation') entry['번역'] += count;
    if (call_type === 'tts') entry['TTS'] += count;
  });
  const aiData = Array.from(aiMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* DAU 트렌드 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">7일 DAU 트렌드</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={dauData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="DAU"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI 호출 트렌드 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">7일 AI 호출 트렌드</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={aiData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="번역" stackId="a" fill="#3b82f6" />
            <Bar dataKey="TTS" stackId="a" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
