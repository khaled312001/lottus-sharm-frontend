'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Plus, Minus, Calendar as CalendarIcon, MessageCircle } from 'lucide-react';
import type { TripDTO } from '@/types/api';
import { bookingWhatsAppLink } from '@/lib/whatsapp';

export function BookingWidget({ trip }: { trip: TripDTO }) {
  const t = useTranslations('booking');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const minDate = useMemo(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10), []);
  const [date, setDate] = useState(minDate);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [isLocal, setIsLocal] = useState(locale === 'ar');

  const unit = isLocal ? Number(trip.priceLocalEGP) : Number(trip.priceForeignUSD);
  const symbol = isLocal ? 'ج.م' : '$';
  const childPrice = unit * (1 - trip.childDiscount / 100);
  const total = adults * unit + children * childPrice;

  const waLink = bookingWhatsAppLink({ trip, locale, date, adults, children, isLocal });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative bg-white rounded-2xl card-shadow border border-accent/10 sticky top-32"
    >
      <div className="relative bg-primary text-cream p-6 rounded-t-2xl overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-accent/20 blur-2xl pointer-events-none" />
        <div className="relative">
          <div className="text-xs uppercase tracking-[0.25em] text-accent mb-1">{tCommon('from')}</div>
          <div className="font-serif text-4xl font-bold">{symbol}{unit.toLocaleString()}</div>
          <div className="text-xs text-cream/70">{tCommon('perPerson')}</div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold mb-1.5 text-primary/70 uppercase tracking-wider">{t('tripDate')}</label>
          <div className="relative">
            <CalendarIcon className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent pointer-events-none" />
            <Input
              type="date"
              value={date}
              min={minDate}
              onChange={(e) => setDate(e.target.value)}
              className="border-accent/20 focus:border-accent"
            />
          </div>
        </div>

        <Counter label={t('adults')} value={adults} setValue={setAdults} min={1} max={20} />
        <Counter label={t('children')} value={children} setValue={setChildren} min={0} max={20} />

        <label className="flex items-center gap-2 text-sm cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={isLocal}
            onChange={(e) => setIsLocal(e.target.checked)}
            className="w-4 h-4 accent-accent"
          />
          <span className="text-primary/80 group-hover:text-primary transition-colors">{t('isLocal')}</span>
        </label>

        <div className="pt-4 border-t border-accent/15 space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>{adults} × {symbol}{unit}</span>
            <span>{symbol}{(adults * unit).toLocaleString()}</span>
          </div>
          {children > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>{children} × {symbol}{childPrice.toFixed(0)}</span>
              <span>{symbol}{(children * childPrice).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline font-bold pt-3 border-t border-accent/10 mt-2">
            <span className="text-primary">{t('total')}</span>
            <span className="font-serif text-2xl text-accent-700">
              {symbol}{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        <Button
          asChild
          size="lg"
          className="w-full bg-[#25D366] hover:bg-[#1ea954] text-white font-bold shadow-lg shadow-[#25D366]/30 group"
        >
          <a href={waLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
            {locale === 'ar' ? 'احجز عبر واتساب' : 'Book via WhatsApp'}
          </a>
        </Button>
        <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
          {locale === 'ar'
            ? 'هتفتحلك محادثة واتساب جاهزة بتفاصيل حجزك، فريقنا هيرد فوراً للتأكيد.'
            : 'A pre-filled WhatsApp chat will open with your booking details. Our team will confirm shortly.'}
        </p>
      </div>
    </motion.div>
  );
}

function Counter({ label, value, setValue, min, max }: { label: string; value: number; setValue: (v: number) => void; min: number; max: number }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-semibold text-primary/80">{label}</label>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setValue(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-9 h-9 rounded-full border border-accent/30 hover:border-accent hover:bg-accent hover:text-primary text-primary/70 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-primary/70"
        >
          <Minus className="h-3.5 w-3.5 mx-auto" />
        </button>
        <span className="w-10 text-center font-bold text-primary">{value}</span>
        <button
          type="button"
          onClick={() => setValue(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-9 h-9 rounded-full border border-accent/30 hover:border-accent hover:bg-accent hover:text-primary text-primary/70 transition-colors disabled:opacity-30"
        >
          <Plus className="h-3.5 w-3.5 mx-auto" />
        </button>
      </div>
    </div>
  );
}
