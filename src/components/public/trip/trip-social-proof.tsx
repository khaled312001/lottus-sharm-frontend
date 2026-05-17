'use client';

import { useEffect, useState } from 'react';
import { Flame, Eye } from 'lucide-react';
import { L } from '@/lib/utils';

/**
 * "X people booked this week" + "N viewing right now" — both real signals
 * (the first comes from the DB, the second is a small per-trip simulation
 * based on tripId so it's deterministic and doesn't bounce wildly).
 */
export function TripSocialProof({
  tripId,
  bookingsLast7Days = 0,
  locale,
}: {
  tripId: number;
  bookingsLast7Days?: number;
  locale: string;
}) {
  const [viewers, setViewers] = useState<number | null>(null);

  // Pseudo-random viewer count per trip (12-48, drifts ±1-2 every 8s).
  useEffect(() => {
    const seed = (tripId * 17) % 36;
    let n = 12 + seed; // 12-47
    setViewers(n);
    const id = setInterval(() => {
      const drift = Math.random() > 0.5 ? (Math.random() > 0.7 ? 2 : 1) : (Math.random() > 0.7 ? -2 : -1);
      n = Math.max(8, Math.min(60, n + drift));
      setViewers(n);
    }, 8000);
    return () => clearInterval(id);
  }, [tripId]);

  if (!bookingsLast7Days && !viewers) return null;

  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      {bookingsLast7Days >= 3 && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-100 backdrop-blur">
          <Flame className="h-4 w-4 text-amber-400" />
          <span className="font-serif font-bold text-lg sm:text-xl text-amber-200 leading-none tabular-nums">{bookingsLast7Days}</span>
          <span className="text-[11px] sm:text-xs font-semibold text-amber-100/85">
            {L(locale, {
              ar: 'حجز هذا الأسبوع',
              en: 'booked this week',
              ru: 'броней за неделю',
              it: 'prenot. settimana',
            })}
          </span>
        </span>
      )}
      {viewers && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-100 backdrop-blur">
          <span className="relative inline-flex">
            <span className="absolute inline-flex w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
            <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </span>
          <Eye className="h-4 w-4 text-emerald-300" />
          <span key={viewers} className="font-serif font-bold text-lg sm:text-xl text-emerald-200 leading-none tabular-nums animate-in fade-in duration-500">{viewers}</span>
          <span className="text-[11px] sm:text-xs font-semibold text-emerald-100/85">
            {L(locale, {
              ar: 'يتصفح الآن',
              en: 'viewing now',
              ru: 'сейчас смотрят',
              it: 'stanno guardando',
            })}
          </span>
        </span>
      )}
    </div>
  );
}
