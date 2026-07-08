'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { signupSchema, type SignupFormData } from '@/types/auth'
import { signup } from '@/lib/auth'
import Input from '@/components/Input/Input'
import { Button } from '@/components/Button/Button'

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
    const { error } = await signup(data)
    if (error) {
      setError('root', { message: error })
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
