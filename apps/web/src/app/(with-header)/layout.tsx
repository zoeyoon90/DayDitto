import NavBar from '@/components/NavBar/NavBar';
import { AuthProvider } from '@/providers/AuthProvider';

export default function WithHeaderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <NavBar />
      <main className="pt-13">{children}</main>
    </AuthProvider>
  );
}
