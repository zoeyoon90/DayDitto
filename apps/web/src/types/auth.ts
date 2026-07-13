  import { z } from 'zod'

  export const loginSchema = z.object({
    email: z.string().email('유효한 이메일을 입력하세요'),
    password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  })

  export const signupSchema = z
    .object({
      email: z.string().email('유효한 이메일을 입력하세요'),
      nickname: z
        .string()
        .min(2, '닉네임은 2자 이상이어야 합니다')
        .max(20, '닉네임은 20자 이하여야 합니다'),
      password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
      passwordConfirm: z.string(),
    })
    .refine((d) => d.password === d.passwordConfirm, {
      message: '비밀번호가 일치하지 않습니다',
      path: ['passwordConfirm'],
    })

  export type LoginFormData = z.infer<typeof loginSchema>
  export type SignupFormData = z.infer<typeof signupSchema>