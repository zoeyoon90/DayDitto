'use client';

import { Button } from '@/components/Button/Button';
import { useAccountDeletion } from '@/hooks/auth/useAccountDeletion';

interface Props {
  onClose: () => void;
}

export default function DeleteAccountModal({ onClose }: Props) {
  const { loading, error, handleDelete } = useAccountDeletion();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border-2 border-border shadow-shadow rounded-base w-full max-w-sm mx-4 p-6">
        <h2 className="text-lg font-bold mb-2">회원탈퇴</h2>
        <p className="text-sm text-foreground/70 mb-6">
          정말 탈퇴하시겠습니까?<br />
          탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
        </p>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={onClose}
            className="flex-1 bg-card"
            disabled={loading}
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            className="flex-1 bg-red-500 text-white border-red-700"
            disabled={loading}
          >
            {loading ? '처리 중...' : '탈퇴'}
          </Button>
        </div>
      </div>
    </div>
  );
}
