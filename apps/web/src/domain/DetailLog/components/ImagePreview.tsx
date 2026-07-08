'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Props {
  src: string
}

export default function ImagePreview({ src }: Props) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative w-8 h-8 border border-border rounded-base overflow-hidden cursor-pointer">
        <Image src={src} alt="일기 이미지" fill unoptimized className="object-cover" />
      </div>
      {hovered && (
        <div className="absolute top-full left-0 mt-2 w-48 h-48 rounded-base overflow-hidden border-2 border-border shadow-shadow z-50">
          <Image src={src} alt="일기 이미지 확대" fill unoptimized className="object-cover" />
        </div>
      )}
    </div>
  )
}
