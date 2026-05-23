// SEO helpers — per-locale metadata builders + JSON-LD structured-data
// builders aimed at maximising visibility for Sharm El Sheikh tourism queries
// across ar/en/ru/it/de.

import type { Metadata } from 'next';
import type { SiteSettingsDTO } from '@/types/api';
import { getLocalizedName } from './site-settings';

export const LOCALES = ['ar', 'en', 'ru', 'it', 'de'] as const;
export const DEFAULT_LOCALE = 'ar';
export type Locale = (typeof LOCALES)[number];

export const SITE_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL) ||
  'https://lotussharm.com';

// OpenGraph locale codes
const OG_LOCALES: Record<string, string> = {
  ar: 'ar_EG',
  en: 'en_US',
  ru: 'ru_RU',
  it: 'it_IT',
  de: 'de_DE',
};

// hreflang alternates for a given path (path begins with /).
export function altsFor(path: string): Record<string, string> {
  const m: Record<string, string> = {};
  for (const l of LOCALES) m[l] = `${SITE_URL}/${l}${path}`;
  m['x-default'] = `${SITE_URL}/${DEFAULT_LOCALE}${path}`;
  return m;
}

interface LocalizedText { ar: string; en: string; ru: string; it: string; de: string }
const pick = (o: LocalizedText, l: string) => (o as unknown as Record<string, string>)[l] || o.en;

// Build a complete Next.js Metadata object for a public page.
// `path` is the locale-less route (e.g. '/trips', '/hotels'). The home is ''.
export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  image,
  keywords,
}: {
  locale: string;
  path: string;
  title: LocalizedText;
  description: LocalizedText;
  image?: string;
  keywords?: LocalizedText;
}): Metadata {
  const url = `${SITE_URL}/${locale}${path}`;
  const t = pick(title, locale);
  const d = pick(description, locale);
  const ogImage = image || `${SITE_URL}/hero-slides/hero-01.jpg`;
  return {
    // `absolute` bypasses the root-layout title.template so we don't get a
    // double brand suffix ("…| Lotus Sharm | Lotus Sharm Tourism").
    title: { absolute: t },
    description: d,
    keywords: keywords ? pick(keywords, locale) : undefined,
    alternates: { canonical: url, languages: altsFor(path) },
    openGraph: {
      type: 'website',
      url,
      title: t,
      description: d,
      siteName: 'Lotus Sharm Tourism',
      locale: OG_LOCALES[locale] || 'en_US',
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALES[l]),
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t,
      description: d,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

// =============================================================================
// JSON-LD builders
// =============================================================================

/** TravelAgency / Organization for the whole site (use on home). */
export function buildTravelAgencyLd(s: SiteSettingsDTO, locale: string) {
  const name = getLocalizedName(s, locale);
  const sameAs = [s.facebookUrl, s.instagramUrl, s.tiktokUrl, s.youtubeUrl].filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${SITE_URL}/#organization`,
    name,
    alternateName: ['Lotus Sharm Tourism', 'لوتس شرم للسياحة', 'Lotus Sharm'],
    url: `${SITE_URL}/${locale}`,
    logo: s.logoUrl || `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/hero-slides/hero-01.jpg`,
    description: pick(
      {
        ar: 'لوتس شرم للسياحة — رحلات يومية في شرم الشيخ، سفاري، رحلات بحرية، حجز فنادق، خدمات نقل واستقبال المطار. خبرة 13 سنة في تنظيم أرقى الرحلات السياحية في شرم الشيخ ومصر.',
        en: 'Lotus Sharm Tourism — daily Sharm El Sheikh excursions, desert safaris, sea trips, hotel bookings and airport transfers. 13+ years organising premium tours across Sharm and Egypt.',
        ru: 'Lotus Sharm Tourism — ежедневные экскурсии в Шарм-эль-Шейхе, сафари в пустыне, морские прогулки, бронирование отелей и трансферы. 13+ лет опыта.',
        it: 'Lotus Sharm Tourism — escursioni giornaliere a Sharm El Sheikh, safari nel deserto, gite in mare, prenotazioni hotel e transfer aeroportuali. 13+ anni di esperienza.',
        de: 'Lotus Sharm Tourism — tägliche Ausflüge in Sharm El Sheikh, Wüstensafaris, Bootstouren, Hotelbuchungen und Flughafentransfers. 13+ Jahre Erfahrung.',
      },
      locale,
    ),
    foundingDate: `${new Date().getFullYear() - (s.yearsExperience || 13)}`,
    areaServed: [
      { '@type': 'City', name: 'Sharm El Sheikh' },
      { '@type': 'City', name: 'Dahab' },
      { '@type': 'City', name: 'Cairo' },
      { '@type': 'City', name: 'Hurghada' },
      { '@type': 'Country', name: 'Egypt' },
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Sharm El Sheikh',
      addressRegion: 'South Sinai',
      addressCountry: 'EG',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 27.9158, longitude: 34.3300 },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: `+2${s.phone}`,
        contactType: 'customer service',
        areaServed: ['EG', 'Worldwide'],
        availableLanguage: ['Arabic', 'English', 'Russian', 'Italian', 'German'],
      },
    ],
    email: s.email || undefined,
    telephone: `+2${s.phone}`,
    sameAs,
  };
}

