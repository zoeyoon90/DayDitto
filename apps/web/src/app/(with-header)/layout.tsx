'use client';

import NavBar from '@/components/NavBar/NavBar';
import { AuthProvider } from '@/providers/AuthProvider';
import Footer from '@/components/Footer/Footer';
import { isTossWebView } from '@/lib/toss';
import { useState, useEffect } from 'react';

export default function WithHeaderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [isToss, setIsToss] = useState(false);

  useEffect(() => {
    setIsToss(isTossWebView());
  }, []);

  return (
    <AuthProvider>
      {!isToss && <NavBar />}
      <main className={isToss ? '' : 'pt-13 pb-16'}>{children}</main>
      {!isToss && <Footer />}
    </AuthProvider>
  );
}
