import NavBar from '@/components/NavBar/NavBar';
import { AuthProvider } from '@/providers/AuthProvider';
import Footer from '@/components/Footer/Footer';

export default function WithHeaderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <NavBar />
      <main className="pt-13 pb-16">{children}</main>
      <Footer />
    </AuthProvider>
  );
}
