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

const sejongGeulggot = localFont({
  src: '../fonts/SejongGeulggot.woff2',
  variable: '--font-sejong-geulggot',
  display: 'swap',
});

const kyoboHandwriting = localFont({
  src: '../fonts/KyoboHandwriting2025lyb.woff2',
  variable: '--font-kyobo',
  display: 'swap',
});

const lxgwWenKai = localFont({
  src: '../fonts/LXGWWenKaiMonoKR-Medium.woff2',
  variable: '--font-lxgw',
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
    <html lang="ko" className={`${doHyeon.variable} ${yeongwol.variable} ${sejongGeulggot.variable} ${kyoboHandwriting.variable} ${lxgwWenKai.variable}`}>
      <body className={sejongGeulggot.className}>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
