'use client'

  import { useForm } from 'react-hook-form'
  import { zodResolver } from '@hookform/resolvers/zod'
  import { useRouter } from 'next/navigation'
  import { loginSchema, type LoginFormData } from '@/types/auth'
  import { login } from '@/lib/auth'
  import Input from '@/components/Input/Input'
  import { Button } from '@/components/Button/Button'

  export default function LoginForm() {
    const router = useRouter()
    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
      setError,
    } = useForm<LoginFormData>({
      resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormData) => {
      const { error } = await login(data)
      if (error) {
        setError('root', { message: '이메일 또는 비밀번호가 올바르지 않습니다' })
        return
      }
      router.push('/calender')
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
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 입력하세요"
          error={errors.password?.message}
          {...register('password')}
        />
        {errors.root && (
          <p className="text-sm text-red-500 text-center">{errors.root.message}</p>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? '로그인 중...' : '로그인'}
        </Button>
      </form>
    )
  }
