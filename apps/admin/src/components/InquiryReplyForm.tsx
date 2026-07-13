'use client';

import { useState } from 'react';
import { useAdminInquiry } from '@/hooks/useAdminInquiries';
import { useInquiryReply } from '@/hooks/useInquiryReply';

export function InquiryReplyForm({ id }: { id: string }) {
  const { inquiry, isLoading } = useAdminInquiry(id);
  const { submitReply, isPending } = useInquiryReply(id);
  const [replyText, setReplyText] = useState('');

  if (isLoading) {
    return <div className="py-12 text-center text-gray-500">로딩 중...</div>;
  }

  if (!inquiry) {
    return <div className="py-12 text-center text-gray-500">문의를 찾을 수 없습니다.</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    submitReply(replyText, {
      onSuccess: () => setReplyText(''),
    });
  };

  return (
    <div className="space-y-6">
      {/* 원본 문의 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{inquiry.title}</h2>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              inquiry.status === 'replied'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {inquiry.status === 'replied' ? '답변완료' : '답변대기'}
          </span>
        </div>
        <p className="text-gray-700 whitespace-pre-wrap">{inquiry.content}</p>
        <p className="mt-3 text-xs text-gray-400">
          {new Date(inquiry.createdAt).toLocaleString('ko-KR')}
        </p>
      </div>

      {/* 기존 답글 */}
      {inquiry.adminReply && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <p className="text-xs font-medium text-blue-600 mb-2">관리자 답변</p>
          <p className="text-gray-700 whitespace-pre-wrap">{inquiry.adminReply}</p>
          <p className="mt-3 text-xs text-gray-400">
            {inquiry.repliedAt &&
              new Date(inquiry.repliedAt).toLocaleString('ko-KR')}
          </p>
        </div>
      )}

      {/* 답글 작성 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {inquiry.adminReply ? '답변 수정' : '답변 작성'}
        </label>
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          rows={6}
          placeholder="답변 내용을 입력하세요..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={isPending || !replyText.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? '저장 중...' : '답변 저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
