'use client'

import { createClient } from '@/lib/supabase/client'

const SOCIAL_PROVIDERS = [
  {
    provider: 'kakao' as const,
    label: '카카오로 로그인',
    bg: 'bg-[#FEE500]',
    text: 'text-[#191919]',
  },
  {
    provider: 'google' as const,
    label: '구글로 로그인',
    bg: 'bg-white',
    text: 'text-[#191919]',
  },
] as const

export default function SocialLogin() {
  const handleSocialLogin = async (provider: 'kakao' | 'google') => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex items-center">
        <div className="flex-1 border-t-2 border-border" />
        <span className="mx-3 text-xs text-text/60 font-base">또는</span>
        <div className="flex-1 border-t-2 border-border" />
      </div>
      <div className="flex flex-col gap-2">
        {SOCIAL_PROVIDERS.map(({ provider, label, bg, text }) => (
          <button
            key={provider}
            type="button"
            onClick={() => handleSocialLogin(provider)}
            className={`w-full rounded-base border-2 border-border px-4 py-2 text-sm font-base shadow-shadow transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none ${bg} ${text}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
