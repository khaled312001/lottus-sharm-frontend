import { setRequestLocale } from 'next-intl/server';
import { AdminAuthProvider } from '@/lib/admin-auth';
import { AdminShell } from '@/components/admin/admin-shell';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
