'use client';

import { usePathname } from '@/i18n/routing';
import { useAdminAuth } from '@/lib/admin-auth';
import { useRouter } from '@/i18n/routing';
import { useEffect } from 'react';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname?.startsWith('/admin/login');

  useEffect(() => {
    if (!loading && !user && !isLogin) {
      router.replace('/admin/login');
    }
  }, [loading, user, isLogin, router]);

  if (isLogin) {
    return <div dir="rtl" lang="ar" className="min-h-screen">{children}</div>;
  }
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }
  if (!user) return null;

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-muted/20 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar />
        <main className="flex-1 p-6 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
