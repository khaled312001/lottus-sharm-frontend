'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { UserRound, LogIn } from 'lucide-react';
import { useCustomer } from '@/lib/customer-auth';
import { L, cn } from '@/lib/utils';

/**
 * Header pill — shows "Sign in" when signed out, avatar + initial when in.
 * Click goes to /account or /login respectively.
 */
export function AccountPill() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const { customer, loading } = useCustomer();

  if (loading) {
    return <div className="hidden sm:block w-10 h-10 rounded-full bg-cream/10 animate-pulse" />;
  }

  if (!customer) {
    return (
      <Link
        href={'/login' as never}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-2 text-sm font-semibold transition-all border',
          'text-cream hover:text-accent border-cream/20 hover:border-accent/60 bg-cream/5 hover:bg-cream/10',
        )}
        aria-label={isAr ? 'تسجيل الدخول' : 'Sign in'}
      >
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">
          {L(locale, { ar: 'الدخول', en: 'Sign in', ru: 'Вход', it: 'Accedi' })}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={'/account' as never}
      className="group inline-flex items-center gap-2 rounded-full pe-2 ps-1 py-1 transition-all border border-cream/20 hover:border-accent/60 bg-cream/5 hover:bg-cream/10"
      aria-label={isAr ? 'حسابي' : 'My account'}
    >
      {customer.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={customer.avatarUrl} alt="" className="w-7 h-7 rounded-full" />
      ) : (
        <span className="w-7 h-7 rounded-full bg-accent text-primary inline-flex items-center justify-center font-bold text-xs">
          {customer.name.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="hidden md:inline text-xs font-semibold text-cream/90 max-w-[100px] truncate">
        {customer.name.split(' ')[0]}
      </span>
      <UserRound className="md:hidden h-3.5 w-3.5 text-cream/80" />
    </Link>
  );
}
