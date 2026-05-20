import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { AccountClient } from './account-client';
import { L } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: L(locale, { ar: 'لوحة حسابي — لوتس شرم', en: 'My account — Lotus Sharm', de: 'Mein Konto — Lotus Sharm', ru: 'Мой кабинет', it: 'Il mio account' }),
    robots: { index: false, follow: false },
  };
}

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AccountClient locale={locale} />;
}
