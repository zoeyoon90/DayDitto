import { useState } from 'react'

export type ProfileTab = 'profile' | 'bookmarks' | 'inquiries' | 'delete'

export function useProfileTabs() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleTabChange = (tab: ProfileTab) => {
    if (tab === 'delete') {
      setShowDeleteModal(true)
      return
    }
    setActiveTab(tab)
  }

  return { activeTab, showDeleteModal, setShowDeleteModal, handleTabChange }
}
