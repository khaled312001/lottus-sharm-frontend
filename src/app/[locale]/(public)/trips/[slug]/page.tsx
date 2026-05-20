import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Clock, MapPin, Calendar, Check, X, Backpack, Star, Users, Sparkles, Award, ShieldCheck, MessageCircle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TripGallery } from '@/components/public/trip-gallery';
import { BookingWidget } from '@/components/public/booking-widget';
import { TripCard } from '@/components/public/trip-card';
import { Reveal } from '@/components/public/motion';
import { TripTimeline } from '@/components/public/trip/trip-timeline';
import { TripLikeButton } from '@/components/public/trip/trip-like-button';
import { CompanyReviewsBlock } from '@/components/public/trip/company-reviews-block';
import { TripComments } from '@/components/public/trip/trip-comments';
import { TripSocialProof } from '@/components/public/trip/trip-social-proof';
import { TripTrackView } from '@/components/public/trip/trip-track-view';
import { RecentlyViewedStrip } from '@/components/public/recently-viewed-strip';
import { QuickBookFab } from '@/components/public/quick-book-fab';
import { Link } from '@/i18n/routing';
import { api } from '@/lib/api';
import type { TripDTO } from '@/types/api';
import { localeToApiCode, buildWhatsAppLink, L } from '@/lib/utils';
import { inquiryWhatsAppLink } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

async function fetchTrip(slug: string, locale: string): Promise<TripDTO | null> {
  try { return await api.get<TripDTO>(`/public/trips/${slug}?locale=${localeToApiCode(locale)}`); }
  catch { return null; }
}

async function fetchRelated(locale: string, currentSlug: string): Promise<TripDTO[]> {
  try {
    const res = await api.get<{ items: TripDTO[] }>(`/public/trips?locale=${localeToApiCode(locale)}&pageSize=6`);
    return res.items.filter((t) => t.slug !== currentSlug).slice(0, 3);
  } catch { return []; }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const trip = await fetchTrip(slug, locale);
  if (!trip) return { title: 'Trip not found' };
  const tr = trip.tr;
  return {
    title: tr?.metaTitle || tr?.title || 'Trip',
    description: tr?.metaDesc || tr?.shortDesc,
    openGraph: {
      title: tr?.title,
      description: tr?.shortDesc,
      images: trip.heroImage?.url ? [trip.heroImage.url] : [],
    },
    alternates: {
      canonical: `/${locale}/trips/${slug}`,
      languages: {
        ar: `/ar/trips/${slug}`,
        en: `/en/trips/${slug}`,
        ru: `/ru/trips/${slug}`,
        it: `/it/trips/${slug}`,
      },
    },
  };
}

