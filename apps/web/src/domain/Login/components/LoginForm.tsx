'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { loginSchema, type LoginFormData } from '@/types/auth'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/Input/Input'
import { Button } from '@/components/Button/Button'
import DoorAnimationModal from '@/components/DoorAnimationModal/DoorAnimationModal'

export default function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      setIsLoading(false)
      setError('root', { message: '이메일 또는 비밀번호가 올바르지 않습니다' })
      return
    }
    // 성공 시 isLoading은 true 유지 — 페이지 이동 완료될 때까지 모달 표시
    router.push('/calendar')
  }

  return (
    <>
      <DoorAnimationModal isOpen={isLoading} mode="login" />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="이메일"
          type="email"
          placeholder="example@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 입력하세요"
          error={errors.password?.message}
          {...register('password')}
        />
        {errors.root && (
          <p className="text-sm text-red-500 text-center">{errors.root.message}</p>
        )}
        <Button type="submit" className="w-full bg-main" disabled={isLoading}>
          로그인
        </Button>
      </form>
    </>
  )
}
