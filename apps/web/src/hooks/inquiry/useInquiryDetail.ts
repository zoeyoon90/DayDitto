'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchInquiryDetail } from '@/api/inquiry.api'
import { queryKeys } from '@/lib/queryKeys'

export function useInquiryDetail(id: string) {
  const { data: inquiry, isLoading } = useQuery({
    queryKey: queryKeys.inquiry(id),
    queryFn: () => fetchInquiryDetail(id),
  })

  return { inquiry, isLoading }
}