/** WebSite with SearchAction — enables sitelinks search box. */
export function buildWebsiteLd(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'Lotus Sharm Tourism',
    url: `${SITE_URL}/${locale}`,
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/${locale}/trips?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Breadcrumb list. Items are passed in order (Home → … → current). */
export function buildBreadcrumbLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** FAQ list — high SERP-feature value for travel queries. */
export function buildFaqLd(items: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/** AggregateRating — attach to Organization or product. */
export function buildAggregateRating(ratingValue: number, reviewCount: number) {
  return {
    '@type': 'AggregateRating',
    ratingValue: ratingValue.toFixed(1),
    reviewCount: Math.max(1, reviewCount),
    bestRating: 5,
    worstRating: 1,
  };
}

/** ItemList for listing pages (trips, hotels, transfers). */
export function buildItemListLd(items: Array<{ name: string; url: string; image?: string | null }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: it.url,
      ...(it.image ? { image: it.image } : {}),
    })),
  };
}

/** Localised breadcrumb labels. */
export const CRUMB_LABELS = {
  home: { ar: 'الرئيسية', en: 'Home', ru: 'Главная', it: 'Home', de: 'Startseite' },
  trips: { ar: 'الرحلات', en: 'Tours', ru: 'Экскурсии', it: 'Tour', de: 'Touren' },
  hotels: { ar: 'الفنادق', en: 'Hotels', ru: 'Отели', it: 'Hotel', de: 'Hotels' },
  transfers: { ar: 'النقل', en: 'Transfers', ru: 'Трансферы', it: 'Transfer', de: 'Transfers' },
  gallery: { ar: 'المعرض', en: 'Gallery', ru: 'Галерея', it: 'Galleria', de: 'Galerie' },
  about: { ar: 'من نحن', en: 'About', ru: 'О нас', it: 'Chi siamo', de: 'Über uns' },
  contact: { ar: 'تواصل', en: 'Contact', ru: 'Контакты', it: 'Contatti', de: 'Kontakt' },
  blog: { ar: 'المدونة', en: 'Blog', ru: 'Блог', it: 'Blog', de: 'Blog' },
  reviews: { ar: 'التقييمات', en: 'Reviews', ru: 'Отзывы', it: 'Recensioni', de: 'Bewertungen' },
} as const;

export function crumbLabel(key: keyof typeof CRUMB_LABELS, locale: string): string {
  return (CRUMB_LABELS[key] as Record<string, string>)[locale] || CRUMB_LABELS[key].en;
}
