'use client';

import Link from 'next/link';
import { Button } from '../Button/Button';
import { useLogout } from '@/hooks/auth/useLogout';
import { useTodayLogExists } from '@/hooks/diary/useTodayLogExists';

export default function NavBar() {
  const { handleLogout } = useLogout();
  const todayWritten = useTodayLogExists();

  return (
    <nav className="fixed top-0 left-0 z-50 flex h-13 w-full items-center justify-between px-4 sm:px-8">
      {/* 로고 */}
      <span className="text-xl sm:text-2xl font-bold">
        DayDitto
      </span>

      {/* 메뉴 */}
      <div className="flex gap-2 sm:gap-6">
        <Button asChild className='bg-card h-7 w-12 text-xs sm:h-8 sm:w-16 sm:text-sm'>
          <Link href="/calender">캘린더</Link>
        </Button>
        {todayWritten ? (
          <Button disabled className='bg-main/40 h-7 w-12 text-xs sm:h-8 sm:w-16 sm:text-sm cursor-not-allowed'>
            일기쓰기
          </Button>
        ) : (
          <Button asChild className='bg-main h-7 w-12 text-xs sm:h-8 sm:w-16 sm:text-sm'>
            <Link href="/create">일기쓰기</Link>
          </Button>
        )}
        <Button asChild className='bg-card h-7 w-12 text-xs sm:h-8 sm:w-16 sm:text-sm'>
          <Link href="/profile">프로필</Link>
        </Button>
        <Button
          onClick={handleLogout}
          className='bg-accent h-7 w-14 text-xs sm:h-8 sm:w-16 sm:text-sm'
        >
          로그아웃
        </Button>
      </div>
    </nav>
  );
}
