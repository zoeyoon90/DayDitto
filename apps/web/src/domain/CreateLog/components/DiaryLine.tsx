'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export type DiaryLineData = {
  id: string;
  korean: string;
  english: string;
  isTranslated: boolean;
};

type DiaryLineProps = {
  line: DiaryLineData;
  showDelete: boolean;
  autoFocus: boolean;
  onChange: (id: string, value: string) => void;
  onDelete: (id: string) => void;
  onEnter: (id: string) => void;
};

export default function DiaryLine({
  line,
  showDelete,
  autoFocus,
  onChange,
  onDelete,
  onEnter,
}: DiaryLineProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onEnter(line.id);
    }
  };

  return (
    <div className="relative group">
      {/* Korean 줄 */}
      <div className="flex items-center h-[26px] pl-[25px] pr-4 bg-transparent">
        <textarea
          ref={textareaRef}
          value={line.korean}
          onChange={(e) => onChange(line.id, e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="오늘 하루를 한 문장으로 써보세요..."
          rows={1}
          className="flex-1 h-6 resize-none bg-transparent outline-none text-sm text-foreground placeholder:text-foreground/25 leading-6 overflow-hidden"
        />
        {showDelete && (
          <button
            onClick={() => onDelete(line.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground/30 hover:text-foreground/70 text-sm leading-none shrink-0 ml-2"
            aria-label="줄 삭제"
          >
            ×
          </button>
        )}
      </div>

      {/* English 줄 */}
      <div className="flex items-center h-[26px] pl-[25px] pr-4 bg-main">
        <p
          className={cn(
            'flex-1 leading-6 text-xs',
            line.isTranslated ? 'text-card' : 'text-foreground/25 italic',
          )}
        >
          {line.isTranslated ? line.english : '번역 결과가 여기에 표시됩니다'}
        </p>
      </div>
    </div>
  );
}
