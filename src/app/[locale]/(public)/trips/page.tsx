import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { TripCard } from '@/components/public/trip-card';
import { api } from '@/lib/api';
import type { TripDTO } from '@/types/api';
import { localeToApiCode } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
}

const CATEGORIES = ['SEA', 'DESERT', 'CITY', 'DIVING', 'EVENTS', 'SAFARI'] as const;

export default async function TripsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  const cat = sp.category as (typeof CATEGORIES)[number] | undefined;
  const page = Number(sp.page || 1);

  let trips: { items: TripDTO[]; total: number; totalPages: number } = {
    items: [],
    total: 0,
    totalPages: 0,
  };
  try {
    const qs = new URLSearchParams({
      locale: localeToApiCode(locale),
      page: String(page),
      pageSize: '12',
    });
    if (cat) qs.set('category', cat);
    trips = await api.get(`/public/trips?${qs}`);
  } catch {
    /* ignored */
  }

  return (
    <>
      <section className="gradient-sea text-white py-16">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">{t('trips.title')}</h1>
          <p className="text-lg opacity-90">{t('trips.subtitle')}</p>
        </div>
      </section>

      <section className="container py-10">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <Link
            href={{ pathname: '/trips' }}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-semibold border transition-colors',
              !cat ? 'bg-primary text-white border-primary' : 'bg-white hover:bg-muted',
            )}
          >
            {t('trips.all')}
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={{ pathname: '/trips', query: { category: c } }}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-semibold border transition-colors',
                cat === c ? 'bg-primary text-white border-primary' : 'bg-white hover:bg-muted',
              )}
            >
              {t(`trips.category.${c}`)}
            </Link>
          ))}
        </div>

        {trips.items.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">{t('trips.noTrips')}</div>
        ) : (
          <Suspense>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.items.map((trip) => (
                <TripCard key={trip.id} trip={trip} locale={locale} />
              ))}
            </div>

            {trips.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: trips.totalPages }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <Link
                      key={p}
                      href={{ pathname: '/trips', query: { ...(cat ? { category: cat } : {}), page: String(p) } }}
                      className={cn(
                        'min-w-10 h-10 px-3 rounded-md font-semibold inline-flex items-center justify-center border',
                        p === page ? 'bg-primary text-white border-primary' : 'hover:bg-muted',
                      )}
                    >
                      {p}
                    </Link>
                  );
                })}
              </div>
            )}
          </Suspense>
        )}
      </section>
    </>
  );
}
