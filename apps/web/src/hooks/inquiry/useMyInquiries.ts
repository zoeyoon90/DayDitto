'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchMyInquiries } from '@/api/inquiry.api'
import { queryKeys } from '@/lib/queryKeys'

export function useMyInquiries() {
  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: queryKeys.inquiries(),
    queryFn: () => fetchMyInquiries().catch(() => []),
  })

  return { inquiries, isLoading }
}
