'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import ProfileNav from './components/ProfileNav';
import ProfileInfo from './components/ProfileInfo';
import Bookmarks from './components/Bookmarks';
import MyInquiries from './components/MyInquiries';
import DeleteAccountModal from './components/DeleteAccountModal';

type Tab = 'profile' | 'bookmarks' | 'inquiries' | 'delete';

export default function ProfileContainer() {
  const user = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleTabChange = (tab: Tab) => {
    if (tab === 'delete') {
      setShowDeleteModal(true);
      return;
    }
    setActiveTab(tab);
  };

  if (!user) {
    return <p className="text-foreground/40 text-sm">로그인이 필요합니다.</p>;
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.25rem)] w-full">
      <ProfileNav activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="flex-1 px-6 sm:px-10 py-8">
        {activeTab === 'profile' && (
          <ProfileInfo
            email={user.email ?? ''}
            nickname={user.nickname ?? null}
            provider={user.provider ?? 'email'}
          />
        )}
        {activeTab === 'bookmarks' && <Bookmarks />}
        {activeTab === 'inquiries' && <MyInquiries />}
      </main>

      {showDeleteModal && (
        <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
      )}
    </div>
  );
}
