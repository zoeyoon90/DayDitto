'use client'

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

interface Props {
  src: string
}

export default function ImagePreview({ src }: Props) {
  const thumbRef = useRef<HTMLDivElement>(null)
  const [previewRect, setPreviewRect] = useState<DOMRect | null>(null)

  return (
    <div
      className="relative"
      onMouseEnter={() => setPreviewRect(thumbRef.current?.getBoundingClientRect() ?? null)}
      onMouseLeave={() => setPreviewRect(null)}
    >
      <div ref={thumbRef} className="relative w-8 h-8 border border-border rounded-base overflow-hidden cursor-pointer">
        <Image src={src} alt="일기 이미지" fill unoptimized className="object-cover" />
      </div>
      {previewRect && createPortal(
        <div
          style={{
            position: 'fixed',
            top: previewRect.bottom + 8,
            left: previewRect.left,
            zIndex: 50,
          }}
          className="rounded-base overflow-hidden border-2 border-border shadow-shadow"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="일기 이미지 확대" style={{ display: 'block', maxWidth: '320px', maxHeight: '320px' }} />
        </div>,
        document.body
      )}
    </div>
  )
}
