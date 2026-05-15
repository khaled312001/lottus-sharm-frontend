import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Suspense } from 'react';
import { TripCard } from '@/components/public/trip-card';
import { Reveal } from '@/components/public/motion';
import { api } from '@/lib/api';
import type { TripDTO } from '@/types/api';
import { localeToApiCode } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { Compass, Sparkles, Calendar, MessageCircle } from 'lucide-react';
import { buildWhatsAppLink } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
}

const CATEGORIES = ['SEA', 'DESERT', 'CITY', 'DIVING', 'EVENTS', 'SAFARI'] as const;
const CATEGORY_ICONS: Record<string, string> = { SEA: '🌊', DESERT: '🏜️', CITY: '🏛️', DIVING: '🤿', EVENTS: '🎉', SAFARI: '🐪' };

export default async function TripsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const isAr = locale === 'ar';

  const cat = sp.category as (typeof CATEGORIES)[number] | undefined;
  const page = Number(sp.page || 1);

  let trips: { items: TripDTO[]; total: number; totalPages: number } = { items: [], total: 0, totalPages: 0 };
  let allTrips: { items: TripDTO[] } = { items: [] };
  try {
    const qs = new URLSearchParams({ locale: localeToApiCode(locale), page: String(page), pageSize: '12' });
    if (cat) qs.set('category', cat);
    trips = await api.get(`/public/trips?${qs}`);
    // Get all (for counts)
    allTrips = await api.get(`/public/trips?locale=${localeToApiCode(locale)}&pageSize=100`);
  } catch {
    /* ignore */
  }

  const counts: Record<string, number> = {};
  allTrips.items.forEach((tt) => { counts[tt.category] = (counts[tt.category] || 0) + 1; });

  return (
    <>
      {/* HERO */}
      <section className="relative bg-primary-900 text-cream py-20 md:py-28 overflow-hidden">
        <Image src="/hero-slides/hero-03.jpg" alt="" fill className="object-cover opacity-30" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 via-primary-900/70 to-primary-900" />
        <div className="absolute top-1/4 -end-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="container relative">
          <Reveal>
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-4">{isAr ? 'استكشف الرحلات' : 'Explore trips'}</div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 max-w-3xl leading-[1.1]">{t('trips.title')}</h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl">{t('trips.subtitle')}</p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5 text-accent"><Sparkles className="h-4 w-4" /> {allTrips.items.length}+ {isAr ? 'رحلة' : 'experiences'}</span>
              <span className="inline-flex items-center gap-1.5 text-cream/70"><Compass className="h-4 w-4" /> {isAr ? 'كل فئات السياحة' : 'All tourism categories'}</span>
              <span className="inline-flex items-center gap-1.5 text-cream/70"><Calendar className="h-4 w-4" /> {isAr ? 'يومياً' : 'Daily departures'}</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FILTERS */}
      <section className="sticky top-[88px] md:top-[116px] z-30 bg-cream border-b border-accent/15">
        <div className="container py-4">
          <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 no-scrollbar">
            <Link href={{ pathname: '/trips' }} className={cn(
              'shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition-all whitespace-nowrap',
              !cat ? 'bg-primary text-cream border-primary shadow-md' : 'bg-white border-accent/20 hover:border-accent text-primary',
            )}>
              {t('trips.all')} <span className="opacity-60 ms-1">({allTrips.items.length})</span>
            </Link>
            {CATEGORIES.map((c) => (
              <Link key={c} href={{ pathname: '/trips', query: { category: c } }} className={cn(
                'shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition-all whitespace-nowrap inline-flex items-center gap-1.5',
                cat === c ? 'bg-primary text-cream border-primary shadow-md' : 'bg-white border-accent/20 hover:border-accent text-primary',
              )}>
                <span>{CATEGORY_ICONS[c]}</span>
                {t(`trips.category.${c}`)}
                {counts[c] ? <span className="opacity-60">({counts[c]})</span> : null}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="container py-10 md:py-14">
        {trips.items.length === 0 ? (
          <Reveal className="text-center py-20">
            <Compass className="h-12 w-12 text-accent mx-auto mb-4 opacity-50" />
            <p className="font-serif text-2xl text-primary mb-2">{t('trips.noTrips')}</p>
            <p className="text-muted-foreground">{isAr ? 'جرب تغيير الفئة أو تواصل معنا لرحلة مخصصة' : 'Try another category or contact us for a custom trip'}</p>
          </Reveal>
        ) : (
          <Suspense>
            <Reveal className="mb-6 flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm text-muted-foreground">
                {isAr ? `عرض ${trips.items.length} من ${trips.total} رحلة` : `Showing ${trips.items.length} of ${trips.total} trips`}
                {cat && <span className="ms-2 text-accent font-semibold">· {t(`trips.category.${cat}`)}</span>}
              </p>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {trips.items.map((trip, i) => (
                <TripCard key={trip.id} trip={trip} locale={locale} index={i} />
              ))}
            </div>

            {trips.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: trips.totalPages }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <Link key={p} href={{ pathname: '/trips', query: { ...(cat ? { category: cat } : {}), page: String(p) } }}
                      className={cn(
                        'min-w-10 h-10 px-3 rounded-md font-semibold inline-flex items-center justify-center border',
                        p === page ? 'bg-primary text-cream border-primary' : 'hover:bg-muted border-accent/20',
                      )}>
                      {p}
                    </Link>
                  );
                })}
              </div>
            )}
          </Suspense>
        )}
      </section>

      {/* CUSTOM TRIP CTA */}
      <section className="py-16 bg-gradient-to-b from-cream to-muted/30">
        <div className="container">
          <Reveal>
            <div className="relative max-w-4xl mx-auto rounded-2xl bg-primary text-cream p-8 md:p-12 text-center overflow-hidden">
              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/15 blur-3xl" />
              <Sparkles className="h-10 w-10 text-accent mx-auto mb-4" />
              <h3 className="font-serif text-2xl md:text-3xl font-bold mb-3">
                {isAr ? 'مش لاقي اللي بتدور عليه؟' : "Can't find what you're looking for?"}
              </h3>
              <p className="opacity-85 mb-6 max-w-xl mx-auto">
                {isAr ? 'كلمنا على واتساب ونصمم لك رحلة مخصصة 100% حسب اهتمامك وميزانيتك' : 'WhatsApp us — we\'ll design a 100% custom trip for your interests and budget'}
              </p>
              <a href={buildWhatsAppLink('201090767278') + '&text=' + encodeURIComponent(isAr ? 'مرحبا، أريد تصميم رحلة مخصصة' : 'Hi! I\'d like a custom trip design.')}
                target="_blank" rel="noopener"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ea954] text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-[#25D366]/30">
                <MessageCircle className="h-5 w-5" /> {isAr ? 'تواصل واتساب' : 'WhatsApp us'}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
