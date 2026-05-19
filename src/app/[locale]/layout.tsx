import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Toaster } from 'sonner';
import { getLocalizedName, getLocalizedTagline, getSiteSettings } from '@/lib/site-settings';
import { MaintenanceGate } from '@/components/maintenance-gate';
import { CurrencyProvider } from '@/lib/currency';
import { CustomerAuthProvider } from '@/lib/customer-auth';

// The site is live. The maintenance gate is opt-in via NEXT_PUBLIC_MAINTENANCE=on
// so Google can index real content. Re-enable temporarily by setting the env var.
const MAINTENANCE_FORCED = process.env.NEXT_PUBLIC_MAINTENANCE === 'on';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://lotussharm.com';
const ALL_LOCALES = ['ar', 'en', 'ru', 'it'] as const;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Per-locale SEO-optimized metadata bundles — title, description, and keyword sets
// curated for each language's high-intent travel search terms.
const SEO_META: Record<string, {
  title: string;
  description: string;
  keywords: string[];
}> = {
  ar: {
    title: 'لوتس شرم — رحلات شرم الشيخ، يخت راس محمد، سفاري، فنادق وانتقالات',
    description: 'احجز أفضل رحلات شرم الشيخ مع لوتس شرم: راس محمد بالباص واليخت، دهب والكانيون الملون، سفاري الصحراء، عرض الدولفين، الغواصة، عشاء رومانسي على اليخت. فنادق 3-5 نجوم وانتقالات من المطار. خبرة 13+ سنة. واتساب 01090767278.',
    keywords: [
      'لوتس شرم', 'رحلات شرم الشيخ', 'سياحة شرم الشيخ', 'حجز رحلات شرم',
      'راس محمد', 'يخت شرم الشيخ', 'دهب', 'الكانيون الملون', 'سفاري',
      'بيتش باجي', 'سنوركلينج', 'غوص شرم الشيخ', 'البحر الأحمر',
      'فنادق شرم الشيخ', 'فنادق خليج نعمة', 'فنادق الهضبة',
      'انتقالات مطار شرم', 'استقبال مطار شرم الشيخ',
      'عرض الدولفين', 'الألعاب البحرية', 'الغواصة شرم',
      'عشاء رومانسي يخت', 'رحلات بحرية', 'سياحة سيناء',
      'شرم الشيخ سياحة', 'حجز فندق شرم', 'سفر مصر',
    ],
  },
  en: {
    title: 'Lotus Sharm — Sharm El Sheikh Tours, Ras Mohammed Yacht, Desert Safari, Hotels & Transfers',
    description: 'Book top Sharm El Sheikh tours with Lotus Sharm: Ras Mohammed snorkeling & yacht trips, Dahab & Color Canyon, desert safari, beach buggy, dolphin show, glass-bottom submarine, romantic yacht dinner. 3-5 star hotels and airport transfers. 13+ years experience. WhatsApp +20 109 076 7278.',
    keywords: [
      'Sharm El Sheikh tours', 'Sharm El Sheikh excursions', 'Ras Mohammed snorkeling',
      'Sharm yacht trip', 'Dahab day trip', 'Color Canyon', 'desert safari Sharm',
      'beach buggy Sharm', 'Red Sea diving', 'snorkeling Sharm El Sheikh',
      'dolphin show Sharm', 'glass-bottom submarine', 'romantic yacht dinner Sharm',
      'Sharm hotels', 'Naama Bay hotels', 'Hadaba hotels', 'all-inclusive Sharm',
      'Sharm airport transfer', 'private transfer Sharm', 'Sharm to Cairo flight',
      'Egypt tours', 'South Sinai tourism', 'Sharm holiday packages',
      'Sharm El Sheikh travel agency', 'book Sharm activities',
    ],
  },
  ru: {
    title: 'Lotus Sharm — Экскурсии в Шарм-эль-Шейхе, яхта Рас-Мохаммед, сафари, отели и трансферы',
    description: 'Бронируйте лучшие экскурсии в Шарм-эль-Шейхе с Lotus Sharm: Рас-Мохаммед и Белый остров на яхте, Дахаб и Цветной каньон, сафари в пустыне, багги, шоу дельфинов, подлодка со стеклянным дном, ужин на яхте. Отели 3-5 звёзд и трансферы из аэропорта. 13+ лет опыта. WhatsApp +20 109 076 7278.',
    keywords: [
      'экскурсии Шарм-эль-Шейх', 'туры Шарм-эль-Шейх', 'Рас-Мохаммед',
      'яхта Шарм', 'снорклинг Шарм', 'дайвинг Красное море',
      'Дахаб', 'Цветной каньон', 'сафари в пустыне', 'багги',
      'шоу дельфинов Шарм', 'подводная лодка Шарм', 'ужин на яхте',
      'отели Шарм-эль-Шейх', 'Наама Бэй отели', 'всё включено Шарм',
      'трансфер аэропорт Шарм', 'индивидуальный трансфер',
      'Шарм туры на русском', 'отдых в Египте', 'Синай туры',
    ],
  },
  it: {
    title: 'Lotus Sharm — Tour a Sharm El Sheikh, yacht Ras Mohammed, safari, hotel e trasferimenti',
    description: 'Prenota i migliori tour a Sharm El Sheikh con Lotus Sharm: yacht a Ras Mohammed e Isola Bianca, Dahab e Canyon Colorato, safari nel deserto, beach buggy, spettacolo dei delfini, sottomarino, cena romantica in yacht. Hotel 3-5 stelle e trasferimenti aeroporto. 13+ anni di esperienza. WhatsApp +20 109 076 7278.',
    keywords: [
      'tour Sharm El Sheikh', 'escursioni Sharm El Sheikh', 'Ras Mohammed',
      'yacht Sharm', 'snorkeling Mar Rosso', 'diving Sharm El Sheikh',
      'Dahab', 'Canyon Colorato', 'safari nel deserto', 'beach buggy',
      'spettacolo delfini Sharm', 'sottomarino Sharm', 'cena romantica yacht',
      'hotel Sharm El Sheikh', 'hotel Naama Bay', 'all-inclusive Sharm',
      'trasferimento aeroporto Sharm', 'transfer privato',
      'vacanze Egitto', 'tour Sinai', 'agenzia viaggi Sharm',
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const s = await getSiteSettings();
  const brand = getLocalizedName(s, locale);
  const tagline = getLocalizedTagline(s, locale);
  const ogImage = s.logoUrl || `${SITE}/hero-slides/hero-01.jpg`;

  // Per-locale SEO bundle (fallback to AR if unknown locale)
  const seo = SEO_META[locale] || SEO_META.ar;

  // Build hreflang map (x-default points at AR since the contract is Egypt-first)
  const languages: Record<string, string> = { 'x-default': `${SITE}/ar` };
  for (const l of ALL_LOCALES) languages[l] = `${SITE}/${l}`;

  return {
    metadataBase: new URL(SITE),
    title: { default: seo.title, template: `%s | ${brand}` },
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: `${SITE}/${locale}`, languages },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `${SITE}/${locale}`,
      siteName: brand,
      locale,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: brand }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    },
    other: {
      'geo.region': 'EG-SU',
      'geo.placename': 'Sharm El Sheikh',
      'geo.position': '27.9158;34.3300',
      ICBM: '27.9158, 34.3300',
    },
    // Bridge tagline into description if site settings provide a richer one
    ...(tagline && tagline.length > 30 ? { description: `${seo.description} — ${tagline}`.slice(0, 320) } : {}),
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
      <CustomerAuthProvider>
        <CurrencyProvider locale={locale}>
          <div dir={dir} lang={locale} className="min-h-screen bg-background">
            {MAINTENANCE_FORCED ? <MaintenanceGate>{children}</MaintenanceGate> : children}
            <Toaster position={locale === 'ar' ? 'top-left' : 'top-right'} richColors />
          </div>
        </CurrencyProvider>
      </CustomerAuthProvider>
    </NextIntlClientProvider>
  );
}
