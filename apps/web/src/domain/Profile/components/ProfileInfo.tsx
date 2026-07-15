'use client';

import Image from 'next/image';
import { Button } from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import PasswordChangeModal from './PasswordChangeModal';
import { useProfileSave } from '@/hooks/profile/useProfileSave';
import { useState, useEffect } from 'react';
import { usePushNotification } from '@/hooks/notifications/usePushNotification';

const SOCIAL_ICONS: Record<string, string> = {
  google: '/Icon/GoogleIcon.svg',
  kakao: '/Icon/KakaoIcon.svg',
};

interface Props {
  email: string;
  nickname: string | null;
  provider: string;
}

export default function ProfileInfo({ email, nickname: initialNickname, provider }: Props) {
  const { nickname, setNickname, saving, saveMessage, handleSave } = useProfileSave(initialNickname);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { isSubscribed, unsubscribe } = usePushNotification();

  const socialIcon = SOCIAL_ICONS[provider];

  useEffect(() => {
    isSubscribed().then(setSubscribed);
  }, [isSubscribed]);

  async function handleUnsubscribe() {
    await unsubscribe();
    setSubscribed(false);
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold">프로필</h2>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-foreground/70">이메일</label>
        <div className="flex items-center justify-between border-2 border-border rounded-base px-3 py-2 bg-bw/50">
          <p className="text-sm text-text/70">{email}</p>
          {socialIcon && (
            <Image src={socialIcon} alt={provider ?? ''} width={20} height={20} className="shrink-0" />
          )}
        </div>
      </div>

      <Input
        label="닉네임"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="닉네임 입력"
        maxLength={20}
      />

      <Button
        type="button"
        onClick={() => setShowPasswordModal(true)}
        className="bg-card w-fit"
        disabled={provider !== 'email'}
      >
        비밀번호 변경
      </Button>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={handleSave}
          className="bg-main w-fit"
          disabled={saving}
        >
          {saving ? '저장 중...' : '저장하기'}
        </Button>
        {saveMessage && (
          <span className="text-sm text-foreground/70">{saveMessage}</span>
        )}
      </div>

      {subscribed && (
        <div className="flex flex-col gap-1">
          <label className="text-sm text-foreground/70">알림</label>
          <Button
            type="button"
            onClick={handleUnsubscribe}
            className="bg-card w-fit"
          >
            알림 해제
          </Button>
        </div>
      )}

      {showPasswordModal && (
        <PasswordChangeModal
          email={email}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
}
