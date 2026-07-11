'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { getActiveNotice } from '@/api/notices.api'
import { queryKeys } from '@/lib/queryKeys'

function getSessionKey(id: string, resentAt: string | null) {
  const dateRef = resentAt ?? ''
  return `notice_seen_${id}_${dateRef}`
}

export function useNotice() {
  const { data: notice } = useQuery({
    queryKey: queryKeys.noticeActive(),
    queryFn: getActiveNotice,
  })

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!notice) return
    const key = getSessionKey(notice.id, notice.resentAt)
    if (!sessionStorage.getItem(key)) {
      setVisible(true)
    }
  }, [notice])

  const dismiss = () => {
    if (!notice) return
    sessionStorage.setItem(getSessionKey(notice.id, notice.resentAt), '1')
    setVisible(false)
  }

  return { notice: visible ? notice : null, dismiss }
}
