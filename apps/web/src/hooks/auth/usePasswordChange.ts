import { useState, FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePasswordChange(email: string, onClose: () => void) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [oldPasswordError, setOldPasswordError] = useState<string | null>(null)
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null)
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setOldPasswordError(null)
    setNewPasswordError(null)
    setConfirmPasswordError(null)

    let hasError = false
    if (newPassword.length < 8) {
      setNewPasswordError('비밀번호는 8자 이상이어야 합니다.')
      hasError = true
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.')
      hasError = true
    }
    if (hasError) return

    setLoading(true)
    try {
      const supabase = createClient()

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: oldPassword,
      })
      if (signInError) {
        setOldPasswordError('비밀번호가 틀렸습니다.')
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) {
        setNewPasswordError(updateError.message)
        return
      }

      setSuccess(true)
      setTimeout(onClose, 1500)
    } finally {
      setLoading(false)
    }
  }

  return {
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    oldPasswordError,
    newPasswordError,
    confirmPasswordError,
    loading,
    success,
    handleSubmit,
  }
}
