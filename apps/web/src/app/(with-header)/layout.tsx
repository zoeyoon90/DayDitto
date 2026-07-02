import NavBar from '@/components/NavBar/NavBar';

export default function WithHeaderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <NavBar />
      <main className="pt-13">{children}</main>
    </>
  );
}
