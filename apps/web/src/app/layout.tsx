import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TwoLog",
  description: "나의 하루를 다른 언어로 다시 쓰다, 일기 기반 영어 학습 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
