import Link from 'next/link'
import LoginForm from './components/LoginForm'
import SocialLogin from './components/SocialLogin'

export default function LoginContainer() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-card px-4">
      <div className="w-full max-w-md rounded-base border-2 border-border bg-background p-8 shadow-shadow">
        <h1 className="mb-6 text-2xl font-bold text-text">로그인</h1>
        <LoginForm />
        <div className="mt-6">
          <SocialLogin />
        </div>
        <p className="mt-6 text-center text-sm text-text/60">
          아직 계정이 없으신가요?{' '}
          <Link href="/signup" className="font-bold text-main underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
