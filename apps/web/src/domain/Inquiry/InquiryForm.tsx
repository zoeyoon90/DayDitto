'use client'

import { useRouter } from 'next/navigation'
import { useInquiryCreate } from '@/hooks/inquiry/useInquiryCreate'
import Input from '@/components/Input/Input'
import { Button } from '@/components/Button/Button'

export default function InquiryForm() {
  const router = useRouter()
  const { title, setTitle, content, setContent, errors, handleSubmit, isPending } = useInquiryCreate()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">문의 작성</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="제목"
          placeholder="문의 제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-base text-text">내용</label>
          <textarea
            placeholder="문의 내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className={[
              'w-full rounded-base border-2 border-border bg-bw px-3 py-2',
              'text-sm text-text shadow-shadow placeholder:text-text/50',
              'transition-all focus:outline-none resize-none',
              'focus:translate-x-boxShadowX focus:translate-y-boxShadowY focus:shadow-none',
              errors.content ? 'border-red-500 shadow-[4px_4px_0px_0px_#ef4444]' : '',
            ].join(' ')}
          />
          {errors.content && <p className="text-xs text-red-500">{errors.content}</p>}
        </div>
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="neutral"
            onClick={() => router.back()}
            disabled={isPending}
          >
            취소
          </Button>
          <Button type="submit" variant="default" disabled={isPending}>
            {isPending ? '제출 중...' : '제출하기'}
          </Button>
        </div>
      </form>
    </div>
  )
}
