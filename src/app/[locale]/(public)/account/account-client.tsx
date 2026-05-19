'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import {
  Calendar, Heart, CreditCard, MessageCircle, LogOut, Loader2, MapPin, Clock,
  Users, CheckCircle2, AlertCircle, XCircle, FileCheck2, ImageIcon, ExternalLink,
  Smartphone, Send, Banknote, Receipt, ArrowUpRight, Copy, Check, Phone,
  TrendingUp, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { L, localeToApiCode, cn } from '@/lib/utils';
import { useCustomer } from '@/lib/customer-auth';
import { API_BASE } from '@/lib/api';
import { Price } from '@/components/public/price';
import { ImageLightbox } from '@/components/public/image-lightbox';
import { toast } from 'sonner';

interface PaymentItem {
  id: number;
  amount: string;
  currency: 'EGP' | 'USD';
  method: 'VODAFONE_CASH' | 'INSTAPAY' | 'BANK_TRANSFER' | 'CASH' | 'STRIPE';
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';
  screenshotUrl?: string | null;
  confirmedAt?: string | null;
  createdAt: string;
  notes?: string | null;
}

interface BookingItem {
  id: number;
  reference: string;
  bookingDate: string;
  adultsCount: number;
  childrenCount: number;
  total: string;
  currency: 'EGP' | 'USD';
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';
  createdAt: string;
  payments: PaymentItem[];
  trip: {
    slug: string;
    durationMinutes: number;
    meetingPoint?: string | null;
    translations: Array<{ locale: string; title: string }>;
    heroImage?: { url: string; thumbnailUrl?: string | null; mediumUrl?: string | null } | null;
  };
}

interface FavTrip {
  id: number;
  slug: string;
  translations: Array<{ locale: string; title: string }>;
  heroImage?: { url: string; mediumUrl?: string | null; thumbnailUrl?: string | null } | null;
  priceLocalEGP: string;
}

