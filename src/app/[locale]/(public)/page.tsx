import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { TripCard } from '@/components/public/trip-card';
import { Reveal } from '@/components/public/motion';
import { HeroSlider } from '@/components/public/hero-slider';
import { ReviewsCarousel, type ReviewItem } from '@/components/public/reviews-carousel';
import { api } from '@/lib/api';
import type { TripDTO } from '@/types/api';
import { Award, Shield, Compass, Clock, ArrowRight, Sparkles, Star, Users, MessageCircle, ShieldCheck, ChevronDown, MapPin, Play } from 'lucide-react';
import { localeToApiCode, L } from '@/lib/utils';
import { getLocalizedTagline, getSiteSettings } from '@/lib/site-settings';
import { fetchCMSPage } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const settings = await getSiteSettings();
  const defaultTagline = getLocalizedTagline(settings, locale);
  const cms = await fetchCMSPage('home', locale);
  const tagline = cms?.tr?.subtitle || defaultTagline;
  const heroOverrideTitle = cms?.tr?.title || null;

  let trips: TripDTO[] = [];
  try {
    const res = await api.get<{ items: TripDTO[] }>(
      `/public/trips?locale=${localeToApiCode(locale)}&pageSize=6`,
    );
    trips = res.items;
  } catch {
    trips = [];
  }

  let reviews: ReviewItem[] = [];
  try {
    const r = await api.get<{ items: ReviewItem[] }>('/public/reviews?limit=12');
    reviews = r.items;
  } catch { reviews = []; }

  const isAr = locale === 'ar';

  return (
    <>
      {/* ============ HERO — clean, centered, conversion-focused ============ */}
      <section className="relative min-h-[100svh] flex items-center text-cream overflow-hidden">
        <HeroSlider />

        {/* Single vignette overlay — dark top + bottom, lighter middle */}
        <div aria-hidden className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-primary-900/80 via-primary-900/40 to-primary-900/90" />

        <div className="container relative z-20 pt-28 pb-24 md:pt-32 md:pb-28">
          <div className="max-w-3xl mx-auto text-center">
            {/* Single experience badge */}
            <Reveal delay={0.15}>
              <span className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full bg-cream/10 backdrop-blur-md border border-accent/40 text-accent text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em]">
                <Sparkles className="h-3.5 w-3.5" />
                {settings.yearsExperience}+ {t('home.yearsOfLuxury')}
              </span>
            </Reveal>

            {/* Headline */}
            <Reveal delay={0.25}>
              <h1 className="lotus-hero-h1 font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-lg">
                {heroOverrideTitle ? (
                  <span className="lotus-hero-line lotus-hero-line--gold">{heroOverrideTitle}</span>
                ) : (
                  <>
                    <span className="lotus-hero-line">{t('home.heroTitleLine1')}</span>
                    <span className="lotus-hero-line lotus-hero-line--gold">{t('home.heroTitleLine2')}</span>
                  </>
                )}
              </h1>
            </Reveal>

            {/* Gold rule */}
            <Reveal delay={0.35}>
              <span aria-hidden className="block w-14 h-0.5 gradient-gold rounded-full mx-auto mb-5" />
            </Reveal>

            {/* Tagline */}
            <Reveal delay={0.4}>
              <p className="text-base sm:text-lg md:text-xl opacity-90 leading-relaxed font-light max-w-2xl mx-auto mb-9">
                {tagline}
              </p>
            </Reveal>

            {/* CTAs */}
            <Reveal delay={0.5}>
              <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
                <Button asChild size="lg" className="bg-accent text-primary hover:bg-accent-400 font-bold shadow-2xl shadow-accent/40 hover:-translate-y-0.5 transition-all duration-200 group px-7 text-base">
                  <Link href="/trips">
                    {t('home.ctaPrimary')}
                    <ArrowRight className="h-5 w-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-cream/40 text-cream hover:bg-cream hover:text-primary backdrop-blur-md">
                  <Link href="/contact">{t('home.ctaSecondary')}</Link>
                </Button>
              </div>
            </Reveal>

            {/* Trust strip */}
            <Reveal delay={0.6}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-cream/75">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <strong className="text-cream">5.0</strong> <span className="opacity-70">· 10k+ {L(locale, { ar: 'سائح', en: 'guests', ru: 'гостей', it: 'ospiti' })}</span>
                </span>
                <span className="w-px h-4 bg-cream/20" />
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  {L(locale, { ar: 'مرخصة قانونياً', en: 'Licensed', ru: 'Лицензировано', it: 'Concessionato' })}
                </span>
                <span className="w-px h-4 bg-cream/20" />
                <span className="inline-flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4 text-[#25D366]" />
                  {L(locale, { ar: 'دعم 24/7', en: '24/7 Support', ru: 'Поддержка 24/7', it: 'Supporto 24/7' })}
                </span>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Scroll cue */}
        <Reveal delay={0.8} className="absolute bottom-6 inset-x-0 z-20 hidden md:flex justify-center pointer-events-none">
          <div className="inline-flex flex-col items-center gap-1 text-cream/60 animate-float">
            <ChevronDown className="h-5 w-5 text-accent" />
          </div>
        </Reveal>
      </section>

      {/* Mobile stats — separate band below hero (no overlap) */}
      <section className="md:hidden bg-primary-900 text-cream py-5">
        <div className="container">
          <div className="grid grid-cols-4 gap-3">
            {[
              { v: `${settings.yearsExperience}+`, l: L(locale, { ar: 'سنة', en: 'Yrs', ru: 'Лет', it: 'Anni' }) },
              { v: '5★', l: L(locale, { ar: 'تقييم', en: 'Rating', ru: 'Рейтинг', it: 'Valutazione' }) },
              { v: '10k+', l: L(locale, { ar: 'سائح', en: 'Guests', ru: 'Гостей', it: 'Ospiti' }) },
              { v: '24/7', l: L(locale, { ar: 'دعم', en: 'Support', ru: 'Поддержка', it: 'Supporto' }) },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="font-serif text-xl font-bold text-accent leading-none">{s.v}</div>
                <div className="text-[10px] text-cream/70 uppercase tracking-wider mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHY US ============ */}
      <section className="relative py-14 md:py-24 bg-cream overflow-hidden hairline-top">
        <div aria-hidden className="orb-accent absolute -top-20 -end-32 pointer-events-none animate-blob" />
        <div aria-hidden className="orb-accent-sm orb-accent absolute bottom-0 -start-20 pointer-events-none animate-blob" style={{ animationDelay: '3s' }} />
        {/* Floating sparkles */}
        <span aria-hidden className="sparkle delay-1" style={{ top: '12%', insetInlineStart: '8%' }} />
        <span aria-hidden className="sparkle delay-3" style={{ top: '78%', insetInlineEnd: '12%' }} />
        <span aria-hidden className="sparkle delay-2" style={{ top: '38%', insetInlineEnd: '6%' }} />

        <div className="container relative">
          <Reveal className="text-center max-w-2xl mx-auto mb-10 md:mb-14 flex flex-col items-center">
            <span className="eyebrow">{L(locale, { ar: 'لماذا نحن', en: 'Why choose us', ru: 'Почему выбирают нас', it: 'Perché sceglierci' })}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary leading-tight text-balance">{t('home.whyUs')}</h2>
            <span className="rule-gold" />
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[
              { icon: Award, key: 'whyUsExperience' },
              { icon: Shield, key: 'whyUsSafety' },
              { icon: Compass, key: 'whyUsBestPrice' },
              { icon: Clock, key: 'whyUsSupport' },
            ].map((f, i) => (
              <Reveal key={f.key} delay={i * 0.1}>
                <div className="group relative p-5 md:p-7 card-modern tilt-card h-full overflow-hidden">
                  {/* Decorative gold corner that grows on hover */}
                  <div aria-hidden className="absolute -top-16 -end-16 w-32 h-32 bg-gradient-to-bl from-accent/25 via-accent/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                  {/* Big index number in background */}
                  <span aria-hidden className="absolute -top-2 end-3 font-serif text-7xl font-bold text-accent/5 group-hover:text-accent/15 transition-colors duration-500 select-none leading-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl gradient-gold flex items-center justify-center text-primary mb-4 md:mb-5 group-hover:rotate-[-6deg] group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-accent/30">
                    <f.icon className="h-6 w-6 md:h-7 md:w-7" />
                  </div>
                  <h3 className="relative font-serif font-bold text-base md:text-xl mb-2 text-primary leading-snug group-hover:text-accent-700 transition-colors">{t(`home.${f.key as 'whyUsExperience'}`)}</h3>
                  <p className="relative text-xs md:text-sm text-muted-foreground leading-relaxed">{t(`home.${f.key as 'whyUsExperience'}Desc`)}</p>
                  {/* Bottom gold rule that grows on hover */}
                  <span aria-hidden className="absolute bottom-0 inset-x-5 md:inset-x-7 h-0.5 gradient-gold rounded-full scale-x-0 group-hover:scale-x-100 origin-start transition-transform duration-500" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED TRIPS ============ */}
      <section className="relative py-14 md:py-24 bg-gradient-to-b from-cream to-muted/40 overflow-hidden">
        <div aria-hidden className="orb-accent absolute top-1/3 -start-32 pointer-events-none animate-blob" />
        <div aria-hidden className="orb-accent absolute bottom-0 -end-40 pointer-events-none animate-blob" style={{ animationDelay: '5s' }} />
        {/* Marquee strip on top */}
        <div aria-hidden className="absolute top-0 inset-x-0 overflow-hidden opacity-[0.07] pointer-events-none">
          <div className="flex gap-12 whitespace-nowrap py-3 animate-marquee font-serif text-2xl md:text-4xl font-bold text-primary">
            {Array.from({ length: 6 }).flatMap(() => [
              <span key={`a-${Math.random()}`}>SHARM EL SHEIKH</span>,
              <span key={`b-${Math.random()}`} className="text-accent">✦</span>,
              <span key={`c-${Math.random()}`}>RED SEA</span>,
              <span key={`d-${Math.random()}`} className="text-accent">✦</span>,
              <span key={`e-${Math.random()}`}>LUXURY TOURS</span>,
              <span key={`f-${Math.random()}`} className="text-accent">✦</span>,
            ])}
          </div>
        </div>

        <div className="container relative">
          <Reveal className="flex items-end justify-between flex-wrap gap-4 mb-8 md:mb-12">
            <div>
              <span className="eyebrow">{L(locale, { ar: 'رحلاتنا المميزة', en: 'Curated experiences', ru: 'Лучшие туры', it: 'Esperienze selezionate' })}</span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary mb-2 leading-tight text-balance">{t('home.featuredTrips')}</h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-md leading-relaxed">{t('home.featuredTripsDesc')}</p>
            </div>
            <Button asChild variant="ghost" className="text-accent-700 hover:text-accent hover:bg-accent/10 group">
              <Link href="/trips" className="link-underline-grow">
                {t('common.viewAll')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </Link>
            </Button>
          </Reveal>

          {trips.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground italic">{t('trips.noTrips')}</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {trips.map((trip, i) => (
                <TripCard key={trip.id} trip={trip} locale={locale} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ REVIEWS CAROUSEL ============ */}
      {reviews.length > 0 && (
        <section className="relative py-14 md:py-24 bg-primary-800 text-cream overflow-hidden hairline-top">
          <div className="absolute -top-20 -right-20 w-72 md:w-96 h-72 md:h-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 md:w-96 h-72 md:h-96 rounded-full bg-accent/5 blur-3xl" />
          <div className="container relative">
            <Reveal className="text-center mb-10 md:mb-14">
              <span className="eyebrow eyebrow-center">
                {L(locale, { ar: 'آراء عملائنا', en: 'What our guests say', ru: 'Что говорят наши гости', it: 'Cosa dicono i nostri ospiti' })}
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold leading-tight text-balance">
                {L(locale, { ar: 'تجارب حقيقية من رحلاتهم معنا', en: 'Real stories from real travelers', ru: 'Реальные отзывы реальных путешественников', it: 'Storie vere di veri viaggiatori' })}
              </h2>
              <span className="rule-gold" />
              <p className="text-sm md:text-base opacity-75 max-w-xl mx-auto leading-relaxed">
                {isAr
                  ? `أكثر من ${reviews.length} مراجعة من زوار حقيقيين عاشوا تجربة لوتس شرم`
                  : `${reviews.length}+ verified reviews from real Lotus Sharm travelers`}
              </p>
            </Reveal>
            <Reveal>
              <ReviewsCarousel reviews={reviews} locale={locale} />
            </Reveal>
          </div>
        </section>
      )}

      {/* ============ CTA ============ */}
      <section className="py-14 md:py-24 bg-mesh-cream">
        <div className="container">
          <Reveal>
            <div className="relative max-w-5xl mx-auto rounded-2xl md:rounded-3xl gradient-luxury text-cream p-8 md:p-16 text-center overflow-hidden border border-accent/20 shadow-2xl">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
              <div aria-hidden className="absolute -top-32 -right-32 w-72 md:w-96 h-72 md:h-96 rounded-full bg-accent/15 blur-3xl animate-blob" />
              <div aria-hidden className="absolute -bottom-32 -left-32 w-72 md:w-96 h-72 md:h-96 rounded-full bg-accent/10 blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
              {/* Floating sparkles */}
              <span aria-hidden className="sparkle delay-1" style={{ top: '14%', left: '12%' }} />
              <span aria-hidden className="sparkle delay-2" style={{ top: '22%', right: '18%' }} />
              <span aria-hidden className="sparkle delay-3" style={{ bottom: '20%', left: '20%' }} />
              <span aria-hidden className="sparkle delay-4" style={{ bottom: '15%', right: '14%' }} />

              <div className="relative">
                <div className="relative inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-accent/15 border border-accent/30 mx-auto mb-5 backdrop-blur animate-float">
                  <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-accent" />
                  {/* Orbit dot */}
                  <span aria-hidden className="absolute inset-0 animate-spin-slow">
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent shadow-md shadow-accent/60" />
                  </span>
                </div>
                <h2 className="font-serif text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-balance leading-tight">
                  {L(locale, { ar: 'جاهز لمغامرتك القادمة؟', en: 'Ready for your next adventure?', ru: 'Готовы к новому приключению?', it: 'Pronto per la prossima avventura?' })}
                </h2>
                <span className="rule-gold" />
                <p className="text-sm md:text-lg opacity-90 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
                  {L(locale, { ar: 'احجز رحلتك اليوم واستمتع بتجربة سياحية فاخرة لا تُنسى في شرم الشيخ', en: 'Book today and enjoy an unforgettable luxury experience in Sharm El Sheikh' })}
                </p>
                <Button asChild size="lg" className="bg-accent text-primary hover:bg-accent-400 font-bold shadow-2xl shadow-accent/40 group hover:-translate-y-0.5 transition-all animate-glow-pulse">
                  <Link href="/trips">
                    {t('common.bookNow')}
                    <ArrowRight className="h-5 w-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
