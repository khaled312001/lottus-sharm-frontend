import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { LoginClient } from './login-client';
import { L } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: L(locale, { ar: 'تسجيل الدخول — لوتس شرم', en: 'Sign in — Lotus Sharm', de: 'Sign in — Lotus Sharm', ru: 'Вход — Lotus Sharm', it: 'Accedi — Lotus Sharm' }),
    robots: { index: false, follow: true },
  };
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LoginClient locale={locale} />;
}
