'use client';

import { useAdminPushNotificationStats } from '@/hooks/useAdminPushNotificationStats';

export function PushNotificationStats() {
  const { stats, isLoading } = useAdminPushNotificationStats();

  if (isLoading) {
    return <p className="text-gray-500 text-sm">불러오는 중...</p>;
  }

  if (!stats) {
    return <p className="text-gray-500 text-sm">데이터를 불러올 수 없습니다.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6 w-fit">
        <p className="text-sm text-gray-500 mb-1">알림 설정 유저 수</p>
        <p className="text-4xl font-bold text-blue-600">{stats.subscriberCount.toLocaleString()}</p>
        <p className="text-xs text-gray-400 mt-1">명</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700">기타 실패 로그 (최대 20건)</h2>
          <p className="text-xs text-gray-400 mt-0.5">만료 삭제(410/404)를 제외한 실패가 발생한 크론 실행만 표시됩니다.</p>
        </div>

        {(stats.failedLogs ?? []).length === 0 ? (
          <p className="px-6 py-8 text-sm text-green-600 text-center font-medium">실패 로그 없음</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전송 시각</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">대상</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">성공</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">기타실패</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(stats.failedLogs ?? []).map((log) => (
                <tr key={log.id} className="bg-red-50">
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {new Date(log.sentAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{log.totalTargeted}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-medium">{log.totalSent}</td>
                  <td className="px-4 py-3 text-right font-medium text-red-600">{log.totalFailed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
