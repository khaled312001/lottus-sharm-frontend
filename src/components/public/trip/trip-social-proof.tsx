'use client';

import { Flame } from 'lucide-react';
import { L } from '@/lib/utils';

/**
 * Real social proof: number of bookings in the last 7 days for this trip.
 * Pulled straight from the DB — no fake counters or simulated viewers.
 * Renders nothing if the count is too low to be meaningful (under 3).
 */
export function TripSocialProof({
  bookingsLast7Days = 0,
  locale,
}: {
  tripId?: number;
  bookingsLast7Days?: number;
  locale: string;
}) {
  if (bookingsLast7Days < 3) return null;

  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-100 backdrop-blur">
        <Flame className="h-4 w-4 text-amber-400" />
        <span className="font-serif font-bold text-lg sm:text-xl text-amber-200 leading-none tabular-nums">
          {bookingsLast7Days}
        </span>
        <span className="text-[11px] sm:text-xs font-semibold text-amber-100/85">
          {L(locale, {
            ar: 'حجز هذا الأسبوع',
            en: 'booked this week', de: 'booked this week',
            ru: 'броней за неделю',
            it: 'prenot. settimana',
          })}
        </span>
      </span>
    </div>
  );
}
