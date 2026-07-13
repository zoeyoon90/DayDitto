'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { signupSchema, type SignupFormData } from '@/types/auth'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/Input/Input'
import { Button } from '@/components/Button/Button'

const SUPABASE_ERROR_MAP: Record<string, string> = {
  'User already registered': '이미 가입된 이메일입니다.',
  'Password should be at least 6 characters': '비밀번호는 6자 이상이어야 합니다.',
  'Unable to validate email address: invalid format': '올바른 이메일 형식이 아닙니다.',
  'invalid email': '올바른 이메일 형식이 아닙니다.',
  'Email rate limit exceeded': '잠시 후 다시 시도해주세요.',
  'signup_disabled': '현재 회원가입이 비활성화되어 있습니다.',
}

function getSignupErrorMessage(message: string): string {
  for (const [key, value] of Object.entries(SUPABASE_ERROR_MAP)) {
    if (message.toLowerCase().includes(key.toLowerCase())) return value
  }
  return '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.'
}

export default function SignupForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async ({ passwordConfirm: _, ...data }: SignupFormData) => {
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { nickname: data.nickname } },
    })
    if (error) {
      setError('root', { message: getSignupErrorMessage(error.message) })
      return
    }
    router.push('/login')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="이메일"
        type="email"
        placeholder="example@email.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="닉네임"
        type="text"
        placeholder="닉네임을 입력하세요"
        error={errors.nickname?.message}
        {...register('nickname')}
      />
      <Input
        label="비밀번호"
        type="password"
        placeholder="8자 이상 입력하세요"
        error={errors.password?.message}
        {...register('password')}
      />
      <Input
        label="비밀번호 확인"
        type="password"
        placeholder="비밀번호를 다시 입력하세요"
        error={errors.passwordConfirm?.message}
        {...register('passwordConfirm')}
      />
      {errors.root && (
        <p className="text-sm text-red-500 text-center">{errors.root.message}</p>
      )}
      <Button type="submit" className="w-full bg-main" disabled={isSubmitting}>
        {isSubmitting ? '가입 중...' : '회원가입'}
      </Button>
    </form>
  )
}
