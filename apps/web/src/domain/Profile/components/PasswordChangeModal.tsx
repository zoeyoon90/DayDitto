'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/Button/Button';
import Input from '@/components/Input/Input';

interface Props {
  email: string;
  onClose: () => void;
}

export default function PasswordChangeModal({ email, onClose }: Props) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPasswordError, setOldPasswordError] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOldPasswordError(null);
    setNewPasswordError(null);
    setConfirmPasswordError(null);

    let hasError = false;
    if (newPassword.length < 8) {
      setNewPasswordError('비밀번호는 8자 이상이어야 합니다.');
      hasError = true;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);
    try {
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: oldPassword,
      });
      if (signInError) {
        setOldPasswordError('비밀번호가 틀렸습니다.');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        setNewPasswordError(updateError.message);
        return;
      }

      setSuccess(true);
      setTimeout(onClose, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border-2 border-border shadow-shadow rounded-base w-full max-w-sm mx-4 p-6">
        <h2 className="text-lg font-bold mb-4">비밀번호 변경</h2>

        {success ? (
          <p className="text-center text-green-600 py-4">비밀번호가 변경되었습니다.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              type="password"
              label="이전 비밀번호"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              placeholder="이전 비밀번호"
              error={oldPasswordError ?? undefined}
            />
            <Input
              type="password"
              label="변경할 비밀번호"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="8자 이상"
              error={newPasswordError ?? undefined}
            />
            <Input
              type="password"
              label="비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="비밀번호 재입력"
              error={confirmPasswordError ?? undefined}
            />

            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 bg-card"
                disabled={loading}
              >
                취소
              </Button>
              <Button type="submit" className="flex-1 bg-main" disabled={loading}>
                {loading ? '변경 중...' : '변경'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
