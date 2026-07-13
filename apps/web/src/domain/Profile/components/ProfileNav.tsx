'use client';

type Tab = 'profile' | 'bookmarks' | 'inquiries' | 'delete';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems: { key: Tab; label: string }[] = [
  { key: 'profile', label: '프로필' },
  { key: 'bookmarks', label: '즐겨찾기' },
  { key: 'inquiries', label: '나의 문의글' },
  { key: 'delete', label: '회원탈퇴' },
];

export default function ProfileNav({ activeTab, onTabChange }: Props) {
  return (
    <nav className="w-36 sm:w-44 shrink-0 border-r-2 border-border min-h-full flex flex-col pt-6">
      {navItems.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          className={`text-left px-4 py-3 text-sm font-base transition-colors hover:bg-main/30 ${
            activeTab === key
              ? 'bg-main text-mtext border-r-2 border-border -mr-0.5'
              : 'text-foreground/70'
          } ${key === 'delete' ? 'mt-auto text-red-500 hover:bg-red-50' : ''}`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
