import Link from 'next/link';
import HomeScreenGuide from './HomeScreenGuide';


export default function Footer() {
  return (
    <footer className="relative bg-main text-foreground fixed bottom-0 left-0 right-0 w-full px-8 py-8">
      <HomeScreenGuide />
      <div className="flex items-center justify-between">
        <span className="font-[family-name:var(--font-do-hyeon)] text-sm">
          © 2026
        </span>
        <span className="font-[family-name:var(--font-yeongwol)] text-xl">
          DayDitto
        </span>
        <div className="flex gap-4 font-[family-name:var(--font-do-hyeon)] text-sm">
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/inquiry" className="hover:underline">
            1:1 문의
          </Link>
        </div>
      </div>
    </footer>
  );
}