export default async function TripDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const trip = await fetchTrip(slug, locale);
  if (!trip) notFound();
  const t = await getTranslations({ locale });
  const tr = trip.tr;
  const isAr = locale === 'ar';

  const related = await fetchRelated(locale, slug);
  const includes = trip.bullets.filter((b) => b.type === 'INCLUDE');
  const excludes = trip.bullets.filter((b) => b.type === 'EXCLUDE');
  const brings = trip.bullets.filter((b) => b.type === 'BRING');
  const galleryMedia = [trip.heroImage, ...trip.gallery.map((g) => g.media)].filter(Boolean) as NonNullable<TripDTO['heroImage']>[];
  const hours = Math.floor(trip.durationMinutes / 60);
  const mins = trip.durationMinutes % 60;
  const inquiryHref = inquiryWhatsAppLink(trip, locale);

  const getText = (translations: { locale: string; text: string }[]) =>
    translations.find((x) => x.locale === localeToApiCode(locale))?.text ||
    translations.find((x) => x.locale === 'EN')?.text ||
    translations[0]?.text || '';

  return (
    <article>
      {/* HERO with image + breadcrumb + title */}
      <section className="relative bg-primary-900 text-cream pt-10 pb-10 md:pt-20 md:pb-16 overflow-hidden">
        {trip.heroImage?.url && (
          <Image src={trip.heroImage.url} alt="" fill className="object-cover opacity-30 scale-105" sizes="100vw" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/70 via-primary-900/55 to-primary-900" />
        <div className="absolute top-1/4 -end-24 w-72 h-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -start-20 w-80 h-80 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
        <div className="container relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs md:text-sm text-cream/60 mb-5 md:mb-6">
            <Link href="/" className="hover:text-accent transition-colors">{t('nav.home')}</Link>
            <span className="text-cream/30">/</span>
            <Link href="/trips" className="hover:text-accent transition-colors">{t('nav.trips')}</Link>
            <span className="text-cream/30">/</span>
            <span className="text-cream/90 line-clamp-1">{tr?.title}</span>
          </nav>

          <Reveal>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge className="bg-accent text-primary border-0 font-bold shadow-lg shadow-accent/20">{t(`trips.category.${trip.category}`)}</Badge>
              {trip.isFeatured && (
                <Badge className="bg-cream/15 backdrop-blur text-cream border border-accent/40 inline-flex items-center gap-1">
                  <Star className="h-3 w-3 text-accent fill-accent" />
                  {L(locale, { ar: 'مميزة', en: 'Featured', de: 'Empfohlen', ru: 'Популярный', it: 'In evidenza' })}
                </Badge>
              )}
              <Badge className="bg-cream/10 backdrop-blur text-cream border border-cream/20">
                <Clock className="h-3 w-3 me-1" /> {hours}{mins ? `:${String(mins).padStart(2, '0')}` : ''}h
              </Badge>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-5 leading-[1.05] max-w-4xl text-balance">
              {tr?.title}
            </h1>
            <div className="w-16 h-0.5 gradient-gold rounded-full mb-5 md:mb-6" />
            <p className="text-base sm:text-lg md:text-xl opacity-90 max-w-3xl leading-relaxed">{tr?.shortDesc}</p>

            {/* Rating + Like + comment count + social proof */}
            <div className="mt-6 md:mt-7 flex flex-wrap items-center gap-3 sm:gap-4">
              <TripSocialProof tripId={trip.id} bookingsLast7Days={trip.bookingsLast7Days} locale={locale} />
              <TripLikeButton slug={trip.slug} locale={locale} initialCount={trip._count?.likes ?? 0} />
              {(trip._count?.comments ?? 0) > 0 && (
                <Link href={`/trips/${trip.slug}#comments`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-cream/10 backdrop-blur border border-cream/20 text-cream hover:bg-cream/15 transition-colors">
                  <MessageCircle className="h-4 w-4 text-accent" />
                  <span className="font-semibold tabular-nums">{trip._count?.comments}</span>
                  <span className="text-sm hidden sm:inline">{L(locale, { ar: 'تعليق', en: 'comments', de: 'comments', ru: 'комментариев', it: 'commenti' })}</span>
                </Link>
              )}
            </div>
          </Reveal>

          {/* Quick facts strip */}
          <Reveal delay={0.2}>
            <div className="mt-7 md:mt-10 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 max-w-4xl">
              {[
                { icon: Clock, label: t('common.duration'), value: `${hours} ${t('common.hours')}` },
                { icon: Calendar, label: t('common.starts'), value: trip.startTime || (L(locale, { ar: 'صباحاً', en: 'Morning', de: 'Morning', ru: 'Утром', it: 'Mattina' })) },
                { icon: MapPin, label: t('trips.meetingPoint'), value: (locale === 'ar' && trip.meetingPoint) || L(locale, { ar: trip.meetingPoint || 'الفندق', en: 'Hotel pickup', de: 'Hotel pickup', ru: 'Трансфер из отеля', it: 'Pick-up dall\'hotel' }) },
                { icon: Users, label: L(locale, { ar: 'من السعر', en: 'From', de: 'From', ru: 'от', it: 'da' }), value: isAr ? `${Number(trip.priceLocalEGP)} ج.م` : `$${Number(trip.priceForeignUSD)}` },
              ].map((f, i) => (
                <div key={i} className="group glass-dark rounded-xl p-3 sm:p-3.5 border border-accent/15 hover:border-accent/40 hover:bg-primary/60 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center group-hover:bg-accent/25 group-hover:scale-110 transition-all duration-300">
                      <f.icon className="h-3.5 w-3.5 text-accent" />
                    </div>
                  </div>
                  <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-cream/60 font-semibold">{f.label}</div>
                  <div className="font-bold text-sm md:text-base mt-0.5 line-clamp-1 text-cream">{f.value}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* GALLERY full-width */}
      <section className="container py-8 md:py-10">
        <Reveal>
          <TripGallery images={galleryMedia} title={tr?.title || ''} />
        </Reveal>
      </section>

      {/* BODY — content + booking sidebar */}
      <section className="container pb-12 md:pb-16 grid lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-10">
          {/* Trust badges row */}
          <Reveal>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              {[
                { icon: ShieldCheck, ar: 'إلغاء مجاني', en: 'Free cancel',     en_short: 'Free cancel', de: 'Kostenlose Stornierung', de_short: 'Storno', ru: 'Бесплатная отмена', ru_short: 'Отмена', it: 'Cancellazione gratuita', it_short: 'Cancellaz.', sub_ar: 'قبل 24 ساعة', sub_en: 'Up to 24h',     sub_ru: 'За 24 часа',  sub_it: 'Fino a 24h' },
                { icon: Award,       ar: 'تقييم 4.9★', en: 'Rated 4.9★',       en_short: '4.9★ Rated',  de: 'Bewertung 4.9★', de_short: '4.9★', ru: 'Рейтинг 4.9★',      ru_short: '4.9★',   it: 'Voto 4.9★',             it_short: '4.9★',      sub_ar: '500+ تقييم',  sub_en: '500+ reviews', sub_ru: '500+ отзывов', sub_it: '500+ recensioni' },
                { icon: MessageCircle, ar: 'تأكيد فوري', en: 'Instant confirm', en_short: 'Instant',     de: 'Sofortbestätigung', de_short: 'Sofort', ru: 'Мгн. подтверждение', ru_short: 'Мгновенно', it: 'Conferma immediata',  it_short: 'Immediata',  sub_ar: 'عبر واتساب', sub_en: 'via WhatsApp', sub_ru: 'через WhatsApp', sub_it: 'via WhatsApp' },
              ].map((b, i) => (
                <div
                  key={i}
                  className="group relative flex flex-col items-center text-center gap-1.5 px-2 py-3 sm:flex-row sm:text-start sm:gap-3 sm:p-4 bg-white rounded-xl border border-accent/15 hover:border-accent/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden min-w-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 text-accent-700 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <b.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="relative w-full min-w-0 leading-tight">
                    <div className="font-bold text-[11px] sm:text-sm text-primary whitespace-normal break-words">
                      <span className="sm:hidden">{L(locale, { ar: b.ar, en: b.en_short, ru: b.ru_short, it: b.it_short, de: b.de_short })}</span>
                      <span className="hidden sm:inline">{L(locale, { ar: b.ar, en: b.en, ru: b.ru, it: b.it, de: b.de })}</span>
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-muted-foreground whitespace-normal break-words mt-0.5">{L(locale, { ar: b.sub_ar, en: b.sub_en, ru: b.sub_ru, it: b.sub_it, de: b.sub_en })}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Overview */}
          <Reveal>
            <div>
              <div className="inline-flex items-center gap-2.5 mb-3">
                <span className="block w-7 h-px bg-accent" />
                <span className="text-accent uppercase tracking-[0.25em] text-[10px] sm:text-[11px] font-bold">{L(locale, { ar: 'عن الرحلة', en: 'About the trip', de: 'About the trip', ru: 'О туре', it: 'Sul tour' })}</span>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-5 leading-tight text-balance">
                {L(locale, { ar: 'تفاصيل وأكثر', en: 'Trip details', de: 'Trip details', ru: 'Детали тура', it: 'Dettagli del tour' })}
              </h2>
              <div className="prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: tr?.longDesc || '' }} />
            </div>
          </Reveal>

          {/* Highlights with numbered cards */}
          {trip.highlights.length > 0 && (
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-2.5 mb-3">
                  <span className="block w-7 h-px bg-accent" />
                  <span className="text-accent uppercase tracking-[0.25em] text-[10px] sm:text-[11px] font-bold">{L(locale, { ar: 'أبرز المعالم', en: 'Highlights', de: 'Highlights', ru: 'Изюминки', it: 'Punti salienti' })}</span>
                </div>
                <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-5 leading-tight text-balance">
                  {L(locale, { ar: 'ما الذي سترونه', en: "What you'll experience", de: "What you'll experience", ru: 'Что вас ждёт', it: 'Cosa vivrai' })}
                </h2>
                <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                  {trip.highlights.map((h, i) => (
                    <div key={h.id} className="group relative flex items-start gap-3 sm:gap-4 p-4 md:p-5 bg-white rounded-xl border border-accent/15 hover:border-accent/60 hover:-translate-y-1 transition-all duration-300 card-shadow hover:card-shadow-gold overflow-hidden">
                      <div className="absolute inset-y-0 start-0 w-1 gradient-gold scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300" />
                      <span className="relative shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full gradient-gold text-primary font-serif font-bold text-base sm:text-lg flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-foreground/85 leading-relaxed text-sm sm:text-base pt-1">{getText(h.translations)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {/* Timeline / itinerary */}
          {trip.timeline && trip.timeline.length > 0 && (
            <TripTimeline steps={trip.timeline} locale={locale} />
          )}

          {/* What's included / excluded */}
          {(includes.length || excludes.length) > 0 && (
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-2.5 mb-3">
                  <span className="block w-7 h-px bg-accent" />
                  <span className="text-accent uppercase tracking-[0.25em] text-[10px] sm:text-[11px] font-bold">{L(locale, { ar: 'الأسعار شفافة', en: 'Transparent pricing', de: 'Transparent pricing', ru: 'Прозрачные цены', it: 'Prezzi trasparenti' })}</span>
                </div>
                <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-5 leading-tight text-balance">
                  {L(locale, { ar: 'ما يشمله وما لا يشمله', en: "What's included & excluded", de: "What's included & excluded", ru: 'Что включено и что нет', it: 'Cosa è incluso ed escluso' })}
                </h2>
                <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                  {includes.length > 0 && (
                    <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-50/40 rounded-2xl p-5 md:p-6 border border-emerald-200/60 overflow-hidden">
                      <div className="absolute -top-10 -end-10 w-32 h-32 rounded-full bg-emerald-200/30 blur-2xl pointer-events-none" />
                      <div className="relative flex items-center gap-3 mb-4 text-emerald-800">
                        <span className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                          <Check className="h-5 w-5" />
                        </span>
                        <h3 className="font-serif font-bold text-lg">{t('trips.includes')}</h3>
                      </div>
                      <ul className="relative space-y-2.5 text-sm md:text-base">
                        {includes.map((b) => (
                          <li key={b.id} className="flex items-start gap-2.5">
                            <Check className="h-4 w-4 text-emerald-600 mt-1 shrink-0" />
                            <span className="text-emerald-900/90 leading-relaxed">{getText(b.translations)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {excludes.length > 0 && (
                    <div className="relative bg-gradient-to-br from-rose-50 to-rose-50/40 rounded-2xl p-5 md:p-6 border border-rose-200/60 overflow-hidden">
                      <div className="absolute -top-10 -end-10 w-32 h-32 rounded-full bg-rose-200/30 blur-2xl pointer-events-none" />
                      <div className="relative flex items-center gap-3 mb-4 text-rose-800">
                        <span className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center">
                          <X className="h-5 w-5" />
                        </span>
                        <h3 className="font-serif font-bold text-lg">{t('trips.excludes')}</h3>
                      </div>
                      <ul className="relative space-y-2.5 text-sm md:text-base">
                        {excludes.map((b) => (
                          <li key={b.id} className="flex items-start gap-2.5">
                            <X className="h-4 w-4 text-rose-500 mt-1 shrink-0" />
                            <span className="text-rose-900/90 leading-relaxed">{getText(b.translations)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          )}

          {/* What to bring */}
          {brings.length > 0 && (
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-2.5 mb-3">
                  <span className="block w-7 h-px bg-accent" />
                  <span className="text-accent uppercase tracking-[0.25em] text-[10px] sm:text-[11px] font-bold">{L(locale, { ar: 'استعد بشكل صحيح', en: 'Be prepared', de: 'Be prepared', ru: 'Будьте готовы', it: 'Sii preparato' })}</span>
                </div>
                <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-5 leading-tight text-balance">{t('trips.whatToBring')}</h2>
                <div className="relative bg-gradient-to-br from-amber-50 to-amber-50/40 rounded-2xl p-5 md:p-6 border border-amber-200/60 overflow-hidden">
                  <div className="absolute -top-10 -end-10 w-40 h-40 rounded-full bg-amber-200/30 blur-2xl pointer-events-none" />
                  <div className="relative flex items-center gap-3 mb-4 text-amber-900">
                    <span className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center">
                      <Backpack className="h-5 w-5" />
                    </span>
                    <h3 className="font-serif font-bold text-lg">{L(locale, { ar: 'احضر معك', en: 'Bring with you', de: 'Bring with you', ru: 'Возьмите с собой', it: 'Porta con te' })}</h3>
                  </div>
                  <div className="relative flex flex-wrap gap-2">
                    {brings.map((b) => (
                      <span key={b.id} className="px-3.5 py-1.5 rounded-full bg-white border border-amber-200/80 text-sm text-amber-900 font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-amber-400 transition-all duration-200 cursor-default">
                        {getText(b.translations)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          {/* Meeting + schedule info */}
          <Reveal>
            <div className="relative bg-gradient-to-br from-primary via-primary to-primary-900 text-cream rounded-2xl p-6 md:p-8 overflow-hidden border border-accent/20 shadow-xl">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-accent/15 blur-2xl" />
              <div className="absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-accent/10 blur-3xl" />
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
              <div className="relative grid md:grid-cols-2 gap-6 md:gap-8 md:divide-x rtl:md:divide-x-reverse md:divide-accent/15">
                <div className="md:pe-8">
                  <div className="flex items-center gap-2.5 mb-3 text-accent">
                    <span className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center">
                      <MapPin className="h-4.5 w-4.5" />
                    </span>
                    <div className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold">{t('trips.meetingPoint')}</div>
                  </div>
                  <div className="font-serif text-lg md:text-xl font-bold leading-snug">{(locale === 'ar' && trip.meetingPoint) || L(locale, { ar: trip.meetingPoint || 'فندق الإقامة في شرم الشيخ', en: 'Your Sharm hotel', de: 'Your Sharm hotel', ru: 'Ваш отель в Шарме', it: 'Il tuo hotel a Sharm' })}</div>
                  <div className="text-sm text-cream/70 mt-1.5">
                    {L(locale, { ar: 'الالتقاط من الفندق مجاناً', en: 'Free hotel pickup', de: 'Free hotel pickup', ru: 'Бесплатный трансфер из отеля', it: 'Pick-up gratuito dall\'hotel' })}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-3 text-accent">
                    <span className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center">
                      <Calendar className="h-4.5 w-4.5" />
                    </span>
                    <div className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold">{t('trips.schedule')}</div>
                  </div>
                  <div className="font-serif text-lg md:text-xl font-bold leading-snug">{trip.startTime || '09:00'} · {hours} {t('common.hours')}</div>
                  <div className="text-sm text-cream/70 mt-1.5">
                    {L(locale, { ar: 'تنطلق يومياً', en: 'Daily departures', de: 'Daily departures', ru: 'Ежедневные отправления', it: 'Partenze giornaliere' })}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Reviews — company-wide (not trip-specific) */}
          <Reveal>
            <CompanyReviewsBlock locale={locale} />
          </Reveal>

          {/* Comments / discussion */}
          <Reveal>
            <div id="comments" className="scroll-mt-24">
              <TripComments slug={trip.slug} locale={locale} initialCount={trip._count?.comments ?? 0} />
            </div>
          </Reveal>
        </div>

        {/* Sticky booking sidebar */}
        <aside id="book" className="lg:col-span-1 scroll-mt-24">
          <BookingWidget trip={trip} />
          <div className="mt-4 text-center">
            <a href={inquiryHref} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-sm text-primary/70 hover:text-primary font-semibold">
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              {L(locale, { ar: 'أو استفسر عن الرحلة على واتساب', en: 'Or ask about this trip on WhatsApp', de: 'Or ask about this trip on WhatsApp', ru: 'Или спросите об этом туре в WhatsApp', it: 'O chiedi di questo tour su WhatsApp' })}
            </a>
          </div>
        </aside>
      </section>

      {/* RELATED TRIPS */}
      {related.length > 0 && (
        <section className="relative py-14 md:py-20 bg-gradient-to-b from-cream via-cream to-muted/30 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          <div className="absolute -top-20 right-0 w-80 h-80 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
          <div className="container relative">
            <Reveal className="flex items-end justify-between mb-8 md:mb-10 flex-wrap gap-4">
              <div>
                <div className="inline-flex items-center gap-2.5 mb-2.5">
                  <span className="block w-8 h-px bg-accent" />
                  <span className="text-accent uppercase tracking-[0.3em] text-[10px] sm:text-xs font-bold">{L(locale, { ar: 'رحلات قد تعجبك', en: 'You might also like', de: 'You might also like', ru: 'Также вам понравится', it: 'Potrebbe interessarti anche' })}</span>
                </div>
                <h2 className="font-serif text-2xl md:text-4xl font-bold text-primary leading-tight text-balance">{L(locale, { ar: 'استكشف رحلات أخرى', en: 'Explore other trips', de: 'Explore other trips', ru: 'Изучите другие туры', it: 'Esplora altri tour' })}</h2>
              </div>
              <Button asChild variant="ghost" className="text-accent-700 hover:text-accent hover:bg-accent/10 group">
                <Link href="/trips">{L(locale, { ar: 'كل الرحلات', en: 'All trips', de: 'All trips', ru: 'Все туры', it: 'Tutti i tour' })} <ArrowRight className="h-4 w-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" /></Link>
              </Button>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {related.map((rt, i) => <TripCard key={rt.id} trip={rt} locale={locale} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* Quick-book FAB — appears when the booking widget is off-screen */}
      <QuickBookFab targetId="book" />

      {/* Recently viewed strip + tracker for this trip */}
      <TripTrackView
        id={trip.id}
        slug={trip.slug}
        title={tr?.title || trip.slug}
        image={trip.heroImage?.mediumUrl || trip.heroImage?.url || ''}
        price={isAr ? `${Number(trip.priceLocalEGP)} ج.م` : `$${Number(trip.priceForeignUSD)}`}
      />
      <RecentlyViewedStrip excludeSlug={trip.slug} />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'TouristTrip',
            name: tr?.title,
            description: tr?.shortDesc,
            image: trip.heroImage?.url,
            offers: {
              '@type': 'Offer',
              price: Number(trip.priceForeignUSD),
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
            },
            duration: `PT${trip.durationMinutes}M`,
          }),
        }}
      />
    </article>
  );
}
