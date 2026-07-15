'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type Platform = 'ios' | 'android';

export default function HomeScreenGuide() {
  const [platform, setPlatform] = useState<Platform | null>(null);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua)) setPlatform('ios');
    else if (/Android/i.test(ua)) setPlatform('android');
  }, []);

  if (!platform) return null;

  return (
    <div className="absolute bottom-full left-4 right-4 mb-2 rounded-base border-2 border-main bg-card/80 p-3 text-center shadow-shadow backdrop-blur-sm font-(family-name:--font-do-hyeon)">
      <p className="text-sm font-bold text-foreground">홈화면에 추가하면 앱처럼 더 편하게 쓸 수 있어요</p>
      <p className="mt-1 flex items-center justify-center gap-1 text-xs text-foreground/70">
        {platform === 'ios' ? (
          <>
            하단{' '}
            <Image src="/Icon/공유Icon.png" alt="공유" width={16} height={16} className="inline-block align-middle" />
            {' '}탭 → 홈 화면에 추가
          </>
        ) : (
          '우측 상단 메뉴(⋮) 탭 → 홈 화면에 추가'
        )}
      </p>
    </div>
  );
}
