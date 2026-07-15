'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminSignOut } from '@/lib/auth';

const navItems = [
  { href: '/users', label: '유저 목록' },
  { href: '/inquiries', label: '1:1 문의' },
  { href: '/stats', label: '통계' },
  { href: '/notices', label: '공지알람' },
  { href: '/push-notifications', label: '푸시 알림' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-[#1e293b] flex flex-col">
      <div className="px-6 py-5 border-b border-[#334155]">
        <span className="text-white font-bold text-lg">DayDitto Admin</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-[#94a3b8] hover:bg-[#334155] hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-[#334155]">
        <form action={adminSignOut}>
          <button
            type="submit"
            className="w-full px-3 py-2 text-sm text-[#94a3b8] hover:text-white hover:bg-[#334155] rounded-md text-left transition-colors"
          >
            로그아웃
          </button>
        </form>
      </div>
    </aside>
  );
}
