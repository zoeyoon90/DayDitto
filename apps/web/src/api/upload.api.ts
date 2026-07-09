import { apiUpload } from './client'

export const uploadImage = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return apiUpload<{ url: string }>('/upload', formData)
}
