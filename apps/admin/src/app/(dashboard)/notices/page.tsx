'use client';

import { NoticeForm } from '@/components/NoticeForm';
import { NoticeList } from '@/components/NoticeList';

export default function NoticesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">공지알람</h1>
      <NoticeForm />
      <NoticeList />
    </div>
  );
}
