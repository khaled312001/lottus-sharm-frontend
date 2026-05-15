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
import { Compass, Sparkles, Calendar, MessageCircle, Waves, Mountain, Building2, Anchor, PartyPopper } from 'lucide-react';
import { buildWhatsAppLink } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
}

const CATEGORIES = ['SEA', 'DESERT', 'CITY', 'DIVING', 'EVENTS', 'SAFARI'] as const;
const CATEGORY_ICON = {
  SEA: Waves,
  DESERT: Mountain,
  CITY: Building2,
  DIVING: Anchor,
  EVENTS: PartyPopper,
  SAFARI: Compass,
} as const;

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
    // Get all (for counts) — backend caps pageSize at 50
    allTrips = await api.get(`/public/trips?locale=${localeToApiCode(locale)}&pageSize=50`);
  } catch {
    /* ignore */
  }

  const counts: Record<string, number> = {};
  allTrips.items.forEach((tt) => { counts[tt.category] = (counts[tt.category] || 0) + 1; });
  const totalCount = allTrips.items.length;

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
              <span className="inline-flex items-center gap-1.5 text-accent"><Sparkles className="h-4 w-4" /> {totalCount}+ {isAr ? 'رحلة' : 'experiences'}</span>
              <span className="inline-flex items-center gap-1.5 text-cream/70"><Compass className="h-4 w-4" /> {isAr ? 'كل فئات السياحة' : 'All tourism categories'}</span>
              <span className="inline-flex items-center gap-1.5 text-cream/70"><Calendar className="h-4 w-4" /> {isAr ? 'يومياً' : 'Daily departures'}</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FILTERS — sticky pill bar */}
      <section className="sticky top-[88px] md:top-[116px] z-30 bg-cream/95 backdrop-blur-md border-b border-accent/15 shadow-sm">
        <div className="container py-3.5 md:py-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-2 px-2">
            {/* All */}
            <Link
              href={{ pathname: '/trips' }}
              className={cn(
                'group shrink-0 inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full text-sm font-bold border-2 transition-all whitespace-nowrap',
                !cat
                  ? 'bg-primary text-cream border-primary shadow-lg shadow-primary/20'
                  : 'bg-white text-primary border-accent/25 hover:border-accent hover:bg-accent/5',
              )}
            >
              <Sparkles className={cn('h-4 w-4', !cat ? 'text-accent' : 'text-accent/80')} />
              <span>{t('trips.all')}</span>
              <span
                className={cn(
                  'inline-flex items-center justify-center min-w-[26px] h-[22px] px-1.5 rounded-full text-[11px] font-bold leading-none',
                  !cat ? 'bg-accent text-primary' : 'bg-primary/10 text-primary',
                )}
              >
                {totalCount}
              </span>
            </Link>

            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICON[c];
              const n = counts[c] ?? 0;
              const isActive = cat === c;
              return (
                <Link
                  key={c}
                  href={{ pathname: '/trips', query: { category: c } }}
                  className={cn(
                    'group shrink-0 inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full text-sm font-bold border-2 transition-all whitespace-nowrap',
                    isActive
                      ? 'bg-primary text-cream border-primary shadow-lg shadow-primary/20'
                      : 'bg-white text-primary border-accent/25 hover:border-accent hover:bg-accent/5',
                    n === 0 && !isActive && 'opacity-50',
                  )}
                  aria-disabled={n === 0 && !isActive}
                >
                  <Icon className={cn('h-4 w-4', isActive ? 'text-accent' : 'text-accent/80')} />
                  <span>{t(`trips.category.${c}`)}</span>
                  <span
                    className={cn(
                      'inline-flex items-center justify-center min-w-[26px] h-[22px] px-1.5 rounded-full text-[11px] font-bold leading-none',
                      isActive ? 'bg-accent text-primary' : 'bg-primary/10 text-primary',
                    )}
                  >
                    {n}
                  </span>
                </Link>
              );
            })}
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
