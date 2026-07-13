import Link from 'next/link'
import SignupForm from './components/SignupForm'

export default function SignupContainer() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-base border-2 border-border bg-card p-8 shadow-shadow">
        <h1 className="mb-6 text-2xl font-bold text-text">회원가입</h1>
        <SignupForm />
        <p className="mt-6 text-center text-sm text-text/60">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="font-bold text-main underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
