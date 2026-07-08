import Link from 'next/link';
import { Button } from '../Button/Button';

export default function NavBar() {
  return (
    <nav className="fixed top-0 left-0 z-50 flex h-13 w-full items-center justify-between px-4 sm:px-8">
      {/* 로고 */}
      <Link href="/" className="text-xl sm:text-2xl font-bold">
        DayDitto
      </Link>

      {/* 메뉴 */}
      <div className="flex gap-2 sm:gap-6">
        <Button asChild className='bg-card h-7 w-12 text-xs sm:h-8 sm:w-16 sm:text-sm' >
          <Link href="/calender">캘린더</Link>
        </Button>
        <Button asChild className='bg-main h-7 w-12 text-xs sm:h-8 sm:w-16 sm:text-sm'>
          <Link href="/create">일기쓰기</Link>
        </Button>
        <Button asChild className='bg-accent h-7 w-12 text-xs sm:h-8 sm:w-16 sm:text-sm'>
          <Link href="/login">로그아웃</Link>
        </Button>
      </div>
    </nav>
  );
}
