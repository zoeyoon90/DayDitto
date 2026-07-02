import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="fixed top-0 left-0 z-50 flex h-13 w-full items-center justify-between px-5">
      {/* 로고 */}
      <Link href="/" className="text-xl font-bold">
        TwoLog
      </Link>

      {/* 메뉴 */}
      <div className="flex gap-6">
        <Link href="/calendar">캘린더</Link>
        <Link href="/create">일기쓰기</Link>
        <Link href="/login">로그인</Link>
      </div>
    </nav>
  );
}
