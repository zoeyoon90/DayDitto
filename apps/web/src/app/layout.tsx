import type { Metadata, Viewport } from 'next';
import { Do_Hyeon } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';

const doHyeon = Do_Hyeon({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-do-hyeon',
  display: 'swap',
});

const yeongwol = localFont({
  src: '../fonts/YeongwolTTF.woff2',
  variable: '--font-yeongwol',
  display: 'swap',
});

const keriskedu = localFont({
  src: '../fonts/KERISKEDU_Line.woff2',
  variable: '--font-keriskedu',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#e78e23',
};

export const metadata: Metadata = {
  title: 'DayDitto',
  description: '나의 하루를 다른 언어로 다시 쓰다, 일기 기반 영어 학습 서비스',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'DayDitto',
    statusBarStyle: 'default',
  },
  icons: {
    apple: '/Icon/logo_icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${doHyeon.variable} ${yeongwol.variable} ${keriskedu.variable}`}>
      <body className={yeongwol.className}>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
