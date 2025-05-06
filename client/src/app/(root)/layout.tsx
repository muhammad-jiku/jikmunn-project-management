import ProtectedLayoutWrapper from '@/components/layout/ProtectedLayout';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayoutWrapper>{children}</ProtectedLayoutWrapper>;
}
