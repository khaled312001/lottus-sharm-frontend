'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
  Plus, Minus, Calendar as CalendarIcon, MessageCircle, Users, Baby,
  ShieldCheck, Sparkles, BadgeCheck, Phone, User, ChevronDown,
} from 'lucide-react';
import type { TripDTO } from '@/types/api';
import { bookingWhatsAppLink } from '@/lib/whatsapp';
import { DatePicker } from './date-picker';
import { API_BASE } from '@/lib/api';
import { Price } from './price';
import { useCurrency } from '@/lib/currency';
import { CountryPicker } from './country-picker';
import { countryName, getCountry } from '@/lib/countries';
import { L } from '@/lib/utils';

export function BookingWidget({ trip }: { trip: TripDTO }) {
  const t = useTranslations('booking');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const minDate = useMemo(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10), []);
  const [date, setDate] = useState(minDate);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [isLocal, setIsLocal] = useState(locale === 'ar');
  // Tourist details
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [nationality, setNationality] = useState(locale === 'ar' ? 'EG' : '');
  const [detailsOpen, setDetailsOpen] = useState(false);

  const unit = isLocal ? Number(trip.priceLocalEGP) : Number(trip.priceForeignUSD);
  const fromCurrency = (isLocal ? 'EGP' : 'USD') as 'EGP' | 'USD';
  const childPrice = unit * (1 - trip.childDiscount / 100);
  const total = adults * unit + children * childPrice;
  // Display symbol comes from the user-selected currency, not the trip's currency.
  const { currency: displayCurrency } = useCurrency();
  void displayCurrency;
  // Legacy: keep symbol for inline price-formula text. We render the actual
  // amounts via <Price/> below so they convert live.
  const symbol = isLocal ? 'ج.م' : '$';

  const country = nationality ? getCountry(nationality) : undefined;
  const nationalityLabel = nationality ? `${country?.flag || ''} ${countryName(nationality, locale)}` : undefined;
  const phoneWithDial = phone && country?.dial && !phone.startsWith('+')
    ? `${country.dial} ${phone}`
    : phone;

  const waLink = bookingWhatsAppLink({
    trip, locale, date, adults, children, isLocal,
    fullName: fullName.trim() || undefined,
    phone: phoneWithDial.trim() || undefined,
    nationality: nationalityLabel,
    age: age.trim() || undefined,
  });
  const isAr = locale === 'ar';
  const detailsFilled = [fullName, phone, age, nationality].filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative bg-white rounded-3xl card-shadow border border-accent/15 sticky top-32 overflow-hidden"
    >
      {/* Gold ribbon accent */}
      <div className="absolute top-0 inset-x-0 h-1 gradient-gold z-10" />

      {/* HEADER — compact price strip */}
      <div className="relative bg-gradient-to-br from-primary via-primary to-primary-900 text-cream px-5 py-4 overflow-hidden">
        <div className="absolute -top-16 -end-16 w-32 h-32 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-accent font-bold">{tCommon('from')}</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-serif text-3xl font-bold text-shimmer-gold leading-none">
                <Price amount={unit} from={fromCurrency} />
              </span>
              <span className="text-[11px] text-cream/65 ms-1">/ {tCommon('perPerson')}</span>
            </div>
          </div>

          {/* Compact trust badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cream/10 backdrop-blur border border-accent/30 text-[10px] font-bold text-cream/90 uppercase tracking-wider">
            <BadgeCheck className="h-3.5 w-3.5 text-accent" />
            {isAr ? 'دفع آمن' : 'Secure'}
          </div>
        </div>
      </div>

      {/* FORM BODY — compact */}
      <div className="p-4 space-y-3">
        {/* Date picker */}
        <div>
          <label className="flex items-center gap-1.5 text-[10px] font-bold mb-1.5 text-primary/80 uppercase tracking-wider">
            <CalendarIcon className="h-3 w-3 text-accent" />
            {t('tripDate')}
          </label>
          <DatePicker value={date} onChange={setDate} min={minDate} locale={locale} />
        </div>

        {/* Counters */}
        <Counter
          icon={Users}
          label={t('adults')}
          sublabel={isAr ? '12+ سنة' : '12+ yrs'}
          value={adults}
          setValue={setAdults}
          min={1}
          max={20}
        />
        <Counter
          icon={Baby}
          label={t('children')}
          sublabel={trip.childDiscount > 0 ? (isAr ? `خصم ${trip.childDiscount}%` : `${trip.childDiscount}% off`) : (isAr ? '2-11 سنة' : '2-11 yrs')}
          value={children}
          setValue={setChildren}
          min={0}
          max={20}
        />

        {/* Nationality toggle — compact pill */}
        <label className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-accent/8 border border-accent/20 cursor-pointer hover:border-accent/40 transition-colors">
          <span className="text-sm font-bold text-primary leading-tight">
            {isAr ? 'أنا مصري الجنسية' : "I'm Egyptian"}
          </span>
          <ToggleSwitch checked={isLocal} onChange={setIsLocal} />
        </label>

        {/* Tourist details — collapsible */}
        <div className="rounded-xl border border-accent/20 overflow-hidden bg-gradient-to-br from-muted/30 to-white">
          <button
            type="button"
            onClick={() => setDetailsOpen((o) => !o)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-start hover:bg-muted/30 transition-colors"
          >
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent/15 text-accent-700">
                <User className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-bold text-primary">
                {L(locale, { ar: 'بيانات السائح', en: 'Tourist details', ru: 'Данные туриста', it: 'Dati turista' })}
              </span>
              {detailsFilled > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-primary text-[10px] font-bold tabular-nums">
                  {detailsFilled}
                </span>
              )}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
              {!detailsOpen && detailsFilled === 0 && (
                <span className="text-[10px] text-muted-foreground/80">
                  {L(locale, { ar: 'اختياري', en: 'optional', ru: 'опционально', it: 'opzionale' })}
                </span>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
            </span>
          </button>

          {detailsOpen && (
            <div className="p-3 space-y-2.5 border-t border-accent/15">
              <div>
                <label className="text-[10px] font-bold text-primary/70 uppercase tracking-wider mb-1 block">
                  {L(locale, { ar: 'الاسم الكامل', en: 'Full name', ru: 'Полное имя', it: 'Nome completo' })}
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={L(locale, { ar: 'مثلاً: أحمد محمد', en: 'e.g. John Smith', ru: 'Напр.: Иван Иванов', it: 'Es. Mario Rossi' }) as string}
                  className="h-10 text-sm"
                  maxLength={120}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-primary/70 uppercase tracking-wider mb-1 block">
                  {L(locale, { ar: 'الجنسية', en: 'Nationality', ru: 'Гражданство', it: 'Nazionalità' })}
                </label>
                <CountryPicker value={nationality} onChange={setNationality} locale={locale} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-primary/70 uppercase tracking-wider mb-1 block">
                    {L(locale, { ar: 'رقم الهاتف', en: 'Phone', ru: 'Телефон', it: 'Telefono' })}
                  </label>
                  <div className="relative">
                    {country?.dial && (
                      <span className="absolute start-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-muted-foreground tabular-nums pointer-events-none" dir="ltr">
                        {country.dial}
                      </span>
                    )}
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^\d+\-\s()]/g, ''))}
                      placeholder="123 456 7890"
                      dir="ltr"
                      className={`h-10 text-sm tabular-nums ${country?.dial ? 'ps-12' : ''}`}
                      maxLength={20}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-primary/70 uppercase tracking-wider mb-1 block">
                    {L(locale, { ar: 'العمر', en: 'Age', ru: 'Возраст', it: 'Età' })}
                  </label>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="—"
                    min={1}
                    max={120}
                    className="h-10 text-sm tabular-nums"
                  />
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {L(locale, {
                  ar: '✓ ستُرسل هذه البيانات تلقائياً مع رسالة واتساب لتسهيل الحجز.',
                  en: '✓ These details auto-fill the WhatsApp message to speed up booking.',
                  ru: '✓ Данные автоматически добавятся в WhatsApp-сообщение.',
                  it: '✓ Questi dati vengono inseriti nel messaggio WhatsApp.',
                })}
              </p>
            </div>
          )}
        </div>

        {/* Price total */}
        <div className="flex justify-between items-end pt-3 border-t border-dashed border-accent/25">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t('total')}</div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1 flex-wrap">
              <span>{adults} × <Price amount={unit} from={fromCurrency} /></span>
              {children > 0 && <span>+ {children} × <Price amount={childPrice} from={fromCurrency} /></span>}
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-accent-700 leading-none">
            <Price amount={total} from={fromCurrency} />
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-2 pt-1">
          <Button
            asChild
            size="lg"
            className="w-full h-12 bg-[#25D366] hover:bg-[#1ea954] text-white font-bold text-sm shadow-lg shadow-[#25D366]/30 hover:shadow-[#25D366]/50 hover:-translate-y-0.5 transition-all group rounded-xl"
          >
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                // Track WhatsApp click as a lead — fire and forget
                try {
                  const payload = JSON.stringify({
                    tripId: trip.id,
                    adultsCount: adults,
                    childrenCount: children,
                    customerType: isLocal ? 'LOCAL' : 'FOREIGN',
                    customer: { language: locale.toUpperCase() },
                    notes: `Date: ${date} — ${total} ${symbol}`,
                    referrer: typeof window !== 'undefined' ? window.location.pathname : '',
                  });
                  if (navigator.sendBeacon) {
                    navigator.sendBeacon(`${API_BASE}/public/bookings/whatsapp-lead`, new Blob([payload], { type: 'application/json' }));
                  } else {
                    fetch(`${API_BASE}/public/bookings/whatsapp-lead`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: payload,
                      keepalive: true,
                    }).catch(() => {});
                  }
                } catch {/* ignore */}
              }}
              className="inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
              {isAr ? 'احجز عبر واتساب' : 'Book via WhatsApp'}
            </a>
          </Button>

          <Button asChild variant="outline" size="sm" className="w-full h-10 border-accent/30 hover:bg-accent/5 hover:border-accent text-primary font-bold rounded-xl">
            <a href="tel:+201090767278" className="inline-flex items-center justify-center gap-2 text-sm">
              <Phone className="h-3.5 w-3.5 text-accent" />
              {isAr ? 'اتصل بنا الآن' : 'Call us now'}
            </a>
          </Button>
        </div>

        {/* Trust strip — inline, compact */}
        <div className="flex items-center justify-center gap-3 pt-2 text-[10px] text-muted-foreground border-t border-accent/15">
          <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-accent" />{isAr ? 'إلغاء مجاني' : 'Free cancel'}</span>
          <span className="w-px h-2.5 bg-accent/20" />
          <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3 text-accent" />{isAr ? 'تأكيد فوري' : 'Instant'}</span>
          <span className="w-px h-2.5 bg-accent/20" />
          <span className="inline-flex items-center gap-1"><BadgeCheck className="h-3 w-3 text-accent" />{isAr ? 'مرخصة' : 'Licensed'}</span>
        </div>
      </div>
    </motion.div>
  );
}

