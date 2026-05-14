import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: 'EGP' | 'USD' = 'EGP', locale = 'ar-EG'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string, locale = 'ar-EG'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'long', year: 'numeric' }).format(d);
}

export function buildWhatsAppLink(phone = '201090767278', message = ''): string {
  const enc = encodeURIComponent(message);
  return `https://wa.me/${phone}${enc ? `?text=${enc}` : ''}`;
}

export function localeToBcp47(locale: string): string {
  const map: Record<string, string> = { ar: 'ar-EG', en: 'en-US', ru: 'ru-RU', it: 'it-IT' };
  return map[locale] || 'en-US';
}

export function localeToApiCode(locale: string): 'AR' | 'EN' | 'RU' | 'IT' {
  const upper = locale.toUpperCase();
  return (['AR', 'EN', 'RU', 'IT'] as const).includes(upper as 'AR') ? (upper as 'AR') : 'AR';
}
