'use client';

import { useState } from 'react';
import { fetchAdminUsers, fetchAdminInquiries, fetchAdminStats } from '@/api/admin.api';

export function ExcelExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const XLSX = await import('xlsx');
      const [users, inquiries, stats] = await Promise.all([
        fetchAdminUsers(),
        fetchAdminInquiries(),
        fetchAdminStats(),
      ]);

      const wb = XLSX.utils.book_new();

      // Sheet 1: 통계 요약
      const statsData = [
        ['항목', '값'],
        ['DAU (오늘)', stats.dau],
        ['WAU (7일)', stats.wau],
        ['MAU (30일)', stats.mau],
        [],
        ['AI 호출 (오늘)', '번역', stats.aiDay['translation'] ?? 0],
        ['', 'TTS', stats.aiDay['tts'] ?? 0],
        ['AI 호출 (7일)', '번역', stats.aiWeek['translation'] ?? 0],
        ['', 'TTS', stats.aiWeek['tts'] ?? 0],
        ['AI 호출 (30일)', '번역', stats.aiMonth['translation'] ?? 0],
        ['', 'TTS', stats.aiMonth['tts'] ?? 0],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(statsData), '통계');

      // Sheet 2: 유저 목록
      const usersData = [
        ['이메일', '닉네임', '로그인방식', '활성일수', '일기', '번역', 'TTS', '가입일'],
        ...users.map((u) => [
          u.email ?? '',
          u.nickname ?? '',
          u.provider,
          u.login_count,
          u.diary_count,
          u.translation_count,
          u.tts_count,
          new Date(u.created_at).toLocaleDateString('ko-KR'),
        ]),
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(usersData), '유저목록');

      // Sheet 3: 문의 목록
      const inquiriesData = [
        ['제목', '상태', '접수일', '답변일'],
        ...inquiries.map((i) => [
          i.title,
          i.status === 'replied' ? '답변완료' : '답변대기',
          new Date(i.createdAt).toLocaleDateString('ko-KR'),
          i.repliedAt ? new Date(i.repliedAt).toLocaleDateString('ko-KR') : '',
        ]),
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(inquiriesData), '문의목록');

      const date = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `dayditto-admin-${date}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isExporting ? '내보내는 중...' : 'Excel 내보내기'}
    </button>
  );
}
