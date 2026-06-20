import type { Metadata } from 'next';
import { getLocalizedName, getLocalizedTagline, getSiteSettings } from '@/lib/site-settings';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://lotussharm.com';
const LOCALES = ['ar', 'en', 'ru', 'it', 'de'] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getSiteSettings();
  const brand = getLocalizedName(settings, locale);
  const tagline = getLocalizedTagline(settings, locale);
  return {
    title: { default: brand, template: `%s | ${brand}` },
    description: tagline,
    alternates: {
      canonical: `${SITE}/${locale}`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE}/${l}`])),
    },
    openGraph: {
      title: brand,
      description: tagline,
      url: `${SITE}/${locale}`,
      siteName: brand,
      locale,
      type: 'website',
    },
  };
}
