'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import {
  Calendar, Heart, CreditCard, MessageCircle, LogOut, Loader2, MapPin, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { L, localeToApiCode } from '@/lib/utils';
import { useCustomer } from '@/lib/customer-auth';
import { API_BASE } from '@/lib/api';
import { Price } from '@/components/public/price';

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
  trip: {
    slug: string;
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

const STATUS_LABEL: Record<BookingItem['status'], { ar: string; en: string; color: string }> = {
  PENDING:   { ar: 'قيد المراجعة', en: 'Pending',   color: 'bg-amber-500/15 text-amber-700 border-amber-500/30' },
  CONFIRMED: { ar: 'مؤكد',        en: 'Confirmed', color: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' },
  CANCELLED: { ar: 'ملغي',        en: 'Cancelled', color: 'bg-red-500/15 text-red-700 border-red-500/30' },
  COMPLETED: { ar: 'مكتمل',       en: 'Completed', color: 'bg-blue-500/15 text-blue-700 border-blue-500/30' },
};

export function AccountClient({ locale }: { locale: string }) {
  const router = useRouter();
  const { customer, loading, logout } = useCustomer();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [favorites, setFavorites] = useState<FavTrip[]>([]);
  const [tab, setTab] = useState<'bookings' | 'favorites' | 'payments' | 'messages'>('bookings');
  const [busy, setBusy] = useState(false);
  const isAr = locale === 'ar';

  useEffect(() => {
    if (loading) return;
    if (!customer) {
      router.replace(`/${locale}/login?next=/${locale}/account`);
      return;
    }
    // Fetch bookings + favourites in parallel
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

  return (
    <main className="min-h-screen bg-cream">
      {/* Header band */}
      <section className="bg-gradient-to-br from-primary-900 via-primary to-primary-900 text-cream py-10 md:py-14">
        <div className="container">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {customer.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={customer.avatarUrl} alt="" className="w-16 h-16 rounded-full border-2 border-accent/40 shadow-lg" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-accent/15 border-2 border-accent/40 flex items-center justify-center text-accent text-xl font-bold">
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
        </div>
      </section>

      {/* Tabs */}
      <div className="container -mt-6 mb-8 relative z-10">
        <div className="bg-white rounded-2xl border border-accent/15 shadow-lg p-1 inline-flex items-center gap-1 flex-wrap">
          {[
            { k: 'bookings',  icon: Calendar,      ar: 'حجوزاتي',   en: 'My bookings',  count: bookings.length },
            { k: 'favorites', icon: Heart,         ar: 'المفضلات',  en: 'Favourites',   count: favorites.length },
            { k: 'payments',  icon: CreditCard,    ar: 'المدفوعات', en: 'Payments',     count: bookings.filter((b) => b.paymentStatus !== 'UNPAID').length },
            { k: 'messages',  icon: MessageCircle, ar: 'الرسائل',  en: 'Messages',     count: 0 },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.k;
            return (
              <button
                key={t.k}
                onClick={() => setTab(t.k as typeof tab)}
                className={
                  'inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-sm font-bold transition-colors ' +
                  (active ? 'bg-primary text-cream shadow' : 'text-primary/70 hover:bg-muted')
                }
              >
                <Icon className="h-4 w-4" />
                <span>{isAr ? t.ar : t.en}</span>
                {t.count > 0 && (
                  <span className={'text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums ' + (active ? 'bg-accent text-primary' : 'bg-accent/15 text-accent-700')}>
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="container pb-16 space-y-6">
        {busy && <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />}

        {tab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <EmptyState
                title={L(locale, { ar: 'مفيش حجوزات لحد دلوقتي', en: 'No bookings yet', ru: 'Пока нет броней', it: 'Nessuna prenotazione' })}
                desc={L(locale, { ar: 'تصفح الرحلات واحجز أول مغامرة', en: 'Browse trips and book your first adventure', ru: 'Просмотрите туры и забронируйте', it: 'Sfoglia i tour' })}
                cta={L(locale, { ar: 'تصفح الرحلات', en: 'Browse trips', ru: 'Туры', it: 'Tour' })}
                href={`/${locale}/trips`}
              />
            ) : (
              bookings.map((b) => {
                const status = STATUS_LABEL[b.status];
                return (
                  <div key={b.id} className="bg-white rounded-2xl border border-accent/15 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="grid md:grid-cols-[180px_1fr_auto] gap-4 p-4">
                      <div className="relative w-full md:w-44 h-32 md:h-28 rounded-xl overflow-hidden bg-muted shrink-0">
                        {b.trip.heroImage?.url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.trip.heroImage.mediumUrl || b.trip.heroImage.url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <Link href={`/trips/${b.trip.slug}`} className="font-bold text-lg leading-tight hover:text-accent-700">
                            {tripTitle(b.trip)}
                          </Link>
                          <span className={'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ' + status.color}>
                            {isAr ? status.ar : status.en}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(b.bookingDate).toLocaleDateString(isAr ? 'ar-EG' : 'en')}
                          </span>
                          <span>·</span>
                          <span>{b.adultsCount + b.childrenCount} {L(locale, { ar: 'شخص', en: 'guests', ru: 'гостей', it: 'ospiti' })}</span>
                          <span>·</span>
                          <span className="font-mono">{b.reference}</span>
                        </div>
                        <div className="mt-2 text-xs">
                          <span className="text-muted-foreground">{L(locale, { ar: 'حالة الدفع:', en: 'Payment:', ru: 'Оплата:', it: 'Pagamento:' })} </span>
                          <span className="font-bold">{b.paymentStatus}</span>
                        </div>
                      </div>
                      <div className="md:text-end space-y-1">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                          {L(locale, { ar: 'الإجمالي', en: 'Total', ru: 'Итого', it: 'Totale' })}
                        </div>
                        <div className="font-serif text-2xl font-bold text-accent-700">
                          <Price amount={Number(b.total)} from={b.currency} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'favorites' && (
          <div>
            {favorites.length === 0 ? (
              <EmptyState
                title={L(locale, { ar: 'لا مفضلات بعد', en: 'No favourites yet', ru: 'Нет избранного', it: 'Nessun preferito' })}
                desc={L(locale, { ar: 'اضغط على القلب فى أي رحلة لإضافتها', en: 'Tap the heart on any trip to save it', ru: 'Нажмите ♥ на туре', it: 'Tocca ♥ su un tour' })}
                cta={L(locale, { ar: 'تصفح الرحلات', en: 'Browse trips', ru: 'Туры', it: 'Tour' })}
                href={`/${locale}/trips`}
              />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((t) => (
                  <Link key={t.id} href={`/trips/${t.slug}`} className="block bg-white rounded-2xl border border-accent/15 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="relative aspect-[4/3] bg-muted">
                      {t.heroImage?.url && (
                        <Image src={t.heroImage.mediumUrl || t.heroImage.url} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold leading-tight mb-1">{tripTitle(t)}</h3>
                      <div className="text-sm font-bold text-accent-700">
                        <Price amount={Number(t.priceLocalEGP)} from="EGP" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'payments' && (
          <EmptyState
            title={L(locale, { ar: 'صفحة الدفعات قريباً', en: 'Payments coming soon', ru: 'Оплаты скоро', it: 'Pagamenti presto' })}
            desc={L(locale, { ar: 'هتقدر تتابع كل دفعاتك وتحفظ الإيصالات هنا قريباً', en: 'Track every payment and receipts here soon', ru: 'Отслеживание платежей скоро', it: 'Storico pagamenti in arrivo' })}
            cta={L(locale, { ar: 'ارجع للحجوزات', en: 'Back to bookings', ru: 'К броням', it: 'Prenotazioni' })}
            onClick={() => setTab('bookings')}
          />
        )}

        {tab === 'messages' && (
          <EmptyState
            title={L(locale, { ar: 'الرسائل قريباً', en: 'Messages coming soon', ru: 'Сообщения скоро', it: 'Messaggi presto' })}
            desc={L(locale, {
              ar: 'هتقدر تبعت رسائل مباشرة للمرشد السياحي من هنا. لحد ما الميزة دي تنزل، يمكنك التواصل عبر واتساب.',
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
    </main>
  );
}

function EmptyState({
  title, desc, cta, href, onClick, external,
}: {
  title: string; desc: string; cta: string;
  href?: string; onClick?: () => void; external?: boolean;
}) {
  const Wrap = href
    ? ({ children }: { children: React.ReactNode }) => (
        <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener' : undefined}>{children}</a>
      )
    : ({ children }: { children: React.ReactNode }) => <button onClick={onClick}>{children}</button>;
  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-accent/25 p-10 text-center">
      <MapPin className="h-10 w-10 text-accent/40 mx-auto mb-3" />
      <h3 className="font-serif text-xl font-bold mb-2 text-primary">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto leading-relaxed">{desc}</p>
      <Wrap>
        <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-cream font-bold text-sm hover:bg-primary-700 transition-colors">
          <Clock className="h-4 w-4" /> {cta}
        </span>
      </Wrap>
    </div>
  );
}
