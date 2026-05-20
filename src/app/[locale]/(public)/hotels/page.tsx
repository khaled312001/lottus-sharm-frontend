import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Reveal } from '@/components/public/motion';
import { Star, MapPin, BedDouble, Utensils, Sparkles } from 'lucide-react';
import { Price } from '@/components/public/price';
import { api } from '@/lib/api';
import { L, localeToApiCode } from '@/lib/utils';
import { buildWhatsAppLink } from '@/lib/utils';

export const revalidate = 60;

interface HotelDTO {
  id: number;
  slug: string;
  stars: number;
  area: string;
  boardType: 'BB' | 'HB' | 'FB' | 'ALL_INCLUSIVE' | 'HB_DRINKS';
  priceLocalEGP: string;
  priceForeignUSD: string;
  nights: number;
  isFeatured: boolean;
  isActive: boolean;
  heroImage?: { url: string; mediumUrl?: string | null; thumbnailUrl?: string | null } | null;
  notes?: string | null;
  tr?: { name: string; features: string; shortDesc?: string };
}

const AREA_LABEL: Record<string, { ar: string; en: string; ru: string; it: string }> = {
  NAMA_BAY:    { ar: 'خليج نعمة',    en: 'Naama Bay',           ru: 'Наама Бэй',           it: 'Naama Bay' },
  HADABA:      { ar: 'الهضبة',       en: 'Hadaba',              ru: 'Хадаба',              it: 'Hadaba' },
  SOHO_SQUARE: { ar: 'سوهو',         en: 'Soho Square',         ru: 'Сохо-сквер',          it: 'Soho Square' },
  NABQ:        { ar: 'خليج نبق',     en: 'Nabq Bay',            ru: 'Набк Бэй',            it: 'Nabq Bay' },
  PASHA_BAY:   { ar: 'خليج الباشا',  en: 'Pasha Bay',           ru: 'Паша Бэй',            it: 'Pasha Bay' },
  QUEEN_BAY:   { ar: 'خليج القرش',   en: 'Queen / Sharks Bay',  ru: 'Куин / Шаркс-Бэй',    it: 'Queen / Sharks Bay' },
  OTHER:       { ar: 'منطقة أخرى',   en: 'Other area',          ru: 'Другой район',        it: 'Altra zona' },
};

const BOARD_LABEL: Record<string, { ar: string; en: string; ru: string; it: string; color: string }> = {
  BB:            { ar: 'إفطار فقط',           en: 'Bed & Breakfast',   ru: 'Завтрак',               it: 'B&B',                color: 'bg-blue-500/15 text-blue-700 border-blue-500/30' },
  HB:            { ar: 'فطار وعشاء',          en: 'Half-Board',        ru: 'Полупансион',           it: 'Mezza pensione',     color: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' },
  FB:            { ar: 'إقامة كاملة',         en: 'Full-Board',        ru: 'Полный пансион',        it: 'Pensione completa',  color: 'bg-amber-500/15 text-amber-700 border-amber-500/30' },
  ALL_INCLUSIVE: { ar: 'إقامة شاملة',          en: 'All-Inclusive',     ru: 'Всё включено',          it: 'All-Inclusive',      color: 'bg-rose-500/15 text-rose-700 border-rose-500/30' },
  HB_DRINKS:     { ar: 'فطار وعشاء + مشروبات', en: 'HB + drinks',       ru: 'Полупансион + напитки', it: 'HB + bevande',       color: 'bg-purple-500/15 text-purple-700 border-purple-500/30' },
};

function pick(o: { ar: string; en: string; ru: string; it: string }, locale: string) {
  return (o[locale as 'ar' | 'en' | 'ru' | 'it']) || o.en;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: L(locale, { ar: 'حجز فنادق شرم الشيخ — لوتس شرم', en: 'Sharm El Sheikh hotels — Lotus Sharm', de: 'Sharm El Sheikh hotels — Lotus Sharm', ru: 'Отели Шарм-эль-Шейха — Lotus Sharm', it: 'Hotel a Sharm El Sheikh — Lotus Sharm' }),
    description: L(locale, {
      ar: 'احجز أفضل فنادق شرم الشيخ مع لوتس شرم — 3 ليالي 4 أيام شامل الانتقالات. أكثر من 25 فندق من 3 إلى 5 نجوم.',
      en: 'Book the best Sharm El Sheikh hotels with Lotus Sharm — 3 nights/4 days incl. transfers. 25+ hotels from 3 to 5 stars.', de: 'Book the best Sharm El Sheikh hotels with Lotus Sharm — 3 nights/4 days incl. transfers. 25+ hotels from 3 to 5 stars.',
      ru: 'Лучшие отели Шарм-эль-Шейха — 3 ночи/4 дня с трансферами. Более 25 отелей.',
      it: 'I migliori hotel a Sharm El Sheikh — 3 notti/4 giorni con trasferimenti. Oltre 25 hotel.',
    }),
  };
}

