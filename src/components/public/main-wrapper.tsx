'use client';

import { usePathname } from '@/i18n/routing';

/**
 * Wraps non-home pages to add top padding equal to header height so content
 * never hides behind the fixed header. Home page provides its own hero offset.
 */
export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  return (
    <main className={isHome ? 'flex-1' : 'flex-1 pt-16 md:pt-[116px]'}>
      {children}
    </main>
  );
}
