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
      <section className="relative bg-primary-900 text-cream pt-12 pb-8 md:pt-16 md:pb-10 overflow-hidden">
        {trip.heroImage?.url && (
          <Image src={trip.heroImage.url} alt="" fill className="object-cover opacity-25" sizes="100vw" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 via-primary-900/60 to-primary-900" />
        <div className="absolute top-1/4 -end-24 w-72 h-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="container relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs md:text-sm text-cream/60 mb-5">
            <Link href="/" className="hover:text-accent">{t('nav.home')}</Link>
            <span>/</span>
            <Link href="/trips" className="hover:text-accent">{t('nav.trips')}</Link>
            <span>/</span>
            <span className="text-cream/90 line-clamp-1">{tr?.title}</span>
          </nav>

          <Reveal>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge className="bg-accent text-primary border-0 font-bold">{t(`trips.category.${trip.category}`)}</Badge>
              {trip.isFeatured && (
                <Badge className="bg-cream/15 backdrop-blur text-cream border border-accent/40 inline-flex items-center gap-1">
                  <Star className="h-3 w-3 text-accent fill-accent" />
                  {L(locale, { ar: 'مميزة', en: 'Featured', ru: 'Популярный', it: 'In evidenza' })}
                </Badge>
              )}
              <Badge className="bg-cream/10 backdrop-blur text-cream border border-cream/20">
                <Clock className="h-3 w-3 me-1" /> {hours}{mins ? `:${String(mins).padStart(2, '0')}` : ''}h
              </Badge>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-5 leading-[1.05] max-w-4xl">{tr?.title}</h1>
            <p className="text-lg md:text-xl opacity-90 max-w-3xl leading-relaxed">{tr?.shortDesc}</p>
          </Reveal>

          {/* Quick facts strip */}
          <Reveal delay={0.2}>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl">
              {[
                { icon: Clock, label: t('common.duration'), value: `${hours} ${t('common.hours')}` },
                { icon: Calendar, label: t('common.starts'), value: trip.startTime || (L(locale, { ar: 'صباحاً', en: 'Morning', ru: 'Утром', it: 'Mattina' })) },
                { icon: MapPin, label: t('trips.meetingPoint'), value: (locale === 'ar' && trip.meetingPoint) || L(locale, { ar: trip.meetingPoint || 'الفندق', en: 'Hotel pickup', ru: 'Трансфер из отеля', it: 'Pick-up dall\'hotel' }) },
                { icon: Users, label: L(locale, { ar: 'من السعر', en: 'From', ru: 'от', it: 'da' }), value: isAr ? `${Number(trip.priceLocalEGP)} ج.م` : `$${Number(trip.priceForeignUSD)}` },
              ].map((f, i) => (
                <div key={i} className="glass-dark rounded-xl p-3.5 border border-accent/15">
                  <f.icon className="h-4 w-4 text-accent mb-1.5" />
                  <div className="text-[10px] uppercase tracking-wider text-cream/60">{f.label}</div>
                  <div className="font-bold text-sm md:text-base mt-0.5 line-clamp-1">{f.value}</div>
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
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {[
                { icon: ShieldCheck, ar: 'إلغاء مجاني', en: 'Free cancel', sub_ar: 'قبل 24 ساعة', sub_en: 'Up to 24h' },
                { icon: Award, ar: 'تقييم 4.9★', en: 'Rated 4.9★', sub_ar: '500+ تقييم', sub_en: '500+ reviews' },
                { icon: MessageCircle, ar: 'تأكيد فوري', en: 'Instant confirm', sub_ar: 'عبر واتساب', sub_en: 'via WhatsApp' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-accent/15">
                  <div className="w-10 h-10 rounded-lg bg-accent/15 text-accent-700 flex items-center justify-center shrink-0">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-primary">{L(locale, { ar: b.ar, en: b.en })}</div>
                    <div className="text-[11px] text-muted-foreground">{L(locale, { ar: b.sub_ar, en: b.sub_en })}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Overview */}
          <Reveal>
            <div>
              <div className="text-accent uppercase tracking-[0.25em] text-[11px] font-bold mb-2">{L(locale, { ar: 'عن الرحلة', en: 'About the trip', ru: 'О туре', it: 'Sul tour' })}</div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-5">
                {L(locale, { ar: 'تفاصيل وأكثر', en: 'Trip details', ru: 'Детали тура', it: 'Dettagli del tour' })}
              </h2>
              <div className="prose prose-lg max-w-none rtl:prose-rtl text-foreground/85 leading-relaxed prose-headings:font-serif prose-headings:text-primary prose-strong:text-primary" dangerouslySetInnerHTML={{ __html: tr?.longDesc || '' }} />
            </div>
          </Reveal>

          {/* Highlights with numbered cards */}
          {trip.highlights.length > 0 && (
            <Reveal>
              <div>
                <div className="text-accent uppercase tracking-[0.25em] text-[11px] font-bold mb-2">{L(locale, { ar: 'أبرز المعالم', en: 'Highlights', ru: 'Изюминки', it: 'Punti salienti' })}</div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-5">
                  {L(locale, { ar: 'ما الذي سترونه', en: "What you'll experience" })}
                </h2>
                <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                  {trip.highlights.map((h, i) => (
                    <div key={h.id} className="group flex items-start gap-4 p-4 md:p-5 bg-white rounded-xl border border-accent/15 hover:border-accent hover:-translate-y-0.5 transition-all card-shadow">
                      <span className="shrink-0 w-10 h-10 rounded-full gradient-gold text-primary font-serif font-bold text-base flex items-center justify-center group-hover:rotate-6 transition-transform">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-foreground/85 leading-relaxed">{getText(h.translations)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {/* What's included / excluded */}
          {(includes.length || excludes.length) > 0 && (
            <Reveal>
              <div>
                <div className="text-accent uppercase tracking-[0.25em] text-[11px] font-bold mb-2">{L(locale, { ar: 'الأسعار شفافة', en: 'Transparent pricing', ru: 'Прозрачные цены', it: 'Prezzi trasparenti' })}</div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-5">
                  {L(locale, { ar: 'ما يشمله وما لا يشمله', en: "What's included & excluded" })}
                </h2>
                <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                  {includes.length > 0 && (
                    <div className="bg-emerald-50 rounded-2xl p-5 md:p-6 border border-emerald-200/60">
                      <div className="flex items-center gap-2 mb-4 text-emerald-800">
                        <Check className="h-5 w-5" />
                        <h3 className="font-serif font-bold text-lg">{t('trips.includes')}</h3>
                      </div>
                      <ul className="space-y-2.5 text-sm md:text-base">
                        {includes.map((b) => (
                          <li key={b.id} className="flex items-start gap-2.5">
                            <Check className="h-4 w-4 text-emerald-600 mt-1 shrink-0" />
                            <span className="text-emerald-900/90">{getText(b.translations)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {excludes.length > 0 && (
                    <div className="bg-rose-50 rounded-2xl p-5 md:p-6 border border-rose-200/60">
                      <div className="flex items-center gap-2 mb-4 text-rose-800">
                        <X className="h-5 w-5" />
                        <h3 className="font-serif font-bold text-lg">{t('trips.excludes')}</h3>
                      </div>
                      <ul className="space-y-2.5 text-sm md:text-base">
                        {excludes.map((b) => (
                          <li key={b.id} className="flex items-start gap-2.5">
                            <X className="h-4 w-4 text-rose-500 mt-1 shrink-0" />
                            <span className="text-rose-900/90">{getText(b.translations)}</span>
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
                <div className="text-accent uppercase tracking-[0.25em] text-[11px] font-bold mb-2">{L(locale, { ar: 'استعد بشكل صحيح', en: 'Be prepared', ru: 'Будьте готовы', it: 'Sii preparato' })}</div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-5">{t('trips.whatToBring')}</h2>
                <div className="bg-amber-50 rounded-2xl p-5 md:p-6 border border-amber-200/60">
                  <div className="flex items-center gap-2 mb-4 text-amber-900">
                    <Backpack className="h-5 w-5" />
                    <h3 className="font-serif font-bold text-lg">{L(locale, { ar: 'احضر معك', en: 'Bring with you', ru: 'Возьмите с собой', it: 'Porta con te' })}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {brings.map((b) => (
                      <span key={b.id} className="px-4 py-2 rounded-full bg-white border border-amber-200/80 text-sm text-amber-900 font-medium">
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
            <div className="bg-primary text-cream rounded-2xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-accent/15 blur-2xl" />
              <div className="relative grid md:grid-cols-2 gap-5">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-accent">
                    <MapPin className="h-5 w-5" />
                    <div className="text-[11px] uppercase tracking-wider font-bold">{t('trips.meetingPoint')}</div>
                  </div>
                  <div className="font-serif text-xl font-bold">{(locale === 'ar' && trip.meetingPoint) || L(locale, { ar: trip.meetingPoint || 'فندق الإقامة في شرم الشيخ', en: 'Your Sharm hotel', ru: 'Ваш отель в Шарме', it: 'Il tuo hotel a Sharm' })}</div>
                  <div className="text-sm text-cream/70 mt-1">
                    {L(locale, { ar: 'الالتقاط من الفندق مجاناً', en: 'Free hotel pickup', ru: 'Бесплатный трансфер из отеля', it: 'Pick-up gratuito dall\'hotel' })}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2 text-accent">
                    <Calendar className="h-5 w-5" />
                    <div className="text-[11px] uppercase tracking-wider font-bold">{t('trips.schedule')}</div>
                  </div>
                  <div className="font-serif text-xl font-bold">{trip.startTime || '09:00'} · {hours} {t('common.hours')}</div>
                  <div className="text-sm text-cream/70 mt-1">
                    {L(locale, { ar: 'تنطلق يومياً', en: 'Daily departures', ru: 'Ежедневные отправления', it: 'Partenze giornaliere' })}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Sticky booking sidebar */}
        <aside className="lg:col-span-1">
          <BookingWidget trip={trip} />
          <div className="mt-4 text-center">
            <a href={inquiryHref} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-sm text-primary/70 hover:text-primary font-semibold">
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              {L(locale, { ar: 'أو استفسر عن الرحلة على واتساب', en: 'Or ask about this trip on WhatsApp', ru: 'Или спросите об этом туре в WhatsApp', it: 'O chiedi di questo tour su WhatsApp' })}
            </a>
          </div>
        </aside>
      </section>

      {/* RELATED TRIPS */}
      {related.length > 0 && (
        <section className="py-16 md:py-20 bg-gradient-to-b from-cream to-muted/30">
          <div className="container">
            <Reveal className="flex items-end justify-between mb-8 flex-wrap gap-4">
              <div>
                <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-2">{L(locale, { ar: 'رحلات قد تعجبك', en: 'You might also like', ru: 'Также вам понравится', it: 'Potrebbe interessarti anche' })}</div>
                <h2 className="font-serif text-2xl md:text-4xl font-bold text-primary">{L(locale, { ar: 'استكشف رحلات أخرى', en: 'Explore other trips', ru: 'Изучите другие туры', it: 'Esplora altri tour' })}</h2>
              </div>
              <Button asChild variant="ghost" className="text-accent-700 hover:text-accent hover:bg-accent/10">
                <Link href="/trips">{L(locale, { ar: 'كل الرحلات', en: 'All trips', ru: 'Все туры', it: 'Tutti i tour' })} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link>
              </Button>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {related.map((rt, i) => <TripCard key={rt.id} trip={rt} locale={locale} index={i} />)}
            </div>
          </div>
        </section>
      )}

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
