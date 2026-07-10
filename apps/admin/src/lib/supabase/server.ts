import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { maxAge, expires, ...sessionOptions } = options ?? {};
              if (!value) {
                // 빈값 = Supabase 청크 쿠키 cleanup → 즉시 만료로 브라우저에서 확실히 삭제
                cookieStore.set(name, '', { ...sessionOptions, maxAge: 0 });
              } else {
                // maxAge/expires 제거 → 세션 쿠키 → 브라우저 닫으면 세션 만료
                cookieStore.set(name, value, {
                  ...sessionOptions,
                  httpOnly: true,
                  sameSite: 'lax',
                  secure: process.env.NODE_ENV === 'production',
                });
              }
            });
          } catch {
            // Server Component에서 호출 시 무시
          }
        },
      },
    },
  );
};
