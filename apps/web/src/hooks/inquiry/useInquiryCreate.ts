'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { createInquiry } from '@/api/inquiry.api'
import { queryKeys } from '@/lib/queryKeys'

export function useInquiryCreate() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({})

  const { mutate, isPending } = useMutation({
    mutationFn: createInquiry,
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inquiries() })
      router.push(`/inquiry/${id}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: typeof errors = {}
    if (!title.trim()) newErrors.title = '제목을 입력해주세요.'
    if (!content.trim()) newErrors.content = '내용을 입력해주세요.'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    mutate({ title: title.trim(), content: content.trim() })
  }

  return { title, setTitle, content, setContent, errors, handleSubmit, isPending }
}