const STATUS_META: Record<BookingItem['status'], {
  ar: string; en: string; ru: string; it: string;
  badge: string; ring: string; icon: typeof CheckCircle2;
}> = {
  PENDING:   { ar: 'قيد المراجعة', en: 'Pending',   ru: 'Ожидание', it: 'In attesa', badge: 'bg-amber-500/15 text-amber-700 border-amber-500/40', ring: 'ring-amber-500/30', icon: Clock },
  CONFIRMED: { ar: 'مؤكد',        en: 'Confirmed', ru: 'Подтверждено', it: 'Confermato', badge: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/40', ring: 'ring-emerald-500/30', icon: CheckCircle2 },
  CANCELLED: { ar: 'ملغي',        en: 'Cancelled', ru: 'Отменено', it: 'Annullato', badge: 'bg-red-500/15 text-red-700 border-red-500/40', ring: 'ring-red-500/30', icon: XCircle },
  COMPLETED: { ar: 'مكتمل',       en: 'Completed', ru: 'Завершено', it: 'Completato', badge: 'bg-blue-500/15 text-blue-700 border-blue-500/40', ring: 'ring-blue-500/30', icon: Star },
};

const PAYMENT_STATUS_META: Record<PaymentItem['status'], {
  ar: string; en: string; ru: string; it: string; badge: string; dot: string;
}> = {
  UNPAID:   { ar: 'لم يُدفع', en: 'Unpaid',  ru: 'Не оплачено', it: 'Non pagato', badge: 'bg-red-500/12 text-red-700 border-red-500/30', dot: 'bg-red-500' },
  PARTIAL:  { ar: 'جزئي',    en: 'Partial', ru: 'Частично',     it: 'Parziale',    badge: 'bg-amber-500/12 text-amber-700 border-amber-500/30', dot: 'bg-amber-500' },
  PAID:     { ar: 'مدفوع',   en: 'Paid',    ru: 'Оплачено',     it: 'Pagato',      badge: 'bg-emerald-500/12 text-emerald-700 border-emerald-500/30', dot: 'bg-emerald-500' },
  REFUNDED: { ar: 'مُستردّ',  en: 'Refunded', ru: 'Возвращено',  it: 'Rimborsato',  badge: 'bg-blue-500/12 text-blue-700 border-blue-500/30', dot: 'bg-blue-500' },
};

const PAYMENT_METHOD_META: Record<PaymentItem['method'], {
  ar: string; en: string; ru: string; it: string; icon: typeof Smartphone; color: string;
}> = {
  VODAFONE_CASH:  { ar: 'فودافون كاش',  en: 'Vodafone Cash', ru: 'Vodafone Cash', it: 'Vodafone Cash', icon: Smartphone, color: 'bg-red-500/10 text-red-700' },
  INSTAPAY:       { ar: 'إنستا باي',    en: 'InstaPay',      ru: 'InstaPay',      it: 'InstaPay',      icon: Send,       color: 'bg-purple-500/10 text-purple-700' },
  BANK_TRANSFER:  { ar: 'تحويل بنكي',   en: 'Bank transfer', ru: 'Банк',          it: 'Bonifico',      icon: CreditCard, color: 'bg-blue-500/10 text-blue-700' },
  CASH:           { ar: 'نقدي',         en: 'Cash',          ru: 'Наличные',      it: 'Contanti',      icon: Banknote,   color: 'bg-emerald-500/10 text-emerald-700' },
  STRIPE:         { ar: 'بطاقة',        en: 'Card',          ru: 'Карта',         it: 'Carta',         icon: CreditCard, color: 'bg-indigo-500/10 text-indigo-700' },
};

function daysUntil(iso: string): number {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar-EG' : locale, {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function AccountClient({ locale }: { locale: string }) {
  const router = useRouter();
  const { customer, loading, logout } = useCustomer();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [favorites, setFavorites] = useState<FavTrip[]>([]);
  const [tab, setTab] = useState<'bookings' | 'favorites' | 'payments' | 'messages'>('bookings');
  const [busy, setBusy] = useState(false);
  const [lightbox, setLightbox] = useState<{ open: boolean; src: string; caption: string }>({ open: false, src: '', caption: '' });
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const isAr = locale === 'ar';

  useEffect(() => {
    if (loading) return;
    if (!customer) {
      router.replace(`/${locale}/login?next=/${locale}/account`);
      return;
    }
    (async () => {
      setBusy(true);
      try {
        const [bRes, fRes] = await Promise.all([
          fetch(`${API_BASE}/auth/customer/me/bookings`, { credentials: 'include' }).then((r) => r.json()),
          fetch(`${API_BASE}/auth/customer/me/favorites`, { credentials: 'include' }).then((r) => r.json()),
        ]);
        if (bRes?.ok) setBookings(bRes.data.items || []);
        if (fRes?.ok) setFavorites(fRes.data.items || []);
      } finally {
        setBusy(false);
      }
    })();
  }, [customer, loading, locale, router]);

  // ===== Derived data =====
  const allPayments = useMemo(
    () =>
      bookings.flatMap((b) =>
        (b.payments || []).map((p) => ({ ...p, booking: b })),
      ).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [bookings],
  );

  const stats = useMemo(() => {
    const upcoming = bookings.filter((b) => b.status !== 'CANCELLED' && daysUntil(b.bookingDate) >= 0).length;
    const totalSpent = bookings
      .filter((b) => b.paymentStatus === 'PAID' || b.paymentStatus === 'PARTIAL')
      .reduce((acc, b) => acc + Number(b.total), 0);
    const totalSpentCurrency = bookings.find((b) => b.paymentStatus === 'PAID' || b.paymentStatus === 'PARTIAL')?.currency || 'EGP';
    const paidCount = allPayments.filter((p) => p.status === 'PAID').length;
    return { upcoming, totalSpent, totalSpentCurrency, paidCount };
  }, [bookings, allPayments]);

  if (loading || !customer) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  const tripTitle = (t: BookingItem['trip'] | FavTrip) => {
    const code = localeToApiCode(locale);
    return t.translations.find((tt) => tt.locale === code)?.title || t.translations[0]?.title || t.slug;
  };

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}`);
  };

  const copyReference = async (ref: string) => {
    try {
      await navigator.clipboard.writeText(ref);
      setCopiedRef(ref);
      setTimeout(() => setCopiedRef(null), 1500);
      toast.success(L(locale, { ar: 'تم النسخ', en: 'Copied', ru: 'Скопировано', it: 'Copiato' }) as string);
    } catch { /* ignore */ }
  };

  const openReceipt = (url: string, ref: string) => {
    if (url.toLowerCase().endsWith('.pdf')) {
      window.open(url, '_blank', 'noopener');
      return;
    }
    setLightbox({
      open: true,
      src: url,
      caption: `${L(locale, { ar: 'إيصال', en: 'Receipt', ru: 'Чек', it: 'Ricevuta' }) as string} — ${ref}`,
    });
  };

  return (
    <main className="min-h-screen bg-cream">
      {/* Header band */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary to-primary-900 text-cream py-10 md:py-14 overflow-hidden">
        <div className="absolute -top-32 -end-32 w-96 h-96 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -start-20 w-72 h-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="container relative">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {customer.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={customer.avatarUrl} alt="" className="w-16 h-16 rounded-full border-2 border-accent/40 shadow-lg ring-4 ring-accent/15" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-accent/15 border-2 border-accent/40 flex items-center justify-center text-accent text-xl font-bold ring-4 ring-accent/15">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-xs text-accent uppercase tracking-[0.25em] font-bold mb-0.5">
                  {L(locale, { ar: 'أهلاً بك', en: 'Welcome', ru: 'Добро пожаловать', it: 'Benvenuto' })}
                </div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold leading-tight">{customer.name}</h1>
                <div className="text-xs text-cream/65 mt-0.5" dir="ltr">{customer.email}</div>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="border-cream/25 text-cream hover:bg-cream/10 hover:text-cream">
              <LogOut className="h-4 w-4" />
              {L(locale, { ar: 'تسجيل الخروج', en: 'Sign out', ru: 'Выйти', it: 'Esci' })}
            </Button>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-7">
            <StatCard
              icon={Calendar}
              label={L(locale, { ar: 'إجمالي الحجوزات', en: 'Total bookings', ru: 'Всего броней', it: 'Prenotazioni' }) as string}
              value={bookings.length.toString()}
            />
            <StatCard
              icon={TrendingUp}
              label={L(locale, { ar: 'رحلات قادمة', en: 'Upcoming', ru: 'Предстоящие', it: 'Imminenti' }) as string}
              value={stats.upcoming.toString()}
              highlight
            />
            <StatCard
              icon={CheckCircle2}
              label={L(locale, { ar: 'مدفوعات مؤكدة', en: 'Confirmed payments', ru: 'Подтверждено', it: 'Confermati' }) as string}
              value={stats.paidCount.toString()}
            />
            <StatCard
              icon={Heart}
              label={L(locale, { ar: 'المفضلات', en: 'Favorites', ru: 'Избранное', it: 'Preferiti' }) as string}
              value={favorites.length.toString()}
            />
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="container -mt-5 mb-6 relative z-10">
        <div className="bg-white rounded-2xl border border-accent/15 shadow-lg p-1.5 inline-flex items-center gap-1 flex-wrap overflow-x-auto max-w-full">
          {[
            { k: 'bookings',  icon: Calendar,      ar: 'حجوزاتي',   en: 'My bookings',  ru: 'Брони',     it: 'Prenotazioni', count: bookings.length },
            { k: 'payments',  icon: CreditCard,    ar: 'المدفوعات', en: 'Payments',     ru: 'Оплаты',    it: 'Pagamenti',    count: allPayments.length },
            { k: 'favorites', icon: Heart,         ar: 'المفضلات',  en: 'Favorites',    ru: 'Избранное', it: 'Preferiti',    count: favorites.length },
            { k: 'messages',  icon: MessageCircle, ar: 'الرسائل',  en: 'Messages',     ru: 'Чат',       it: 'Messaggi',     count: 0 },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.k;
            return (
              <button
                key={t.k}
                onClick={() => setTab(t.k as typeof tab)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors',
                  active ? 'bg-primary text-cream shadow' : 'text-primary/70 hover:bg-muted',
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{L(locale, t) as string}</span>
                {t.count > 0 && (
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums',
                    active ? 'bg-accent text-primary' : 'bg-accent/15 text-accent-700',
                  )}>
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="container pb-16 space-y-4">
        {busy && <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />}

        {/* ===== BOOKINGS ===== */}
        {tab === 'bookings' && !busy && (
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title={L(locale, { ar: 'مفيش حجوزات لحد دلوقتي', en: 'No bookings yet', ru: 'Пока нет броней', it: 'Nessuna prenotazione' })}
                desc={L(locale, { ar: 'تصفح الرحلات واحجز أول مغامرة معانا', en: 'Browse our trips and book your first adventure', ru: 'Просмотрите туры и забронируйте', it: 'Sfoglia i tour' })}
                cta={L(locale, { ar: 'تصفح الرحلات', en: 'Browse trips', ru: 'Туры', it: 'Tour' })}
                href={`/${locale}/trips`}
              />
            ) : (
              bookings.map((b) => {
                const status = STATUS_META[b.status];
                const StatusIcon = status.icon;
                const paymentMeta = PAYMENT_STATUS_META[b.paymentStatus];
                const days = daysUntil(b.bookingDate);
                const isUpcoming = b.status !== 'CANCELLED' && days >= 0;

                let countdownText = '';
                let countdownTone: 'soon' | 'normal' | 'past' = 'past';
                if (b.status === 'CANCELLED') {
                  countdownText = '';
                } else if (days === 0) {
                  countdownText = L(locale, { ar: 'اليوم!', en: 'Today!', ru: 'Сегодня!', it: 'Oggi!' }) as string;
                  countdownTone = 'soon';
                } else if (days > 0 && days <= 3) {
                  countdownText = L(locale, { ar: `بعد ${days} ${days === 1 ? 'يوم' : 'أيام'}`, en: `In ${days} day${days === 1 ? '' : 's'}`, ru: `Через ${days} дн.`, it: `Tra ${days} giorni` }) as string;
                  countdownTone = 'soon';
                } else if (days > 3) {
                  countdownText = L(locale, { ar: `بعد ${days} يوم`, en: `In ${days} days`, ru: `Через ${days} дней`, it: `Tra ${days} giorni` }) as string;
                  countdownTone = 'normal';
                }

                const lastPayment = b.payments?.[b.payments.length - 1];
                const receiptUrl = lastPayment?.screenshotUrl;
                const waLink = `https://wa.me/201090767278?text=${encodeURIComponent(`Booking ${b.reference} — ${tripTitle(b.trip)}`)}`;

                return (
                  <div
                    key={b.id}
                    className={cn(
                      'group relative bg-white rounded-2xl border border-accent/15 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all',
                      isUpcoming && b.status === 'CONFIRMED' && 'ring-2 ring-emerald-500/20',
                    )}
                  >
                    {/* Top accent strip */}
                    <div className={cn(
                      'h-1 w-full',
                      b.status === 'CONFIRMED' && 'bg-gradient-to-r from-emerald-400 to-emerald-600',
                      b.status === 'PENDING' && 'bg-gradient-to-r from-amber-400 to-amber-600',
                      b.status === 'CANCELLED' && 'bg-gradient-to-r from-red-400 to-red-600',
                      b.status === 'COMPLETED' && 'bg-gradient-to-r from-blue-400 to-blue-600',
                    )} />

                    <div className="grid md:grid-cols-[200px_1fr_auto] gap-4 p-4">
                      {/* Hero image */}
                      <Link href={`/trips/${b.trip.slug}`} className="relative w-full md:w-48 h-40 md:h-32 rounded-xl overflow-hidden bg-muted shrink-0 group/img">
                        {b.trip.heroImage?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={b.trip.heroImage.mediumUrl || b.trip.heroImage.url}
                            alt=""
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-accent/40">
                            <ImageIcon className="h-10 w-10" />
                          </div>
                        )}
                        {countdownText && (
                          <div className={cn(
                            'absolute top-2 start-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border',
                            countdownTone === 'soon' ? 'bg-accent/90 text-primary border-accent' : 'bg-cream/85 text-primary border-white',
                          )}>
                            <Clock className="h-3 w-3" />
                            {countdownText}
                          </div>
                        )}
                      </Link>

                      {/* Middle: details */}
                      <div className="min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <Link
                            href={`/trips/${b.trip.slug}`}
                            className="font-serif font-bold text-lg leading-tight hover:text-accent-700 transition-colors min-w-0"
                          >
                            {tripTitle(b.trip)}
                          </Link>
                          <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap', status.badge)}>
                            <StatusIcon className="h-3 w-3" />
                            {L(locale, status) as string}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-accent" />
                            {formatDate(b.bookingDate, locale)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-accent" />
                            {b.adultsCount + b.childrenCount} {L(locale, { ar: 'مسافر', en: 'guests', ru: 'гостей', it: 'ospiti' })}
                          </span>
                          {b.trip.meetingPoint && (
                            <span className="inline-flex items-center gap-1 truncate max-w-[160px]">
                              <MapPin className="h-3.5 w-3.5 text-accent" />
                              <span className="truncate">{b.trip.meetingPoint}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border', paymentMeta.badge)}>
                            <span className={cn('h-1.5 w-1.5 rounded-full', paymentMeta.dot)} />
                            {L(locale, paymentMeta) as string}
                          </span>
                          <button
                            onClick={() => copyReference(b.reference)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono font-bold border border-accent/20 bg-muted/40 hover:bg-accent/10 hover:border-accent/40 transition-colors"
                            title={L(locale, { ar: 'نسخ المرجع', en: 'Copy reference', ru: 'Копировать', it: 'Copia' }) as string}
                          >
                            {copiedRef === b.reference ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                            {b.reference}
                          </button>
                          {receiptUrl && (
                            <button
                              onClick={() => openReceipt(receiptUrl, b.reference)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 transition-colors"
                            >
                              <FileCheck2 className="h-3 w-3" />
                              {L(locale, { ar: 'إيصال', en: 'Receipt', ru: 'Чек', it: 'Ricevuta' })}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Right: total + actions */}
                      <div className="md:text-end space-y-2 md:min-w-[140px]">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                            {L(locale, { ar: 'الإجمالي', en: 'Total', ru: 'Итого', it: 'Totale' })}
                          </div>
                          <div className="font-serif text-2xl font-bold text-accent-700 leading-none">
                            <Price amount={Number(b.total)} from={b.currency} />
                          </div>
                        </div>
                        <div className="flex md:flex-col gap-1.5">
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#25D366] text-white text-[11px] font-bold hover:bg-[#1ea954] transition-colors"
                          >
                            <MessageCircle className="h-3 w-3" />
                            {L(locale, { ar: 'استفسر', en: 'Ask', ru: 'Спросить', it: 'Chiedi' })}
                          </a>
                          <Link
                            href={`/trips/${b.trip.slug}`}
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-accent/30 text-primary text-[11px] font-bold hover:bg-accent/5 hover:border-accent/60 transition-colors"
                          >
                            <ArrowUpRight className="h-3 w-3" />
                            {L(locale, { ar: 'تفاصيل', en: 'Details', ru: 'Детали', it: 'Dettagli' })}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ===== PAYMENTS ===== */}
        {tab === 'payments' && !busy && (
          <div className="space-y-3">
            {allPayments.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title={L(locale, { ar: 'مفيش مدفوعات بعد', en: 'No payments yet', ru: 'Нет оплат', it: 'Nessun pagamento' })}
                desc={L(locale, {
                  ar: 'اعمل أول حجز عشان تظهر مدفوعاتك هنا',
                  en: 'Make your first booking to see payments here',
                  ru: 'Сделайте первую бронь',
                  it: 'Prenota per vedere i pagamenti',
                })}
                cta={L(locale, { ar: 'تصفح الرحلات', en: 'Browse trips', ru: 'Туры', it: 'Tour' })}
                href={`/${locale}/trips`}
              />
            ) : (
              <>
                {/* Payment summary */}
                <div className="bg-gradient-to-br from-primary/95 via-primary to-primary-900 text-cream rounded-2xl p-5 shadow-lg relative overflow-hidden">
                  <div className="absolute -top-16 -end-16 w-44 h-44 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
                  <div className="relative flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.25em] text-accent font-bold">
                        {L(locale, { ar: 'إجمالي المدفوعات المؤكدة', en: 'Total confirmed payments', ru: 'Подтверждённые оплаты', it: 'Pagamenti confermati' })}
                      </div>
                      <div className="font-serif text-3xl md:text-4xl font-bold text-shimmer-gold mt-1 leading-none">
                        <Price amount={stats.totalSpent} from={stats.totalSpentCurrency as 'EGP' | 'USD'} />
                      </div>
                      <div className="text-xs text-cream/70 mt-1">
                        {stats.paidCount} {L(locale, { ar: 'عملية مدفوعة', en: 'paid transactions', ru: 'оплачено', it: 'pagati' })}
                      </div>
                    </div>
                    <Receipt className="h-12 w-12 text-accent/40 hidden sm:block" />
                  </div>
                </div>

                {/* Payments list */}
                <div className="bg-white rounded-2xl border border-accent/15 overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-accent/15 bg-muted/20 flex items-center justify-between">
                    <h3 className="font-serif font-bold text-primary text-base inline-flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-accent" />
                      {L(locale, { ar: 'سجل المدفوعات', en: 'Payment history', ru: 'История оплат', it: 'Storico pagamenti' })}
                    </h3>
                    <span className="text-xs text-muted-foreground tabular-nums font-bold">{allPayments.length}</span>
                  </div>
                  <ul className="divide-y divide-accent/10">
                    {allPayments.map((p) => {
                      const method = PAYMENT_METHOD_META[p.method];
                      const status = PAYMENT_STATUS_META[p.status];
                      const MIcon = method.icon;
                      const bookingTitle = tripTitle(p.booking.trip);
                      return (
                        <li
                          key={p.id}
                          className="p-4 hover:bg-accent/3 transition-colors"
                        >
                          <div className="flex items-start gap-3 flex-wrap sm:flex-nowrap">
                            {/* Method icon */}
                            <div className={cn(
                              'inline-flex items-center justify-center w-11 h-11 rounded-xl shrink-0',
                              method.color,
                            )}>
                              <MIcon className="h-5 w-5" />
                            </div>

                            {/* Main */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="min-w-0">
                                  <div className="font-bold text-primary text-sm leading-tight truncate">
                                    {L(locale, method) as string}
                                  </div>
                                  <Link
                                    href={`/trips/${p.booking.trip.slug}`}
                                    className="text-xs text-muted-foreground hover:text-accent-700 truncate inline-block max-w-full"
                                  >
                                    {bookingTitle}
                                  </Link>
                                </div>
                                <div className="text-end">
                                  <div className="font-serif text-xl font-bold text-primary leading-none">
                                    <Price amount={Number(p.amount)} from={p.currency} />
                                  </div>
                                </div>
                              </div>

                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border', status.badge)}>
                                  <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
                                  {L(locale, status) as string}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(p.createdAt, locale)}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                                  #{p.booking.reference}
                                </span>
                                {p.confirmedAt && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                                    <CheckCircle2 className="h-3 w-3" />
                                    {L(locale, { ar: 'تأكد', en: 'Confirmed', ru: 'Подтверждено', it: 'Confermato' })}
                                  </span>
                                )}
                                {p.screenshotUrl && (
                                  <button
                                    onClick={() => openReceipt(p.screenshotUrl!, p.booking.reference)}
                                    className="ms-auto inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border border-accent/25 bg-accent/8 text-accent-700 hover:bg-accent/15 hover:border-accent/50 transition-colors"
                                  >
                                    {p.screenshotUrl.toLowerCase().endsWith('.pdf') ? (
                                      <ExternalLink className="h-3 w-3" />
                                    ) : (
                                      <FileCheck2 className="h-3 w-3" />
                                    )}
                                    {L(locale, { ar: 'الإيصال', en: 'Receipt', ru: 'Чек', it: 'Ricevuta' })}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <p className="text-[11px] text-muted-foreground text-center inline-flex items-center justify-center gap-1.5 w-full">
                  <AlertCircle className="h-3 w-3" />
                  {L(locale, {
                    ar: 'لو في مشكلة في أي دفعة، تواصل معانا عبر واتساب.',
                    en: 'Issues with any payment? Reach out on WhatsApp.',
                    ru: 'Проблемы с оплатой? Напишите в WhatsApp.',
                    it: 'Problemi con un pagamento? WhatsApp.',
                  })}
                  <a
                    href="https://wa.me/201090767278"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-0.5"
                  >
                    <Phone className="h-3 w-3" />
                    +20 109 076 7278
                  </a>
                </p>
              </>
            )}
          </div>
        )}

        {/* ===== FAVORITES ===== */}
        {tab === 'favorites' && !busy && (
          <div>
            {favorites.length === 0 ? (
              <EmptyState
                icon={Heart}
                title={L(locale, { ar: 'لا مفضلات بعد', en: 'No favorites yet', ru: 'Нет избранного', it: 'Nessun preferito' })}
                desc={L(locale, { ar: 'اضغط على القلب فى أي رحلة لإضافتها لمفضلاتك', en: 'Tap the heart on any trip to save it', ru: 'Нажмите ♥ на туре', it: 'Tocca ♥ su un tour' })}
                cta={L(locale, { ar: 'تصفح الرحلات', en: 'Browse trips', ru: 'Туры', it: 'Tour' })}
                href={`/${locale}/trips`}
              />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((t) => (
                  <Link key={t.id} href={`/trips/${t.slug}`} className="group block bg-white rounded-2xl border border-accent/15 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all">
                    <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                      {t.heroImage?.url && (
                        <Image
                          src={t.heroImage.mediumUrl || t.heroImage.url}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute top-3 end-3 w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg">
                        <Heart className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif font-bold text-base leading-tight mb-1 group-hover:text-accent-700 transition-colors">{tripTitle(t)}</h3>
                      <div className="text-sm font-bold text-accent-700 inline-flex items-center gap-1">
                        <span className="text-[10px] uppercase text-muted-foreground font-bold">{L(locale, { ar: 'من', en: 'from', ru: 'от', it: 'da' })}</span>
                        <Price amount={Number(t.priceLocalEGP)} from="EGP" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== MESSAGES ===== */}
        {tab === 'messages' && !busy && (
          <EmptyState
            icon={MessageCircle}
            title={L(locale, { ar: 'الرسائل قريباً', en: 'Messages coming soon', ru: 'Сообщения скоро', it: 'Messaggi presto' })}
            desc={L(locale, {
              ar: 'هتقدر تبعت رسائل مباشرة للمرشد السياحي من هنا. لحد ما الميزة دي تنزل، تواصل معانا عبر واتساب.',
              en: 'Direct chat with your guide is coming. For now, reach us on WhatsApp.',
              ru: 'Чат с гидом скоро. Пока пишите в WhatsApp.',
              it: 'Chat con la guida in arrivo. Per ora WhatsApp.',
            })}
            cta={L(locale, { ar: 'واتساب', en: 'WhatsApp', ru: 'WhatsApp', it: 'WhatsApp' })}
            href="https://wa.me/201090767278"
            external
          />
        )}
      </div>

      <ImageLightbox
        images={[lightbox.src]}
        open={lightbox.open}
        onClose={() => setLightbox({ open: false, src: '', caption: '' })}
        caption={lightbox.caption}
      />
    </main>
  );
}

// ---------------------------------------------------------------------------
// Sub-components

function StatCard({
  icon: Icon, label, value, highlight,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      'relative rounded-xl px-3 py-2.5 backdrop-blur border transition-colors',
      highlight
        ? 'bg-accent/15 border-accent/40 text-cream'
        : 'bg-cream/8 border-cream/15 text-cream/95 hover:bg-cream/12',
    )}>
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', highlight ? 'text-accent' : 'text-cream/70')} />
        <div className="text-[10px] uppercase tracking-wider font-bold leading-tight">
          {label}
        </div>
      </div>
      <div className="font-serif text-2xl font-bold tabular-nums leading-none mt-1.5">{value}</div>
    </div>
  );
}

function EmptyState({
  icon: Icon, title, desc, cta, href, onClick, external,
}: {
  icon?: typeof Calendar;
  title: string; desc: string; cta: string;
  href?: string; onClick?: () => void; external?: boolean;
}) {
  const I = Icon || MapPin;
  const Wrap = href
    ? ({ children }: { children: React.ReactNode }) => (
        <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener' : undefined}>{children}</a>
      )
    : ({ children }: { children: React.ReactNode }) => <button onClick={onClick}>{children}</button>;
  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-accent/25 p-10 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-3">
        <I className="h-8 w-8 text-accent/60" />
      </div>
      <h3 className="font-serif text-xl font-bold mb-2 text-primary">{title}</h3>
      <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto leading-relaxed">{desc}</p>
      <Wrap>
        <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-cream font-bold text-sm hover:bg-primary-900 transition-colors">
          {cta} <ArrowUpRight className="h-4 w-4 rtl:rotate-90" />
        </span>
      </Wrap>
    </div>
  );
}
