import ProtectedLayoutWrapper from '@/components/layout/ProtectedLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayoutWrapper>{children}</ProtectedLayoutWrapper>;
}
