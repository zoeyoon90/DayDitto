'use client';

import { useAdminNotices } from '@/hooks/useAdminNotices';
import { useNoticeActions } from '@/hooks/useNoticeActions';

export function NoticeList() {
  const { notices, isLoading } = useAdminNotices();
  const { deactivate, isDeactivating, resend, isResending } = useNoticeActions();

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500 text-sm">로딩 중...</div>;
  }

  if (notices.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500 text-sm">
        작성된 공지가 없습니다.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              내용
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              상태
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              작성일
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              액션
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {notices.map((notice) => (
            <tr key={notice.id}>
              <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                <p className="truncate">{notice.content}</p>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    notice.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {notice.isActive ? '활성' : '비활성'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(notice.createdAt).toLocaleString('ko-KR')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                {notice.isActive && (
                  <button
                    onClick={() => deactivate(notice.id)}
                    disabled={isDeactivating}
                    className="text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
                  >
                    비활성화
                  </button>
                )}
                <button
                  onClick={() => resend(notice.id)}
                  disabled={isResending}
                  className="text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
                >
                  재전송
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
