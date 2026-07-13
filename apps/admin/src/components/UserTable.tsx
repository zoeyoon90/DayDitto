'use client';

import { useAdminUsers } from '@/hooks/useAdminUsers';
import type { AdminUser } from '@/api/admin.api';

const providerBadge: Record<AdminUser['provider'], string> = {
  email: 'bg-gray-100 text-gray-700',
  kakao: 'bg-yellow-100 text-yellow-800',
  google: 'bg-blue-100 text-blue-800',
};

const providerLabel: Record<AdminUser['provider'], string> = {
  email: '이메일',
  kakao: '카카오',
  google: '구글',
};

export function UserTable() {
  const { users, isLoading } = useAdminUsers();

  if (isLoading) {
    return <div className="py-12 text-center text-gray-500">로딩 중...</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {[
              '이메일',
              '닉네임',
              '로그인 방식',
              '활성 일수',
              '일기',
              '번역',
              'TTS',
              '가입일',
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-900 max-w-[200px] truncate">
                {user.email ?? '-'}
              </td>
              <td className="px-4 py-3 text-gray-900">{user.nickname ?? '-'}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${providerBadge[user.provider]}`}
                >
                  {providerLabel[user.provider]}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-700 text-right">
                {user.login_count}
              </td>
              <td className="px-4 py-3 text-gray-700 text-right">
                {user.diary_count}
              </td>
              <td className="px-4 py-3 text-gray-700 text-right">
                {user.translation_count}
              </td>
              <td className="px-4 py-3 text-gray-700 text-right">
                {user.tts_count}
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {new Date(user.created_at).toLocaleDateString('ko-KR')}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                유저가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
