'use client';

import Link from 'next/link';
import { useAdminInquiries } from '@/hooks/useAdminInquiries';

export function InquiryList() {
  const { inquiries, isLoading } = useAdminInquiries();

  if (isLoading) {
    return <div className="py-12 text-center text-gray-500">로딩 중...</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {['제목', '상태', '접수일', '답변일'].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {inquiries.map((inquiry) => (
            <tr key={inquiry.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <Link
                  href={`/inquiries/${inquiry.id}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {inquiry.title}
                </Link>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    inquiry.status === 'replied'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {inquiry.status === 'replied' ? '답변완료' : '답변대기'}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {inquiry.repliedAt
                  ? new Date(inquiry.repliedAt).toLocaleDateString('ko-KR')
                  : '-'}
              </td>
            </tr>
          ))}
          {inquiries.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                문의가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
