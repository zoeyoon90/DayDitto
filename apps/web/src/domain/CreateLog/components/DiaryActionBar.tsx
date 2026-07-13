'use client';

import { Button } from '@/components/Button/Button';

type DiaryActionBarProps = {
  isTranslating: boolean;
  isSaving: boolean;
  onTranslate: () => void;
  onSave: () => void;
};

export default function DiaryActionBar({
  isTranslating,
  isSaving,
  onTranslate,
  onSave,
}: DiaryActionBarProps) {
  return (
    <div className="flex items-center justify-end gap-3 ">
      <Button
        variant="neutral"
        onClick={onTranslate}
        disabled={isTranslating || isSaving}
        className="bg-main border-border text-foreground hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none h-8 w-16"
      >
        {isTranslating ? '번역 중...' : '번역하기'}
      </Button>
      <Button variant="default" onClick={onSave} disabled={isSaving} className=' h-8 w-16'>
        {isSaving ? '저장 중...' : '저장하기'}
      </Button>
    </div>
  );
}
