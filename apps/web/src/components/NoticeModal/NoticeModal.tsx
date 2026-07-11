'use client'

import { createPortal } from 'react-dom'
import { useEscapeKey } from '@/hooks/ui/useEscapeKey'

interface Props {
  content: string
  onClose: () => void
}

export default function NoticeModal({ content, onClose }: Props) {
  useEscapeKey(onClose)

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-card border-2 border-border shadow-shadow rounded-base p-6 max-w-sm w-full mx-4 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">공지사항</h2>
          <button
            onClick={onClose}
            className="text-foreground/50 hover:text-foreground transition-colors text-xl leading-none"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
          {content}
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-main text-white text-sm font-medium rounded-base hover:bg-main/80 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
