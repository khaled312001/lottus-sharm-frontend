import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Toaster } from 'sonner';
import { getLocalizedName, getLocalizedTagline, getSiteSettings } from '@/lib/site-settings';
import { MaintenanceGate } from '@/components/maintenance-gate';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://lottussharm.com';
const ALL_LOCALES = ['ar', 'en', 'ru', 'it'] as const;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const s = await getSiteSettings();
  const brand = getLocalizedName(s, locale);
  const tagline = getLocalizedTagline(s, locale);
  return {
    title: { default: brand, template: `%s | ${brand}` },
    description: tagline,
    alternates: {
      canonical: `${SITE}/${locale}`,
      languages: Object.fromEntries(ALL_LOCALES.map((l) => [l, `${SITE}/${l}`])),
    },
    openGraph: { title: brand, description: tagline, url: `${SITE}/${locale}`, siteName: brand, locale, type: 'website' },
    twitter: { card: 'summary_large_image', title: brand, description: tagline },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as 'ar')) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <NextIntlClientProvider messages={messages}>
      <div dir={dir} lang={locale} className="min-h-screen bg-background">
        <MaintenanceGate>
          {children}
        </MaintenanceGate>
        <Toaster position={locale === 'ar' ? 'top-left' : 'top-right'} richColors />
      </div>
    </NextIntlClientProvider>
  );
}