export default async function HotelsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === 'ar';

  let items: HotelDTO[] = [];
  try {
    const res = await api.get<{ items: HotelDTO[] }>(`/public/hotels?locale=${localeToApiCode(locale)}&pageSize=60`);
    items = res.items;
  } catch { /* ignore */ }

  // Group by stars for visual sections
  const byStars: Record<number, HotelDTO[]> = { 5: [], 4: [], 3: [] };
  for (const h of items) {
    if (byStars[h.stars]) byStars[h.stars].push(h);
  }

  return (
    <main>
      {/* HERO */}
      <section className="relative bg-primary-900 text-cream py-16 md:py-24 overflow-hidden">
        <Image src="/hero-slides/hero-04.jpg" alt="" fill className="object-cover opacity-30 scale-105" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/85 via-primary-900/65 to-primary-900" />
        <div className="absolute top-1/4 -end-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="container relative">
          <Reveal>
            <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/40 text-accent text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em]">
              <BedDouble className="h-3.5 w-3.5" />
              {L(locale, { ar: 'حجز الفنادق', en: 'Hotel bookings', de: 'Hotel bookings', ru: 'Бронирование отелей', it: 'Prenotazioni hotel' })}
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl font-bold mb-4 max-w-3xl leading-[1.1] text-balance">
              {L(locale, {
                ar: 'احجز فندقك في شرم الشيخ',
                en: 'Book your Sharm El Sheikh hotel', de: 'Book your Sharm El Sheikh hotel',
                ru: 'Забронируйте отель в Шарм-эль-Шейхе',
                it: 'Prenota il tuo hotel a Sharm El Sheikh',
              })}
            </h1>
            <div className="w-16 h-0.5 gradient-gold rounded-full mb-5" />
            <p className="text-base sm:text-lg md:text-xl opacity-90 max-w-2xl leading-relaxed">
              {L(locale, {
                ar: 'كل الأسعار للفرد · 3 ليالي / 4 أيام · شامل الانتقالات ذهاب وعودة',
                en: 'All prices per person · 3 nights / 4 days · round-trip transfers included', de: 'All prices per person · 3 nights / 4 days · round-trip transfers included',
                ru: 'Цены за человека · 3 ночи / 4 дня · трансферы включены',
                it: 'Prezzi a persona · 3 notti / 4 giorni · trasferimenti inclusi',
              })}
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <Stat n={items.length} label={isAr ? 'فندق متاح' : 'hotels'} />
              <Stat n={byStars[5].length} label={isAr ? 'فاخر 5★' : '5★ premium'} />
              <Stat n={byStars[4].length} label={isAr ? '4 نجوم' : '4-star'} />
              <Stat n={byStars[3].length} label={isAr ? 'اقتصادي 3★' : '3★ budget'} />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container py-12 md:py-16 space-y-12">
        {([5, 4, 3] as const).map((s) => {
          const group = byStars[s] || [];
          if (group.length === 0) return null;
          return (
            <Reveal key={s}>
              <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <div className="inline-flex items-center gap-1.5 mb-2">
                    {Array.from({ length: s }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                    ))}
                  </div>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary leading-tight">
                    {s === 5
                      ? L(locale, { ar: 'فنادق 5 نجوم فاخرة', en: '5-star luxury hotels', de: '5-star luxury hotels', ru: 'Отели 5★ премиум', it: 'Hotel 5 stelle luxury' })
                      : s === 4
                      ? L(locale, { ar: 'فنادق 4 نجوم', en: '4-star hotels', de: '4-star hotels', ru: 'Отели 4★', it: 'Hotel 4 stelle' })
                      : L(locale, { ar: 'فنادق 3 نجوم اقتصادية', en: '3-star budget hotels', de: '3-star budget hotels', ru: 'Отели 3★', it: 'Hotel 3 stelle' })}
                  </h2>
                </div>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {group.length} {L(locale, { ar: 'فندق', en: 'hotels', de: 'hotels', ru: 'отелей', it: 'hotel' })}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {group.map((h) => <HotelCard key={h.id} h={h} locale={locale} />)}
              </div>
            </Reveal>
          );
        })}

        {items.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            {L(locale, { ar: 'لا توجد فنادق متاحة حالياً', en: 'No hotels available right now', de: 'No hotels available right now', ru: 'Сейчас отелей нет', it: 'Nessun hotel disponibile' })}
          </div>
        )}
      </section>

      {/* Notes strip */}
      <section className="bg-muted/30 py-10">
        <div className="container max-w-3xl text-center text-sm text-muted-foreground leading-relaxed space-y-2">
          <p>
            {L(locale, {
              ar: '✦ سياسة الأطفال تختلف حسب كل فندق — تواصل معنا للتفاصيل',
              en: '✦ Child policy varies per hotel — contact us for details', de: '✦ Child policy varies per hotel — contact us for details',
              ru: '✦ Политика для детей зависит от отеля — уточняйте',
              it: '✦ Politica bambini varia per hotel — contattaci',
            })}
          </p>
          <p>
            {L(locale, {
              ar: 'يوجد أسعار خاصة لمجموعات: شارميليون · ريكسوس · الباتروس · صن رايز',
              en: 'Special group rates available at: Sharmillion · Rixos · Albatros · Sunrise', de: 'Special group rates available at: Sharmillion · Rixos · Albatros · Sunrise',
              ru: 'Спецтарифы для групп: Sharmillion · Rixos · Albatros · Sunrise',
              it: 'Tariffe speciali per gruppi: Sharmillion · Rixos · Albatros · Sunrise',
            })}
          </p>
        </div>
      </section>
    </main>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream/10 border border-cream/20 text-cream/85 backdrop-blur">
      <span className="font-bold tabular-nums text-accent">{n}</span>
      <span>{label}</span>
    </span>
  );
}

