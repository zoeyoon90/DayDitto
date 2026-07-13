'use client'

import { createPortal } from 'react-dom'
import { useEscapeKey } from '@/hooks/ui/useEscapeKey'

export type FontKey = 'yeongwol' | 'do-hyeon' | 'keriskedu'

export const FONTS: { key: FontKey; label: string; cssVar: string }[] = [
  { key: 'yeongwol',  label: '영월체',   cssVar: 'var(--font-yeongwol)' },
  { key: 'do-hyeon',  label: '도현체',   cssVar: 'var(--font-do-hyeon)' },
  { key: 'keriskedu', label: '교육부체', cssVar: 'var(--font-keriskedu)' },
]

interface Props {
  currentFont: FontKey
  onSelect: (key: FontKey) => void
  onClose: () => void
}

export default function FontPickerModal({ currentFont, onSelect, onClose }: Props) {
  useEscapeKey(onClose)

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-card border-2 border-border shadow-shadow rounded-base p-4 flex flex-col gap-3 min-w-48"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-foreground/70">폰트 선택</p>
        <div className="flex flex-col gap-2">
          {FONTS.map((f) => (
            <button
              key={f.key}
              onClick={() => { onSelect(f.key); onClose() }}
              className={`flex flex-col items-start px-3 py-2 rounded-base border-2 transition-colors ${
                currentFont === f.key
                  ? 'border-border bg-main shadow-shadow'
                  : 'border-border/40 hover:border-border hover:bg-main/30'
              }`}
              style={{ fontFamily: f.cssVar }}
            >
              <span className="text-sm text-foreground">{f.label}</span>
              <span className="text-xs text-foreground/50">가나다 Abc</span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}
