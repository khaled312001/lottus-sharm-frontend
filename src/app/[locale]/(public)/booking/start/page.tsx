import { redirect } from '@/i18n/routing';
import { BookingForm } from '@/components/public/booking-form';
import { api } from '@/lib/api';
import type { TripDTO } from '@/types/api';
import { localeToApiCode } from '@/lib/utils';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    tripId?: string;
    date?: string;
    adults?: string;
    children?: string;
    type?: 'LOCAL' | 'FOREIGN';
  }>;
}

export default async function BookingStartPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  const tripId = Number(sp.tripId);
  if (!tripId) redirect({ href: '/trips', locale });

  let trip: TripDTO | null = null;
  try {
    // We don't have a get-by-id public endpoint — fetch from list and find. Better: extend backend.
    // As a quick approach: fetch from /public/trips and filter (small dataset).
    const list = await api.get<{ items: TripDTO[] }>(
      `/public/trips?locale=${localeToApiCode(locale)}&pageSize=50`,
    );
    trip = list.items.find((t) => t.id === tripId) || null;
  } catch {
    /* ignored */
  }
  if (!trip) redirect({ href: '/trips', locale });

  return (
    <section className="container py-10 max-w-3xl">
      <BookingForm
        trip={trip!}
        locale={locale}
        defaults={{
          date: sp.date,
          adults: Number(sp.adults || 1),
          children: Number(sp.children || 0),
          customerType: sp.type || 'LOCAL',
        }}
      />
    </section>
  );
}
