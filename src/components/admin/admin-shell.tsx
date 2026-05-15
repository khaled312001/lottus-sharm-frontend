'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { useAdminAuth } from '@/lib/admin-auth';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';
import { AnimatePresence, motion } from 'framer-motion';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname?.startsWith('/admin/login');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);
  useEffect(() => {
    if (drawerOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);
  useEffect(() => {
    if (!loading && !user && !isLogin) router.replace('/admin/login');
  }, [loading, user, isLogin, router]);

  if (isLogin) return <div dir="rtl" lang="ar" className="min-h-screen">{children}</div>;
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-muted/20">جاري التحميل...</div>;
  if (!user) return null;

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-muted/20">
      <aside className="hidden lg:block fixed inset-y-0 end-0 w-64 bg-white border-s z-30 overflow-y-auto">
        <AdminSidebar />
      </aside>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
              className="lg:hidden fixed inset-y-0 end-0 w-72 max-w-[85vw] bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <AdminSidebar onItemClick={() => setDrawerOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:me-64 flex flex-col min-h-screen">
        <AdminTopbar onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
