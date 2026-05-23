'use client';

import { useEffect, useState } from 'react';
import { Sparkles, X, Copy, Check } from 'lucide-react';
import { L } from '@/lib/utils';
import { useLocale } from 'next-intl';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ActiveCoupon {
  id: number;
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  validUntil: string;
  minBookingAmount?: number;
}

const DISMISS_KEY = '__lotus_discount_dismissed__';

export function GlobalDiscountBanner() {
  const [coupon, setCoupon] = useState<ActiveCoupon | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem(DISMISS_KEY)) {
      setDismissed(true);
      return;
    }
    api.get<ActiveCoupon | null>('/public/coupons/active')
      .then((c) => setCoupon(c))
      .catch(() => setCoupon(null));
  }, []);

  if (!coupon || dismissed) return null;

  const discountText =
    coupon.discountType === 'PERCENT'
      ? L(locale, {
          ar: `خصم ${coupon.discountValue}%`,
          en: `${coupon.discountValue}% off`,
          de: `${coupon.discountValue}% Rabatt`,
          ru: `Скидка ${coupon.discountValue}%`,
          it: `Sconto ${coupon.discountValue}%`,
        })
      : L(locale, {
          ar: `خصم ${coupon.discountValue} ج.م`,
          en: `${coupon.discountValue} EGP off`,
          de: `${coupon.discountValue} EGP Rabatt`,
          ru: `Скидка ${coupon.discountValue} EGP`,
          it: `Sconto ${coupon.discountValue} EGP`,
        });

  const expires = new Date(coupon.validUntil).toLocaleDateString(locale === 'ar' ? 'ar-EG' : locale, {
    day: 'numeric', month: 'short',
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      toast.success(L(locale, { ar: 'تم نسخ الكود', en: 'Code copied', de: 'Code kopiert', ru: 'Код скопирован', it: 'Codice copiato' }) as string);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const dismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') sessionStorage.setItem(DISMISS_KEY, '1');
  };

  return (
    <div className="relative bg-gradient-to-r from-accent-700 via-accent to-accent-700 text-primary py-2 px-3 text-xs sm:text-sm font-bold shadow-md overflow-hidden">
      {/* Shimmer animation */}
      <div aria-hidden className="absolute inset-0 -translate-x-full animate-[shimmer_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="container relative flex flex-wrap items-center justify-center gap-2 sm:gap-4">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="font-extrabold uppercase tracking-wider">{discountText}</span>
          <span className="opacity-75 hidden sm:inline">·</span>
        </span>
        <span className="hidden sm:inline opacity-90">
          {L(locale, {
            ar: 'على جميع الحجوزات — يطبّق تلقائياً عند الدفع',
            en: 'on all bookings — auto-applied at checkout',
            de: 'auf alle Buchungen — automatisch bei der Zahlung',
            ru: 'на все бронирования — применяется автоматически',
            it: 'su tutte le prenotazioni — applicato automaticamente',
          })}
        </span>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/15 hover:bg-primary/25 transition-colors font-mono font-extrabold"
          title={L(locale, { ar: 'نسخ الكود', en: 'Copy code', de: 'Code kopieren', ru: 'Копировать', it: 'Copia codice' }) as string}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {coupon.code}
        </button>
        <span className="text-[10px] sm:text-xs opacity-75 hidden md:inline">
          · {L(locale, { ar: 'ينتهي', en: 'ends', de: 'endet', ru: 'до', it: 'fino al' })} {expires}
        </span>
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute end-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-primary/20"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
