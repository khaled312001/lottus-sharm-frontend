import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Reveal } from '@/components/public/motion';
import { Car, Bus, Plane, Building2, MapPin, Users, Clock, ArrowRight, MessageCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { L, localeToApiCode, buildWhatsAppLink, cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';

export const revalidate = 60;

interface TransferDTO {
  id: number;
  slug: string;
  route: string;
  vehicleType: 'SEDAN' | 'MICROBUS' | 'MINIBUS' | 'COACH' | 'FLIGHT';
  capacity: number;
  durationMinutes: number;
  priceLocalEGP: string;
  priceForeignUSD: string;
  isFeatured: boolean;
  region?: string;
  heroImage?: { url: string; mediumUrl?: string | null; thumbnailUrl?: string | null; type?: 'IMAGE' | 'VIDEO' } | null;
  tr?: { name: string; shortDesc: string };
}

const VEHICLE_META: Record<string, { icon: React.ComponentType<{ className?: string }>; ar: string; en: string; ru: string; it: string; de: string; color: string }> = {
  SEDAN:    { icon: Car,    ar: 'سيارة ملاكي',  en: 'Private sedan', ru: 'Седан',        it: 'Berlina',  de: 'Limousine',   color: 'from-blue-500 to-blue-700' },
  MICROBUS: { icon: Bus,    ar: 'ميكروباص',      en: 'Microbus',      ru: 'Микроавтобус', it: 'Microbus', de: 'Microbus',    color: 'from-emerald-500 to-emerald-700' },
  MINIBUS:  { icon: Bus,    ar: 'ميني باص',      en: 'Minibus',       ru: 'Минибус',      it: 'Minibus',  de: 'Minibus',     color: 'from-teal-500 to-teal-700' },
  COACH:    { icon: Bus,    ar: 'أوتوبيس كبير', en: 'Coach',         ru: 'Автобус',      it: 'Pullman',  de: 'Reisebus',    color: 'from-amber-500 to-amber-700' },
  FLIGHT:   { icon: Plane,  ar: 'طيران داخلي',  en: 'Flight',        ru: 'Авиаперелёт',  it: 'Volo',     de: 'Inlandsflug', color: 'from-rose-500 to-rose-700' },
};

const ROUTE_META: Record<string, { ar: string; en: string; ru: string; it: string; de: string }> = {
  AIRPORT_TO_HOTEL:     { ar: 'من المطار للفندق',         en: 'Airport → Hotel',        ru: 'Аэропорт → Отель',         it: 'Aeroporto → Hotel',        de: 'Flughafen → Hotel' },
  HOTEL_TO_AIRPORT:     { ar: 'من الفندق للمطار',         en: 'Hotel → Airport',        ru: 'Отель → Аэропорт',         it: 'Hotel → Aeroporto',        de: 'Hotel → Flughafen' },
  STATION_TO_HOTEL:     { ar: 'من المحطة للفندق',         en: 'Station → Hotel',        ru: 'Вокзал → Отель',           it: 'Stazione → Hotel',         de: 'Bahnhof → Hotel' },
  HOTEL_TO_STATION:     { ar: 'من الفندق للمحطة',         en: 'Hotel → Station',        ru: 'Отель → Вокзал',           it: 'Hotel → Stazione',         de: 'Hotel → Bahnhof' },
  CAIRO_SHARM_FLIGHT:   { ar: 'القاهرة → شرم الشيخ',     en: 'Cairo → Sharm El Sheikh',ru: 'Каир → Шарм-эль-Шейх',     it: 'Cairo → Sharm El Sheikh',  de: 'Kairo → Sharm El Sheikh' },
  SHARM_CAIRO_FLIGHT:   { ar: 'شرم الشيخ → القاهرة',     en: 'Sharm El Sheikh → Cairo',ru: 'Шарм-эль-Шейх → Каир',     it: 'Sharm El Sheikh → Cairo',  de: 'Sharm El Sheikh → Kairo' },
  INTRA_CITY:           { ar: 'تنقلات داخل المدينة',       en: 'In-town transfers',      ru: 'Городские трансферы',      it: 'Trasferimenti in città',   de: 'Transfers innerorts' },
  CUSTOM:               { ar: 'خدمة مخصصة',                en: 'Custom service',         ru: 'Индивидуальный',           it: 'Servizio personalizzato',  de: 'Individueller Service' },
};

function pickT<T extends { ar: string; en: string; ru: string; it: string; de?: string }>(o: T, locale: string): string {
  return (o as Record<string, string>)[locale] || o.de || o.en;
}

const TRANSFER_REGION_LABELS: Record<string, { ar: string; en: string; de: string; ru: string; it: string }> = {
  SHARM:    { ar: 'شرم الشيخ', en: 'Sharm El Sheikh', de: 'Sharm El Sheikh', ru: 'Шарм-эль-Шейх', it: 'Sharm El Sheikh' },
  HURGHADA: { ar: 'الغردقة',   en: 'Hurghada',        de: 'Hurghada',        ru: 'Хургада',        it: 'Hurghada' },
  DAHAB:    { ar: 'دهب',        en: 'Dahab',           de: 'Dahab',           ru: 'Дахаб',          it: 'Dahab' },
  CAIRO:    { ar: 'القاهرة',    en: 'Cairo',           de: 'Kairo',           ru: 'Каир',           it: 'Il Cairo' },
  MARSA_ALAM:{ ar: 'مرسى علم',  en: 'Marsa Alam',      de: 'Marsa Alam',      ru: 'Марса-Алам',     it: 'Marsa Alam' },
};

const ROUTE_GROUP_ORDER = [
  ['AIRPORT_TO_HOTEL', 'HOTEL_TO_AIRPORT'],
  ['CAIRO_SHARM_FLIGHT', 'SHARM_CAIRO_FLIGHT'],
  ['STATION_TO_HOTEL', 'HOTEL_TO_STATION'],
  ['INTRA_CITY'],
];

const GROUP_TITLES: Array<{ ar: string; en: string; ru: string; it: string; de: string; icon: React.ComponentType<{ className?: string }> }> = [
  { ar: 'استقبال وتوصيل المطار',       en: 'Airport pickup & drop-off',        ru: 'Встреча и проводы в аэропорту', it: 'Pickup e drop-off aeroporto', de: 'Flughafen-Abholung & -Transfer', icon: Car },
  { ar: 'طيران داخلي القاهرة / شرم',  en: 'Domestic flights (Cairo / Sharm)', ru: 'Внутренние рейсы Каир / Шарм',  it: 'Voli interni Cairo / Sharm',  de: 'Inlandsflüge (Kairo / Sharm)',   icon: Plane },
  { ar: 'محطات وموانئ',                en: 'Bus stations & ports',             ru: 'Автостанции и порты',           it: 'Stazioni e porti',            de: 'Bahnhöfe & Häfen',               icon: Building2 },
  { ar: 'تنقلات داخلية',                en: 'In-town transfers',                ru: 'Городские перемещения',         it: 'Trasferimenti in città',      de: 'Transfers innerorts',            icon: MapPin },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: L(locale, { ar: 'خدمات النقل والاستقبال — لوتس شرم', en: 'Transfers & airport pickups — Lotus Sharm', de: 'Transfers & Flughafenabholung — Lotus Sharm', ru: 'Трансферы — Lotus Sharm', it: 'Trasferimenti — Lotus Sharm' }),
    description: L(locale, {
      ar: 'استقبال المطار، توصيل الفندق، طيران داخلي، تنقلات بين المحطات. سيارات، ميكروباص، أوتوبيس، طيران.',
      en: 'Airport pickup, hotel drop-off, domestic flights, station transfers. Sedans, microbuses, coaches, flights.', de: 'Flughafenabholung, Hoteltransfer, Inlandsflüge, Bahnhofstransfers. Limousinen, Microbusse, Reisebusse, Flüge.',
      ru: 'Трансфер из аэропорта, отель, домашние рейсы.',
      it: 'Trasferimenti aeroporto, hotel, voli interni.',
    }),
  };
}

export default async function TransfersPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ region?: string }> }) {
  const { locale } = await params;
  const { region } = await searchParams;
  setRequestLocale(locale);
  const isAr = locale === 'ar';

  let allItems: TransferDTO[] = [];
  try {
    const res = await api.get<{ items: TransferDTO[] }>(`/public/transfers?locale=${localeToApiCode(locale)}`);
    allItems = res.items;
  } catch { /* ignore */ }

  // Region filter (only shown when transfers span more than one destination)
  const regionCounts: Record<string, number> = {};
  allItems.forEach((t) => { const r = t.region || 'SHARM'; regionCounts[r] = (regionCounts[r] || 0) + 1; });
  const regionKeys = Object.keys(regionCounts);
  const items = region ? allItems.filter((t) => (t.region || 'SHARM') === region) : allItems;

  // Group by route order
  const groups = ROUTE_GROUP_ORDER.map((routes) => items.filter((t) => routes.includes(t.route)));

  return (
    <main>
      <section className="relative bg-primary-900 text-cream py-16 md:py-24 overflow-hidden">
        <Image src="/hero-slides/hero-13.jpg" alt="" fill className="object-cover opacity-30 scale-105" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/85 via-primary-900/65 to-primary-900" />
        <div className="container relative">
          <Reveal>
            <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/40 text-accent text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em]">
              <Car className="h-3.5 w-3.5" />
              {L(locale, { ar: 'خدمات النقل', en: 'Transfers', de: 'Transfers', ru: 'Трансферы', it: 'Trasferimenti' })}
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl font-bold mb-4 max-w-3xl leading-[1.1] text-balance">
              {L(locale, {
                ar: 'الاستقبال والتوصيل والتنقلات',
                en: 'Pickups, drop-offs & transfers', de: 'Abholungen, Transfers & Fahrten',
                ru: 'Встречи, трансферы и перемещения',
                it: 'Pickup, drop-off e trasferimenti',
              })}
            </h1>
            <div className="w-16 h-0.5 gradient-gold rounded-full mb-5" />
            <p className="text-base sm:text-lg md:text-xl opacity-90 max-w-2xl leading-relaxed">
              {L(locale, {
                ar: 'سيارة خاصة، ميكروباص، أوتوبيس كبير، أو طيران داخلي — الأسعار تعتمد على العدد والمسافة.',
                en: 'Private car, microbus, coach, or domestic flight — prices vary by group size and route.', de: 'Privatwagen, Microbus, Reisebus oder Inlandsflug — Preise variieren je nach Gruppengröße und Route.',
                ru: 'Машина, микроавтобус, автобус или внутренний рейс.',
                it: 'Auto, microbus, pullman o volo interno — prezzi per gruppo e tratta.',
              })}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Region (destination) filter — only when transfers span more than one city */}
      {regionKeys.length > 1 && (
        <section className="sticky top-[64px] md:top-[88px] z-30 bg-cream/95 backdrop-blur-md border-b border-accent/15 shadow-sm">
          <div className="container py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Link
              href={'/transfers' as never}
              className={cn('shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border-2 transition-all whitespace-nowrap', !region ? 'bg-primary text-cream border-primary' : 'bg-white text-primary border-accent/25 hover:bg-accent/5')}
            >
              {L(locale, { ar: 'كل الوجهات', en: 'All destinations', de: 'Alle Ziele', ru: 'Все направления', it: 'Tutte le destinazioni' })}
              <span className="text-[11px] px-1.5 rounded-full bg-accent/20">{allItems.length}</span>
            </Link>
            {regionKeys.map((r) => {
              const lbl = TRANSFER_REGION_LABELS[r] || { ar: r, en: r, de: r, ru: r, it: r };
              const active = region === r;
              return (
                <Link
                  key={r}
                  href={`/transfers?region=${r}` as never}
                  className={cn('shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border-2 transition-all whitespace-nowrap', active ? 'bg-primary text-cream border-primary' : 'bg-white text-primary border-accent/25 hover:bg-accent/5')}
                >
                  {L(locale, lbl)}
                  <span className="text-[11px] px-1.5 rounded-full bg-accent/20">{regionCounts[r]}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="container py-12 md:py-16 space-y-12">
        {groups.map((g, idx) => {
          if (g.length === 0) return null;
          const t = GROUP_TITLES[idx];
          const Icon = t.icon;
          return (
            <Reveal key={idx}>
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent/15 border border-accent/30 text-accent-700">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary leading-tight">
                    {pickT(t, locale)}
                  </h2>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {g.length} {L(locale, { ar: 'خيار متاح', en: 'options', de: 'Optionen', ru: 'вариантов', it: 'opzioni' })}
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {g.map((tr) => <TransferCard key={tr.id} t={tr} locale={locale} />)}
              </div>
            </Reveal>
          );
        })}

        {items.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            {L(locale, { ar: 'لا توجد خدمات متاحة', en: 'No services available', de: 'Keine Leistungen verfügbar', ru: 'Нет услуг', it: 'Nessun servizio' })}
          </div>
        )}
      </section>
    </main>
  );
}

function TransferCard({ t, locale }: { t: TransferDTO; locale: string }) {
  const isAr = locale === 'ar';
  const meta = VEHICLE_META[t.vehicleType] || VEHICLE_META.SEDAN;
  const route = ROUTE_META[t.route] || ROUTE_META.CUSTOM;
  const name = t.tr?.name || t.slug;
  const desc = t.tr?.shortDesc || '';
  const Icon = meta.icon;
  const waMsg = L(locale, {
    ar: `مرحبا، أود الحجز: ${name}`,
    en: `Hello, I'd like to book: ${name}`, de: `Hallo, ich möchte buchen: ${name}`,
    ru: `Здравствуйте, хочу заказать: ${name}`,
    it: `Salve, vorrei prenotare: ${name}`,
  });
  const wa = buildWhatsAppLink('201090767278', waMsg as string);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-accent/15 hover:border-accent/40 card-shadow hover:card-shadow-gold hover:-translate-y-1 transition-all flex flex-col">
      <div className={`relative h-32 text-white flex items-center justify-center overflow-hidden ${t.heroImage?.url ? 'bg-primary-900' : `bg-gradient-to-br ${meta.color}`}`}>
        {t.heroImage?.url && t.heroImage.type === 'VIDEO' ? (
          <video src={t.heroImage.url} muted loop playsInline autoPlay preload="metadata" className="absolute inset-0 w-full h-full object-cover" />
        ) : t.heroImage?.url ? (
          <Image src={t.heroImage.mediumUrl || t.heroImage.url} alt={name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <Icon className="h-16 w-16 opacity-40 group-hover:scale-110 transition-transform duration-500" />
        )}
        {/* Readability overlay so the badges stay legible over photos */}
        {t.heroImage?.url && <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/25 pointer-events-none" />}
        <span className="absolute top-3 start-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/35 backdrop-blur text-[10px] font-bold uppercase tracking-wider z-10">
          {pickT(meta, locale)}
        </span>
        <span className="absolute top-3 end-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/15 backdrop-blur text-[10px] font-semibold">
          <Users className="h-3 w-3" /> {t.capacity}
        </span>
        <span className="absolute bottom-3 start-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/15 backdrop-blur text-[10px]">
          <ArrowRight className="h-3 w-3 rtl:rotate-180" /> {pickT(route, locale)}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold leading-tight text-primary mb-1">{name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{desc}</p>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-3">
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {t.durationMinutes} {L(locale, { ar: 'دقيقة', en: 'min', de: 'Min.', ru: 'мин', it: 'min' })}</span>
          <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {L(locale, { ar: `حتى ${t.capacity}`, en: `up to ${t.capacity}`, de: `bis zu ${t.capacity}`, ru: `до ${t.capacity}`, it: `fino a ${t.capacity}` })}</span>
        </div>

        <div className="flex items-end justify-between gap-2 pt-3 border-t border-accent/10">
          {/* Prices for transfers are quote-on-request — depends on group size,
              distance, and timing. The customer messages us on WhatsApp. */}
          <div className="text-xs text-muted-foreground leading-snug">
            <div className="inline-flex items-center gap-1 font-semibold text-accent-700">
              <MessageCircle className="h-3.5 w-3.5" />
              {L(locale, { ar: 'السعر حسب العدد والمسافة', en: 'Price on request', de: 'Preis auf Anfrage', ru: 'Цена по запросу', it: 'Prezzo su richiesta' })}
            </div>
            <div className="text-[10px] mt-0.5 opacity-80">
              {L(locale, { ar: 'تواصل معنا للتسعير الفوري', en: 'Contact us for an instant quote', de: 'Kontaktieren Sie uns für ein sofortiges Angebot', ru: 'Свяжитесь для точной цены', it: 'Contattaci per il preventivo' })}
            </div>
          </div>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#25D366] hover:bg-[#1ea954] text-white font-bold text-xs shadow shadow-emerald-500/30 transition-colors shrink-0">
            {L(locale, { ar: 'استفسار', en: 'Get quote', de: 'Angebot erhalten', ru: 'Запрос', it: 'Richiedi' })}
          </a>
        </div>
      </div>
    </div>
  );
}
