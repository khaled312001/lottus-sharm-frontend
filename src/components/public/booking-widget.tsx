'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Plus, Minus, Calendar as CalendarIcon, MessageCircle, Users, Baby, BadgeCheck,
  Phone, User, Mail, ChevronDown, Heart, Sparkles, ShieldCheck,
} from 'lucide-react';
import type { TripDTO } from '@/types/api';
import { bookingWhatsAppLink } from '@/lib/whatsapp';
import { DatePicker } from './date-picker';
import { Price } from './price';
import { useCurrency } from '@/lib/currency';
import { L, cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { API_BASE } from '@/lib/api';
import { toast } from 'sonner';
import { BookingPayModal } from './booking-pay-modal';
import { CreditCard } from 'lucide-react';

type TravelerType = 'ADULT' | 'GEN_Z';

export function BookingWidget({ trip }: { trip: TripDTO }) {
  const t = useTranslations('booking');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const isAr = locale === 'ar';

  // ===== Trip basics =====
  const minDate = useMemo(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10), []);
  const [date, setDate] = useState(minDate);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [isLocal, setIsLocal] = useState(locale === 'ar');

  // ===== Traveler profile =====
  const [travelerType, setTravelerType] = useState<TravelerType>('ADULT');
  const [isMarried, setIsMarried] = useState(false);

  // ===== Customer info (always visible, all required) =====
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);

  // ===== Currency / total =====
  const { currency } = useCurrency();
  void currency;
  const unit = isLocal ? Number(trip.priceLocalEGP) : Number(trip.priceForeignUSD);
  const fromCurrency = (isLocal ? 'EGP' : 'USD') as 'EGP' | 'USD';
  const childPrice = unit * (1 - trip.childDiscount / 100);
  const total = adults * unit + children * childPrice;

  // Auto-disable children counter if "متزوج" toggle is off
  const showChildrenCounter = isMarried;

  // ===== Validation =====
  const phoneClean = phone.trim();
  const emailClean = email.trim();
  const nameClean = fullName.trim();
  const isPhoneValid = phoneClean.length >= 8 && /^[+\d\s()-]+$/.test(phoneClean);
  const isEmailValid = !emailClean || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean);
  const isNameValid = nameClean.length >= 2;
  const formReady = isNameValid && isPhoneValid && isEmailValid && adults >= 1;

  const filledCustomerCount =
    (isNameValid ? 1 : 0) + (isPhoneValid ? 1 : 0) + (isEmailValid && emailClean ? 1 : 0);

  // ===== Build WhatsApp link =====
  const waLink = bookingWhatsAppLink({
    trip, locale, date,
    adults, children: showChildrenCounter ? children : 0,
    isLocal,
    fullName: nameClean || undefined,
    email: emailClean || undefined,
    phone: phoneClean || undefined,
    travelerType,
    isMarried,
    notes: notes.trim() || undefined,
  });

  // ===== WhatsApp lead tracking (fire-and-forget) =====
  const trackLead = () => {
    try {
      const payload = JSON.stringify({
        tripId: trip.id,
        adultsCount: adults,
        childrenCount: showChildrenCounter ? children : 0,
        customerType: isLocal ? 'LOCAL' : 'FOREIGN',
        customer: {
          fullName: nameClean || undefined,
          phone: phoneClean || undefined,
          language: locale.toUpperCase(),
        },
        notes: `${date} — ${travelerType}${isMarried ? ' — married' : ''} — total≈${total} ${fromCurrency}${notes ? `\nNotes: ${notes}` : ''}`,
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
  };

  const onWhatsAppClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!formReady) {
      e.preventDefault();
      if (!isNameValid) toast.error(L(locale, { ar: 'أدخل اسمك من فضلك', en: 'Please enter your name', ru: 'Введите имя', it: 'Inserisci il nome' }) as string);
      else if (!isPhoneValid) toast.error(L(locale, { ar: 'رقم هاتف غير صحيح', en: 'Invalid phone number', ru: 'Неверный телефон', it: 'Numero non valido' }) as string);
      else if (!isEmailValid) toast.error(L(locale, { ar: 'البريد الإلكتروني غير صحيح', en: 'Invalid email', ru: 'Неверный email', it: 'Email non valida' }) as string);
      return;
    }
    trackLead();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative bg-white rounded-3xl card-shadow border border-accent/15 lg:sticky lg:top-32 overflow-hidden"
    >
      {/* Gold ribbon */}
      <div className="absolute top-0 inset-x-0 h-1 gradient-gold z-10" />

      {/* ===== HEADER ===== */}
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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cream/10 backdrop-blur border border-accent/30 text-[10px] font-bold text-cream/90 uppercase tracking-wider">
            <BadgeCheck className="h-3.5 w-3.5 text-accent" />
            {L(locale, { ar: 'دفع آمن', en: 'Secure', ru: 'Безопасно', it: 'Sicuro' })}
          </div>
        </div>
      </div>

      {/* ===== FORM BODY ===== */}
      <div className="p-4 space-y-4">

        {/* Section 1: Trip date */}
        <Section
          title={L(locale, { ar: 'تاريخ الرحلة', en: 'Trip date', ru: 'Дата тура', it: 'Data tour' }) as string}
          icon={CalendarIcon}
        >
          <DatePicker value={date} onChange={setDate} min={minDate} locale={locale} />
        </Section>

        {/* Section 2: Traveler profile */}
        <Section
          title={L(locale, { ar: 'الفئة العمرية', en: 'Age group', ru: 'Возрастная группа', it: 'Fascia d\'età' }) as string}
          icon={User}
        >
          <div className="grid grid-cols-2 gap-2">
            {([
              { v: 'ADULT', ar: 'بالغ', en: 'Adult', ru: 'Взрослый', it: 'Adulto', sub: { ar: 'فوق 25 سنة', en: '25+ years', ru: '25+ лет', it: 'oltre 25' } },
              { v: 'GEN_Z', ar: 'Gen Z', en: 'Gen Z', ru: 'Gen Z', it: 'Gen Z', sub: { ar: 'تحت 25 سنة', en: 'under 25', ru: 'до 25', it: 'sotto 25' } },
            ] as const).map((opt) => {
              const active = travelerType === opt.v;
              return (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setTravelerType(opt.v)}
                  className={cn(
                    'rounded-xl px-3 py-2.5 text-start transition-all border-2',
                    active
                      ? 'bg-primary text-cream border-primary shadow-md'
                      : 'bg-white text-primary border-accent/20 hover:border-accent/50',
                  )}
                >
                  <div className="text-sm font-bold leading-tight">{L(locale, opt)}</div>
                  <div className={cn('text-[10px] leading-tight mt-0.5', active ? 'text-cream/75' : 'text-muted-foreground')}>
                    {L(locale, opt.sub)}
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Section 3: Counters */}
        <Section
          title={L(locale, { ar: 'عدد المسافرين', en: 'Travelers', ru: 'Кол-во', it: 'Viaggiatori' }) as string}
          icon={Users}
        >
          <div className="space-y-2">
            <Counter
              icon={Users}
              label={L(locale, { ar: 'البالغين', en: 'Adults', ru: 'Взрослые', it: 'Adulti' }) as string}
              sublabel={L(locale, { ar: 'الإلزامي', en: 'required', ru: 'обязательно', it: 'obbligatorio' }) as string}
              value={adults}
              setValue={setAdults}
              min={1}
              max={30}
            />

            {/* Married toggle — gates the children counter */}
            <label className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-br from-accent/8 via-accent/5 to-accent/8 border border-accent/20 cursor-pointer hover:border-accent/45 transition-colors">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-primary leading-tight">
                <Heart className="h-3.5 w-3.5 text-accent" />
                {L(locale, { ar: 'متزوج / مع عائلة', en: 'Travelling with family', ru: 'С семьёй', it: 'In famiglia' })}
              </span>
              <ToggleSwitch checked={isMarried} onChange={(v) => { setIsMarried(v); if (!v) setChildren(0); }} />
            </label>

            {showChildrenCounter && (
              <div className="animate-in slide-in-from-top-1 fade-in duration-200">
                <Counter
                  icon={Baby}
                  label={L(locale, { ar: 'الأطفال', en: 'Children', ru: 'Дети', it: 'Bambini' }) as string}
                  sublabel={
                    trip.childDiscount > 0
                      ? (L(locale, {
                          ar: `خصم ${trip.childDiscount}%`,
                          en: `${trip.childDiscount}% off`,
                          ru: `скидка ${trip.childDiscount}%`,
                          it: `sconto ${trip.childDiscount}%`,
                        }) as string)
                      : (L(locale, { ar: 'كل الأعمار', en: 'all ages', ru: 'все возрасты', it: 'tutte le età' }) as string)
                  }
                  value={children}
                  setValue={setChildren}
                  min={0}
                  max={20}
                />
              </div>
            )}
          </div>
        </Section>

        {/* Section 4: Nationality */}
        <label className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-primary/5 border border-accent/20 cursor-pointer hover:border-accent/45 transition-colors">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-primary leading-tight">
            <span className="text-lg">🇪🇬</span>
            {L(locale, { ar: 'أنا مصري الجنسية', en: "I'm Egyptian", ru: 'Я египтянин', it: 'Sono egiziano' })}
          </span>
          <ToggleSwitch checked={isLocal} onChange={setIsLocal} />
        </label>

        {/* Section 5: Customer info — REQUIRED, always visible */}
        <Section
          title={L(locale, { ar: 'بيانات التواصل', en: 'Contact details', ru: 'Контакты', it: 'Contatti' }) as string}
          icon={User}
          badge={`${filledCustomerCount}/3`}
        >
          <div className="space-y-2">
            <FieldRow icon={User} required>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={L(locale, { ar: 'الاسم الكامل', en: 'Full name', ru: 'Полное имя', it: 'Nome completo' }) as string}
                className="border-0 bg-transparent focus:bg-white"
                dir={isAr ? 'rtl' : 'ltr'}
              />
            </FieldRow>
            <FieldRow icon={Phone} required>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={L(locale, { ar: 'رقم الهاتف / واتساب', en: 'Phone / WhatsApp', ru: 'Телефон / WhatsApp', it: 'Telefono / WhatsApp' }) as string}
                className="border-0 bg-transparent focus:bg-white"
                dir="ltr"
                type="tel"
                inputMode="tel"
              />
            </FieldRow>
            <FieldRow icon={Mail}>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={L(locale, { ar: 'البريد الإلكتروني (اختياري)', en: 'Email (optional)', ru: 'Email (необязательно)', it: 'Email (opzionale)' }) as string}
                className="border-0 bg-transparent focus:bg-white"
                dir="ltr"
                type="email"
              />
            </FieldRow>
          </div>
        </Section>

        {/* Notes — collapsible */}
        <details
          className="group rounded-xl border border-accent/15 bg-muted/15 overflow-hidden"
          open={notesOpen}
          onToggle={(e) => setNotesOpen((e.target as HTMLDetailsElement).open)}
        >
          <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-bold text-primary inline-flex items-center justify-between gap-2 w-full">
            <span className="inline-flex items-center gap-2">
              <MessageCircle className="h-3.5 w-3.5 text-accent" />
              {L(locale, { ar: 'ملاحظات إضافية', en: 'Special requests', ru: 'Пожелания', it: 'Richieste' })}
            </span>
            <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="px-3 pb-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={L(locale, {
                ar: 'مثلاً: نباتي، احتياجات خاصة، ساعة الالتقاط...',
                en: 'e.g. dietary needs, pickup time, accessibility...',
                ru: 'Например: вегетарианское, время...',
                it: 'Es: vegetariano, orario...',
              }) as string}
              rows={3}
              maxLength={500}
              dir={isAr ? 'rtl' : 'ltr'}
              className="w-full mt-1 rounded-lg border border-accent/20 px-3 py-2 text-sm focus:outline-none focus:border-accent/60 focus:bg-white bg-transparent resize-none"
            />
          </div>
        </details>

        {/* Total preview */}
        <div className="flex justify-between items-end pt-3 border-t-2 border-dashed border-accent/30">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              {L(locale, { ar: 'الإجمالي التقريبي', en: 'Estimated total', ru: 'Итого (примерно)', it: 'Totale stimato' })}
            </div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1 flex-wrap mt-0.5">
              <span>{adults} × <Price amount={unit} from={fromCurrency} /></span>
              {showChildrenCounter && children > 0 && (
                <span>+ {children} × <Price amount={childPrice} from={fromCurrency} /></span>
              )}
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-accent-700 leading-none">
            <Price amount={total} from={fromCurrency} />
          </div>
        </div>

        {/* ===== CTAs — two paths: WhatsApp (fast) OR Submit + upload receipt ===== */}
        <div className="space-y-2 pt-1">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onWhatsAppClick}
            className={cn(
              'inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl font-bold text-sm shadow-lg transition-all group',
              formReady
                ? 'bg-[#25D366] hover:bg-[#1ea954] text-white shadow-[#25D366]/30 hover:shadow-[#25D366]/50 hover:-translate-y-0.5'
                : 'bg-muted text-muted-foreground cursor-not-allowed',
            )}
            aria-disabled={!formReady}
          >
            <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
            {L(locale, { ar: 'احجز عبر واتساب (الأسرع)', en: 'Book via WhatsApp (fastest)', ru: 'Через WhatsApp (быстрее)', it: 'Via WhatsApp (più veloce)' })}
          </a>

          {/* OR separator */}
          <div className="flex items-center gap-2 py-1">
            <span className="flex-1 h-px bg-accent/20" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold">
              {L(locale, { ar: 'أو', en: 'or', ru: 'или', it: 'o' })}
            </span>
            <span className="flex-1 h-px bg-accent/20" />
          </div>

          <button
            type="button"
            onClick={() => {
              if (!formReady) {
                if (!isNameValid) toast.error(L(locale, { ar: 'أدخل اسمك من فضلك', en: 'Please enter your name', ru: 'Введите имя', it: 'Inserisci il nome' }) as string);
                else if (!isPhoneValid) toast.error(L(locale, { ar: 'رقم هاتف غير صحيح', en: 'Invalid phone number', ru: 'Неверный телефон', it: 'Numero non valido' }) as string);
                else if (!isEmailValid) toast.error(L(locale, { ar: 'البريد الإلكتروني غير صحيح', en: 'Invalid email', ru: 'Неверный email', it: 'Email non valida' }) as string);
                return;
              }
              setShowPayModal(true);
            }}
            className={cn(
              'inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl font-bold text-sm transition-all group border-2',
              formReady
                ? 'bg-accent text-primary border-accent hover:bg-accent-400 hover:-translate-y-0.5 shadow-lg shadow-accent/30'
                : 'bg-muted text-muted-foreground border-muted cursor-not-allowed',
            )}
          >
            <CreditCard className="h-4 w-4" />
            {L(locale, { ar: 'احجز وارفع إيصال الدفع', en: 'Book & upload receipt', ru: 'Бронь с чеком', it: 'Prenota con ricevuta' })}
          </button>

          <a
            href="tel:+201090767278"
            className="inline-flex items-center justify-center gap-2 w-full h-10 rounded-xl border border-accent/30 hover:bg-accent/5 hover:border-accent text-primary font-bold text-sm transition-colors"
          >
            <Phone className="h-3.5 w-3.5 text-accent" />
            {L(locale, { ar: 'اتصل بنا الآن', en: 'Call us now', ru: 'Позвонить', it: 'Chiama ora' })}
          </a>
        </div>

        {showPayModal && formReady && (
          <BookingPayModal
            trip={trip}
            payload={{
              fullName: nameClean,
              email: emailClean,
              phone: phoneClean,
              date,
              adults,
              children: showChildrenCounter ? children : 0,
              isLocal,
              travelerType,
              isMarried,
              notes: notes.trim() || undefined,
            }}
            total={total}
            currency={fromCurrency}
            onClose={() => setShowPayModal(false)}
            onSuccess={() => { /* keep modal open showing success */ }}
          />
        )}

        {/* Trust footer */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 pt-2 text-[10px] text-muted-foreground">
          <TrustPill icon={ShieldCheck} text={L(locale, { ar: 'إلغاء مجاني', en: 'Free cancellation', ru: 'Бесплатная отмена', it: 'Cancellazione gratuita' }) as string} />
          <TrustPill icon={Sparkles} text={L(locale, { ar: 'تأكيد فوري', en: 'Instant reply', ru: 'Мгновенный ответ', it: 'Risposta immediata' }) as string} />
          <TrustPill icon={BadgeCheck} text={L(locale, { ar: 'مرخصة', en: 'Licensed', ru: 'Лицензия', it: 'Autorizzato' }) as string} />
        </div>
      </div>
    </motion.div>
  );
}

// ----------------------------------------------------------------------------
// Sub-components

function Section({
  title, icon: Icon, badge, children,
}: { title: string; icon: React.ComponentType<{ className?: string }>; badge?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center justify-between gap-2 mb-1.5">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary/80 uppercase tracking-wider">
          <Icon className="h-3 w-3 text-accent" />
          {title}
        </span>
        {badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent-700 font-bold tabular-nums">
            {badge}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function FieldRow({
  icon: Icon, required, children,
}: { icon: React.ComponentType<{ className?: string }>; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/30 border border-accent/15 ps-3 focus-within:border-accent/50 focus-within:bg-white transition-colors">
      <Icon className="h-4 w-4 text-accent/70 shrink-0" />
      <div className="flex-1 min-w-0">{children}</div>
      {required && <span className="px-2 text-accent text-xs font-bold">*</span>}
    </div>
  );
}

function Counter({
  icon: Icon, label, sublabel, value, setValue, min, max,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; sublabel?: string;
  value: number; setValue: (v: number) => void;
  min: number; max: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-1">
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

function TrustPill({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="h-3 w-3 text-emerald-600" />
      {text}
    </span>
  );
}
