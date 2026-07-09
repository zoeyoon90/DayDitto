'use client';

import { useState } from 'react';
import { Button } from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import PasswordChangeModal from './PasswordChangeModal';

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
  const [nickname, setNickname] = useState(initialNickname ?? '');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setSaveMessage(data.error ?? '저장 중 오류가 발생했습니다.');
        return;
      }
      setSaveMessage('저장되었습니다.');
      setTimeout(() => setSaveMessage(null), 2000);
    } finally {
      setSaving(false);
    }
  };

  const socialIcon = SOCIAL_ICONS[provider];

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold">프로필</h2>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-foreground/70">이메일</label>
        <div className="flex items-center justify-between border-2 border-border rounded-base px-3 py-2 bg-bw/50">
          <p className="text-sm text-text/70">{email}</p>
          {socialIcon && (
            <img src={socialIcon} alt={provider} className="w-5 h-5 shrink-0" />
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

      {showPasswordModal && (
        <PasswordChangeModal
          email={email}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
}
