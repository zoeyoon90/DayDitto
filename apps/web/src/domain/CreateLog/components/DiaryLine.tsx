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
  font?: string;
};

export default function DiaryLine({
  line,
  showDelete,
  autoFocus,
  onChange,
  onDelete,
  onEnter,
  font,
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
      <div className="relative flex items-center h-6.5 pl-6.25 pr-4 bg-transparent">
        {/* size oracle: 텍스트 폭으로 row 폭 결정 */}
        <span
          className="whitespace-pre text-sm leading-6 invisible pointer-events-none select-none"
          aria-hidden="true"
          style={{ fontFamily: font }}
        >
          {line.korean || '오늘 하루를 한 문장으로 써보세요...'}
        </span>
        {/* textarea: absolute로 row 전체 채움 */}
        <textarea
          ref={textareaRef}
          value={line.korean}
          onChange={(e) => onChange(line.id, e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="오늘 하루를 한 문장으로 써보세요..."
          rows={1}
          style={{ fontFamily: font }}
          className="absolute inset-0 pl-6.25 pr-4 h-full resize-none bg-transparent outline-none text-sm text-foreground placeholder:text-foreground/25 leading-6 overflow-hidden"
        />
        {showDelete && (
          <button
            onClick={() => onDelete(line.id)}
            className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity text-foreground/30 hover:text-foreground/70 text-sm leading-none shrink-0 ml-2"
            aria-label="줄 삭제"
          >
            ×
          </button>
        )}
      </div>

      {/* English 줄 */}
      <div className="flex items-center h-6.5 pl-6.25 pr-4 bg-main">
        <p
          className={cn(
            'flex-1 leading-6 text-xs whitespace-nowrap',
            line.isTranslated ? 'text-card' : 'text-foreground/60 italic',
          )}
          style={{ fontFamily: font }}
        >
          {line.isTranslated ? line.english : '번역 결과가 여기에 표시됩니다'}
        </p>
      </div>
    </div>
  );
}
