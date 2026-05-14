'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Calendar } from 'lucide-react';
import type { TripDTO } from '@/types/api';

export function BookingWidget({ trip }: { trip: TripDTO }) {
  const t = useTranslations('booking');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const [date, setDate] = useState<string>(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [isLocal, setIsLocal] = useState(locale === 'ar');

  const unit = isLocal ? Number(trip.priceLocalEGP) : Number(trip.priceForeignUSD);
  const symbol = isLocal ? 'ج.م' : '$';
  const childPrice = unit * (1 - trip.childDiscount / 100);
  const total = adults * unit + children * childPrice;

  const onSubmit = () => {
    const qs = new URLSearchParams({
      tripId: String(trip.id),
      date,
      adults: String(adults),
      children: String(children),
      type: isLocal ? 'LOCAL' : 'FOREIGN',
    });
    router.push(`/booking/start?${qs}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border p-6 sticky top-24">
      <div className="text-center mb-5 pb-4 border-b">
        <div className="text-xs text-muted-foreground">{tCommon('from')}</div>
        <div className="text-3xl font-extrabold text-primary">
          {symbol}{unit} <span className="text-sm text-muted-foreground font-normal">{tCommon('perPerson')}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5">{t('tripDate')}</label>
          <div className="relative">
            <Calendar className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={date}
              min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <Counter label={t('adults')} value={adults} setValue={setAdults} min={1} max={20} />
        <Counter label={t('children')} value={children} setValue={setChildren} min={0} max={20} />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isLocal} onChange={(e) => setIsLocal(e.target.checked)} className="w-4 h-4 accent-primary" />
          <span>{t('isLocal')}</span>
        </label>

        <div className="pt-4 border-t space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">{adults} × {symbol}{unit}</span><span>{symbol}{(adults * unit).toLocaleString()}</span></div>
          {children > 0 && <div className="flex justify-between"><span className="text-muted-foreground">{children} × {symbol}{childPrice.toFixed(0)}</span><span>{symbol}{(children * childPrice).toLocaleString()}</span></div>}
          <div className="flex justify-between font-bold text-base pt-2 border-t mt-2">
            <span>{t('total')}</span>
            <span className="text-primary text-xl">{symbol}{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        <Button onClick={onSubmit} size="lg" className="w-full">{tCommon('bookNow')}</Button>
      </div>
    </div>
  );
}

function Counter({ label, value, setValue, min, max }: { label: string; value: number; setValue: (v: number) => void; min: number; max: number }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-semibold">{label}</label>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setValue(Math.max(min, value - 1))} className="w-9 h-9 rounded-full border hover:bg-muted disabled:opacity-50" disabled={value <= min}>
          <Minus className="h-4 w-4 mx-auto" />
        </button>
        <span className="w-8 text-center font-bold">{value}</span>
        <button type="button" onClick={() => setValue(Math.min(max, value + 1))} className="w-9 h-9 rounded-full border hover:bg-muted disabled:opacity-50" disabled={value >= max}>
          <Plus className="h-4 w-4 mx-auto" />
        </button>
      </div>
    </div>
  );
}
