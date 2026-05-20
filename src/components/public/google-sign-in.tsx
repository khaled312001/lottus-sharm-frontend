'use client';

import { useLocale } from 'next-intl';
import { L } from '@/lib/utils';
import { API_BASE } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Props {
  /** Where to redirect after sign-in (query param ?next=) — defaults to current page */
  next?: string;
  /** Visual variant — "primary" big gold button, "white" classic Google white pill */
  variant?: 'primary' | 'white';
  /** Optional override label */
  label?: string;
  className?: string;
  /** Optional onClick before redirect */
  onBeforeRedirect?: () => void;
}

/** Premium Google sign-in button. Redirects to backend OAuth start endpoint. */
export function GoogleSignInButton({ next, variant = 'primary', label, className, onBeforeRedirect }: Props) {
  const locale = useLocale();

  const handleClick = () => {
    onBeforeRedirect?.();
    const target = typeof window !== 'undefined'
      ? (next || `${window.location.pathname}${window.location.search}`)
      : (next || '');
    const qs = target ? `?next=${encodeURIComponent(target)}` : '';
    window.location.href = `${API_BASE}/auth/customer/google${qs}`;
  };

  const text = label || (L(locale, {
    ar: 'الدخول باستخدام Google',
    en: 'Continue with Google', de: 'Continue with Google',
    ru: 'Войти через Google',
    it: 'Continua con Google',
  }) as string);

  if (variant === 'white') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'group relative w-full inline-flex items-center justify-center gap-3 h-12 px-5 rounded-xl',
          'bg-white text-gray-800 font-semibold text-base',
          'shadow-lg shadow-primary-900/20 border border-gray-200',
          'hover:shadow-xl hover:-translate-y-0.5 hover:border-accent/40 transition-all duration-200',
          'active:scale-[0.98]',
          className,
        )}
      >
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white">
          <GoogleIcon className="h-5 w-5" />
        </span>
        <span>{text}</span>
        {/* Shimmer sweep */}
        <span aria-hidden className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-xl overflow-hidden">
          <span className="block h-full w-1/3 bg-gradient-to-r from-transparent via-accent/15 to-transparent" />
        </span>
      </button>
    );
  }

  // Primary (gold) variant
  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'group relative w-full inline-flex items-center justify-center gap-3 h-13 px-5 py-3 rounded-xl overflow-hidden',
        'bg-gradient-to-br from-white via-white to-amber-50 text-gray-900 font-bold text-base',
        'shadow-xl shadow-accent/30 hover:shadow-2xl hover:shadow-accent/50 hover:-translate-y-0.5',
        'border border-accent/40 transition-all duration-200 active:scale-[0.98]',
        className,
      )}
    >
      {/* Sliding shimmer */}
      <span aria-hidden className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700">
        <span className="block h-full w-1/2 bg-gradient-to-r from-transparent via-accent/25 to-transparent" />
      </span>
      <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-md ring-1 ring-gray-200">
        <GoogleIcon className="h-5 w-5" />
      </span>
      <span className="relative">{text}</span>
    </button>
  );
}

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC04" d="M5.84 14.11A6.59 6.59 0 0 1 5.48 12c0-.73.13-1.44.36-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.95l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
