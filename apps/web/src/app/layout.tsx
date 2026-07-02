import type { Metadata } from 'next';
import './globals.css';
import NavBar from '@/components/NavBar/NavBar';

export const metadata: Metadata = {
  title: 'TwoLog',
  description: '나의 하루를 다른 언어로 다시 쓰다, 일기 기반 영어 학습 서비스',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <NavBar />
          <main className="pt-13">{children}</main>
      </body>
    </html>
  );
}
