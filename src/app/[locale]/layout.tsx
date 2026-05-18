import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Toaster } from 'sonner';
import { getLocalizedName, getLocalizedTagline, getSiteSettings } from '@/lib/site-settings';
import { MaintenanceGate } from '@/components/maintenance-gate';
import { CurrencyProvider } from '@/lib/currency';

// The site is live. The maintenance gate is opt-in via NEXT_PUBLIC_MAINTENANCE=on
// so Google can index real content. Re-enable temporarily by setting the env var.
const MAINTENANCE_FORCED = process.env.NEXT_PUBLIC_MAINTENANCE === 'on';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://lotussharm.com';
const ALL_LOCALES = ['ar', 'en', 'ru', 'it'] as const;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const s = await getSiteSettings();
  const brand = getLocalizedName(s, locale);
  const tagline = getLocalizedTagline(s, locale);
  const ogImage = s.logoUrl || `${SITE}/hero-slides/hero-01.jpg`;

  // Build hreflang map (x-default points at AR since the contract is Egypt-first)
  const languages: Record<string, string> = { 'x-default': `${SITE}/ar` };
  for (const l of ALL_LOCALES) languages[l] = `${SITE}/${l}`;

  return {
    metadataBase: new URL(SITE),
    title: { default: brand, template: `%s | ${brand}` },
    description: tagline,
    keywords: ['Sharm El Sheikh', 'شرم الشيخ', 'tourism', 'سياحة', 'desert safari', 'Ras Mohammed', 'snorkeling', 'diving', 'tours'],
    alternates: {
      canonical: `${SITE}/${locale}`,
      languages,
    },
    openGraph: {
      title: brand,
      description: tagline,
      url: `${SITE}/${locale}`,
      siteName: brand,
      locale,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: brand }],
    },
    twitter: {
      card: 'summary_large_image',
      title: brand,
      description: tagline,
      images: [ogImage],
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
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
      <CurrencyProvider locale={locale}>
        <div dir={dir} lang={locale} className="min-h-screen bg-background">
          {MAINTENANCE_FORCED ? <MaintenanceGate>{children}</MaintenanceGate> : children}
          <Toaster position={locale === 'ar' ? 'top-left' : 'top-right'} richColors />
        </div>
      </CurrencyProvider>
    </NextIntlClientProvider>
  );
}
