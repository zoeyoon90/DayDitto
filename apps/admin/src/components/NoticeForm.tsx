'use client';

import { useState } from 'react';
import { useCreateNotice } from '@/hooks/useCreateNotice';

export function NoticeForm() {
  const [content, setContent] = useState('');
  const { createNotice, isPending } = useCreateNotice();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createNotice(content, {
      onSuccess: () => setContent(''),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">공지사항 작성</h2>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        placeholder="공지 내용을 입력하세요..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? '전송 중...' : '확인'}
        </button>
      </div>
    </form>
  );
}
