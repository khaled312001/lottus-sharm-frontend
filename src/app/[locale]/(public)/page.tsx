import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { TripCard } from '@/components/public/trip-card';
import { api } from '@/lib/api';
import type { TripDTO } from '@/types/api';
import { Award, Shield, Tag, Clock, ArrowRight, MapPin } from 'lucide-react';
import { localeToApiCode } from '@/lib/utils';
import { getLocalizedTagline, getSiteSettings } from '@/lib/site-settings';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const settings = await getSiteSettings();
  const tagline = getLocalizedTagline(settings, locale);

  let trips: TripDTO[] = [];
  try {
    const res = await api.get<{ items: TripDTO[] }>(
      `/public/trips?locale=${localeToApiCode(locale)}&featured=true&pageSize=6`,
    );
    trips = res.items;
  } catch {
    trips = [];
  }

  const features = [
    { icon: Award, key: 'whyUsExperience' as const },
    { icon: Shield, key: 'whyUsSafety' as const },
    { icon: Tag, key: 'whyUsBestPrice' as const },
    { icon: Clock, key: 'whyUsSupport' as const },
  ];

  const hero = trips[0]?.heroImage?.url || trips[0]?.gallery[0]?.media?.url;

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[85vh] overflow-hidden flex items-center text-white">
        {hero ? (
          <Image src={hero} alt="" fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 gradient-sea" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="container relative z-10 py-20">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/90 text-white text-sm font-semibold mb-6">
              {t('home.whyUsExperience')} · {settings.yearsExperience}+ {locale === 'ar' ? 'سنة' : 'years'}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight text-balance drop-shadow-lg">
              {t('home.heroTitle')}
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-95 max-w-2xl">{tagline}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="xl" variant="accent">
                <Link href="/trips">
                  {t('home.ctaPrimary')} <ArrowRight className="h-5 w-5 rtl:rotate-180" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="white">
                <Link href="/contact">{t('home.ctaSecondary')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">{t('home.whyUs')}</h2>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.key}
                className="text-center p-6 rounded-2xl bg-muted/30 hover:bg-primary/5 transition-colors border"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-sea flex items-center justify-center text-white">
                  <f.icon className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t(`home.${f.key}`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`home.${f.key}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED TRIPS */}
      <section className="py-16 bg-muted/20">
        <div className="container">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-2">{t('home.featuredTrips')}</h2>
              <p className="text-muted-foreground">{t('home.featuredTripsDesc')}</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/trips">{t('common.viewAll')} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link>
            </Button>
          </div>

          {trips.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">{t('trips.noTrips')}</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 gradient-sea text-white">
        <div className="container text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            {locale === 'ar' ? 'جاهز لمغامرتك القادمة؟' : 'Ready for your next adventure?'}
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            {locale === 'ar'
              ? 'احجز رحلتك الآن واستمتع بتجربة لا تُنسى في شرم الشيخ'
              : 'Book now and enjoy an unforgettable Sharm El Sheikh experience'}
          </p>
          <Button asChild size="xl" variant="white">
            <Link href="/trips">{t('common.bookNow')}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