function Counter({
  icon: Icon, label, sublabel, value, setValue, min, max,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sublabel?: string;
  value: number;
  setValue: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-accent/15 text-accent-700 shrink-0">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 leading-tight">
          <div className="text-sm font-bold text-primary">{label}</div>
          {sublabel && <div className="text-[10px] text-muted-foreground truncate">{sublabel}</div>}
        </div>
      </div>
      <div className="flex items-center gap-1 bg-muted/40 rounded-full p-0.5 border border-accent/15">
        <button
          type="button"
          onClick={() => setValue(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label="decrease"
          className="w-7 h-7 rounded-full bg-white border border-accent/30 hover:border-accent hover:bg-accent hover:text-primary text-primary/70 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-primary/70 flex items-center justify-center shadow-sm"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-7 text-center font-bold text-primary tabular-nums text-sm">{value}</span>
        <button
          type="button"
          onClick={() => setValue(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label="increase"
          className="w-7 h-7 rounded-full bg-white border border-accent/30 hover:border-accent hover:bg-accent hover:text-primary text-primary/70 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-primary/70 flex items-center justify-center shadow-sm"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={
        'relative inline-flex items-center w-12 h-7 rounded-full transition-colors duration-200 shrink-0 ' +
        (checked ? 'bg-accent' : 'bg-muted-foreground/30')
      }
    >
      <span
        className={
          'inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ' +
          (checked ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1')
        }
      />
    </button>
  );
}

function PriceRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex justify-between items-baseline text-sm">
      <div className="text-muted-foreground">
        <span className="tabular-nums">{label}</span>
        {sub && <span className="text-[10px] ms-1.5 opacity-70">· {sub}</span>}
      </div>
      <span className="font-semibold text-foreground/80 tabular-nums">{value}</span>
    </div>
  );
}

function TrustBadge({
  icon: Icon, text, sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-1 px-1.5 py-2 rounded-lg hover:bg-accent/5 transition-colors">
      <Icon className="h-4 w-4 text-accent" />
      <div className="text-[10px] font-bold text-primary leading-tight">{text}</div>
      <div className="text-[9px] text-muted-foreground leading-tight">{sub}</div>
    </div>
  );
}
