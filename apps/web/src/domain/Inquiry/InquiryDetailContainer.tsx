'use client'

import Link from 'next/link'
import { useInquiryDetail } from '@/hooks/inquiry/useInquiryDetail'
import { Button } from '@/components/Button/Button'

export default function InquiryDetailContainer({ id }: { id: string }) {
  const { inquiry, isLoading } = useInquiryDetail(id)

  if (isLoading) {
    return <p className="text-foreground/40 text-sm text-center py-12">불러오는 중...</p>
  }

  if (!inquiry) {
    return <p className="text-foreground/40 text-sm text-center py-12">문의를 찾을 수 없습니다.</p>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/profile">
          <Button variant="neutral" size="sm">← 목록으로</Button>
        </Link>
      </div>
      <div className="border-2 border-border rounded-base bg-bw shadow-shadow p-6">
        <p className="text-xs text-foreground/40 mb-2">
          {new Date(inquiry.createdAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <h1 className="text-xl font-bold text-text mb-4">{inquiry.title}</h1>
        <hr className="border-border mb-4" />
        <p className="text-sm text-text whitespace-pre-wrap leading-relaxed">{inquiry.content}</p>
      </div>
    </div>
  )
}
