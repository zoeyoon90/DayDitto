import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { maxAge, expires, ...sessionOptions } = options ?? {}
              if (!value) {
                cookieStore.set(name, '', { ...sessionOptions, maxAge: 0 })
              } else {
                cookieStore.set(name, value, {
                  ...sessionOptions,
                  httpOnly: true,
                  sameSite: 'lax',
                  secure: process.env.NODE_ENV === 'production',
                })
              }
            })
          },
        },
      },
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}/calender`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