function HotelCard({ h, locale }: { h: HotelDTO; locale: string }) {
  const isAr = locale === 'ar';
  const area = AREA_LABEL[h.area] || AREA_LABEL.OTHER;
  const board = BOARD_LABEL[h.boardType] || BOARD_LABEL.HB;
  const name = h.tr?.name || h.slug;
  const features = h.tr?.features || '';
  const priceEGP = Number(h.priceLocalEGP);
  const soldOut = !h.isActive || priceEGP === 0;
  const waMsg = L(locale, {
    ar: `مرحبا، أود الاستفسار عن حجز فندق "${name}" (${h.stars} نجوم).`,
    en: `Hello, I'd like to book hotel "${name}" (${h.stars}★).`, de: `Hello, I'd like to book hotel "${name}" (${h.stars}★).`,
    ru: `Здравствуйте, хочу забронировать отель "${name}" (${h.stars}★).`,
    it: `Salve, vorrei prenotare l'hotel "${name}" (${h.stars}★).`,
  });
  const wa = buildWhatsAppLink('201090767278', waMsg as string);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-accent/15 hover:border-accent/40 card-shadow hover:card-shadow-gold hover:-translate-y-1 transition-all">
      <div className="relative aspect-[4/3] bg-muted">
        {h.heroImage?.url ? (
          <Image src={h.heroImage.mediumUrl || h.heroImage.url} alt={name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary to-primary-900 flex items-center justify-center text-cream">
            <BedDouble className="h-12 w-12 opacity-50" />
          </div>
        )}
        <div className="absolute top-3 start-3 inline-flex items-center gap-0.5 px-2 py-1 rounded-full bg-black/65 backdrop-blur text-accent">
          {Array.from({ length: h.stars }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-current" />
          ))}
        </div>
        {h.isFeatured && (
          <span className="absolute top-3 end-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent text-primary text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="h-3 w-3" /> {L(locale, { ar: 'مميز', en: 'Featured', de: 'Empfohlen', ru: 'Топ', it: 'Top' })}
          </span>
        )}
        {soldOut && (
          <span className="absolute bottom-3 start-3 inline-flex items-center px-2 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase">
            {L(locale, { ar: 'مكتمل / للاستعلام', en: 'On request', de: 'On request', ru: 'По запросу', it: 'Su richiesta' })}
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-serif text-lg font-bold leading-tight text-primary">{name}</h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <MapPin className="h-3.5 w-3.5 text-accent" />
            <span>{pick(area, locale)}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{features}</p>

        <div className="flex items-center justify-between pt-1">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border ${board.color}`}>
            <Utensils className="h-3 w-3" />
            {pick(board, locale)}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
            {h.nights} {L(locale, { ar: 'ليالي', en: 'nights', de: 'nights', ru: 'ночей', it: 'notti' })}
          </span>
        </div>

        <div className="flex items-end justify-between pt-3 border-t border-accent/10">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              {L(locale, { ar: 'سعر الفرد', en: 'Per person', de: 'Per person', ru: 'За человека', it: 'A persona' })}
            </div>
            <div className="font-serif text-xl font-bold text-accent-700">
              {soldOut
                ? <span className="text-muted-foreground text-sm">{L(locale, { ar: 'استفسر', en: 'Ask us', de: 'Ask us', ru: 'Уточнить', it: 'Chiedi' })}</span>
                : <Price amount={priceEGP} from="EGP" />}
            </div>
          </div>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366] hover:bg-[#1ea954] text-white font-bold text-xs shadow shadow-emerald-500/30 transition-colors"
          >
            {L(locale, { ar: 'احجز', en: 'Book', de: 'Book', ru: 'Забронировать', it: 'Prenota' })}
          </a>
        </div>
      </div>
    </div>
  );
}
