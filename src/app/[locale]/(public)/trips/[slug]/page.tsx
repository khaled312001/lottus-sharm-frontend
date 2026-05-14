import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Clock, MapPin, Calendar, Check, X, Backpack } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TripGallery } from '@/components/public/trip-gallery';
import { BookingWidget } from '@/components/public/booking-widget';
import { api } from '@/lib/api';
import type { TripDTO } from '@/types/api';
import { localeToApiCode } from '@/lib/utils';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

async function fetchTrip(slug: string, locale: string): Promise<TripDTO | null> {
  try {
    return await api.get<TripDTO>(`/public/trips/${slug}?locale=${localeToApiCode(locale)}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const trip = await fetchTrip(slug, locale);
  if (!trip) return { title: 'Trip not found' };
  const tr = trip.tr;
  return {
    title: tr?.metaTitle || tr?.title || 'Trip',
    description: tr?.metaDesc || tr?.shortDesc,
    openGraph: {
      title: tr?.title,
      description: tr?.shortDesc,
      images: trip.heroImage?.url ? [trip.heroImage.url] : [],
    },
    alternates: {
      canonical: `/${locale}/trips/${slug}`,
      languages: {
        ar: `/ar/trips/${slug}`,
        en: `/en/trips/${slug}`,
        ru: `/ru/trips/${slug}`,
        it: `/it/trips/${slug}`,
      },
    },
  };
}

export default async function TripDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const trip = await fetchTrip(slug, locale);
  if (!trip) notFound();
  const t = await getTranslations({ locale });
  const tr = trip.tr;

  const includes = trip.bullets.filter((b) => b.type === 'INCLUDE');
  const excludes = trip.bullets.filter((b) => b.type === 'EXCLUDE');
  const brings = trip.bullets.filter((b) => b.type === 'BRING');
  const galleryMedia = [trip.heroImage, ...trip.gallery.map((g) => g.media)].filter(Boolean) as NonNullable<TripDTO['heroImage']>[];

  const getText = (translations: { locale: string; text: string }[]) =>
    translations.find((x) => x.locale === localeToApiCode(locale))?.text ||
    translations.find((x) => x.locale === 'EN')?.text ||
    translations[0]?.text ||
    '';

  return (
    <article>
      {/* Header */}
      <section className="container py-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <span>{t('nav.home')}</span> / <span>{t('nav.trips')}</span> / <span className="text-foreground">{tr?.title}</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <Badge className="mb-2">{t(`trips.category.${trip.category}`)}</Badge>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{tr?.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {Math.floor(trip.durationMinutes / 60)} {t('common.hours')}
              </span>
              {trip.startTime && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> {t('common.starts')} {trip.startTime} · {t('common.daily')}
                </span>
              )}
              {trip.meetingPoint && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {trip.meetingPoint}
                </span>
              )}
            </div>
          </div>
        </div>
        <TripGallery images={galleryMedia} title={tr?.title || ''} />
      </section>

      {/* Body */}
      <section className="container py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <div>
            <h2 className="text-2xl font-bold mb-4">{locale === 'ar' ? 'نظرة عامة' : 'Overview'}</h2>
            <div className="prose max-w-none rtl:prose-rtl text-foreground" dangerouslySetInnerHTML={{ __html: tr?.longDesc || '' }} />
          </div>

          {/* Highlights */}
          {trip.highlights.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">{t('trips.highlights')}</h2>
              <ol className="space-y-3">
                {trip.highlights.map((h, i) => (
                  <li key={h.id} className="flex items-start gap-3 p-4 rounded-xl bg-muted/30">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="pt-1">{getText(h.translations)}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Includes / Excludes */}
          <div className="grid md:grid-cols-2 gap-6">
            {includes.length > 0 && (
              <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2"><Check className="h-5 w-5" /> {t('trips.includes')}</h3>
                <ul className="space-y-2 text-sm">
                  {includes.map((b) => (
                    <li key={b.id} className="flex items-start gap-2"><Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" /> {getText(b.translations)}</li>
                  ))}
                </ul>
              </div>
            )}
            {excludes.length > 0 && (
              <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2"><X className="h-5 w-5" /> {t('trips.excludes')}</h3>
                <ul className="space-y-2 text-sm">
                  {excludes.map((b) => (
                    <li key={b.id} className="flex items-start gap-2"><X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" /> {getText(b.translations)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* What to bring */}
          {brings.length > 0 && (
            <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
              <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2"><Backpack className="h-5 w-5" /> {t('trips.whatToBring')}</h3>
              <div className="flex flex-wrap gap-2">
                {brings.map((b) => (
                  <span key={b.id} className="px-3 py-1.5 rounded-full bg-white border border-amber-200 text-sm">
                    {getText(b.translations)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="lg:col-span-1">
          <BookingWidget trip={trip} />
        </aside>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'TouristTrip',
            name: tr?.title,
            description: tr?.shortDesc,
            image: trip.heroImage?.url,
            offers: {
              '@type': 'Offer',
              price: Number(trip.priceForeignUSD),
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
            },
            duration: `PT${trip.durationMinutes}M`,
          }),
        }}
      />
    </article>
  );
}
