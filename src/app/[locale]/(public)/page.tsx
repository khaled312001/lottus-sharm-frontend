import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { TripCard } from '@/components/public/trip-card';
import { Reveal } from '@/components/public/motion';
import { HeroSlider } from '@/components/public/hero-slider';
import { ReviewsCarousel, type ReviewItem } from '@/components/public/reviews-carousel';
import { api } from '@/lib/api';
import type { TripDTO } from '@/types/api';
import { Award, Shield, Compass, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { localeToApiCode } from '@/lib/utils';
import { getLocalizedTagline, getSiteSettings } from '@/lib/site-settings';

export const dynamic = 'force-dynamic';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const settings = await getSiteSettings();
  const tagline = getLocalizedTagline(settings, locale);

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
      {/* ============ HERO ============ */}
      <section className="relative min-h-[100svh] flex items-center text-cream overflow-hidden">
        <HeroSlider />

        <div className="absolute top-1/3 -end-32 w-[500px] h-[500px] rounded-full bg-accent/12 blur-3xl pointer-events-none z-10" />
        <div className="absolute bottom-0 -start-32 w-[400px] h-[400px] rounded-full bg-accent/8 blur-3xl pointer-events-none z-10" />

        <div className="container relative z-20 pt-28 pb-16 md:pt-32 md:pb-40">
          <div className="max-w-3xl">
            <Reveal delay={0.2}>
              <div className="inline-flex items-center gap-2 mb-5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-cream/10 backdrop-blur border border-accent/30 text-accent text-[11px] sm:text-sm font-semibold">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {settings.yearsExperience}+ {isAr ? 'سنة من الخبرة الفاخرة' : 'years of luxury experience'}
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-5 sm:mb-6 leading-[1.05] text-balance">
                {isAr ? (
                  <>
                    <span className="block">رحلتك الفاخرة</span>
                    <span className="block text-gold-gradient">في شرم الشيخ</span>
                  </>
                ) : (
                  <>
                    <span className="block">Your Luxury Journey</span>
                    <span className="block text-gold-gradient">in Sharm El Sheikh</span>
                  </>
                )}
              </h1>
            </Reveal>
            <Reveal delay={0.4}>
              <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 opacity-90 max-w-2xl leading-relaxed font-light">{tagline}</p>
            </Reveal>
            <Reveal delay={0.5}>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Button asChild size="lg" className="bg-accent text-primary hover:bg-accent-400 font-bold shadow-2xl shadow-accent/30 group">
                  <Link href="/trips">
                    {t('home.ctaPrimary')}
                    <ArrowRight className="h-5 w-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-cream/40 text-cream hover:bg-cream hover:text-primary">
                  <Link href="/contact">{t('home.ctaSecondary')}</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Stats bar — anchored within hero on desktop, no overlap with CTAs */}
        <Reveal delay={0.7} className="absolute bottom-0 inset-x-0 z-20 hidden md:block pointer-events-none">
          <div className="container pb-6 lg:pb-8">
            <div className="glass-dark rounded-2xl px-4 md:px-6 py-4 md:py-5 grid grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto border border-accent/20">
              {[
                { v: `${settings.yearsExperience}+`, l: isAr ? 'سنة خبرة' : 'Years' },
                { v: '5★', l: isAr ? 'تقييم العملاء' : 'Rating' },
                { v: '10k+', l: isAr ? 'سائح سعيد' : 'Happy guests' },
                { v: '24/7', l: isAr ? 'دعم متواصل' : 'Support' },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <div className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-accent leading-none">{s.v}</div>
                  <div className="text-[10px] md:text-xs text-cream/80 uppercase tracking-wider mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Mobile stats — separate band below hero (no overlap) */}
      <section className="md:hidden bg-primary-900 text-cream py-5">
        <div className="container">
          <div className="grid grid-cols-4 gap-3">
            {[
              { v: `${settings.yearsExperience}+`, l: isAr ? 'سنة' : 'Yrs' },
              { v: '5★', l: isAr ? 'تقييم' : 'Rating' },
              { v: '10k+', l: isAr ? 'سائح' : 'Guests' },
              { v: '24/7', l: isAr ? 'دعم' : 'Support' },
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
      <section className="py-16 md:py-24 bg-cream relative">
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">{isAr ? 'لماذا نحن' : 'Why choose us'}</div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4 text-primary">{t('home.whyUs')}</h2>
            <div className="w-16 h-0.5 bg-accent mx-auto" />
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: Award, key: 'whyUsExperience' },
              { icon: Shield, key: 'whyUsSafety' },
              { icon: Compass, key: 'whyUsBestPrice' },
              { icon: Clock, key: 'whyUsSupport' },
            ].map((f, i) => (
              <Reveal key={f.key} delay={i * 0.1}>
                <div className="group relative p-5 md:p-8 bg-white rounded-2xl border border-accent/10 hover:border-accent/40 transition-all duration-500 hover:-translate-y-2 card-shadow hover:card-shadow-gold h-full">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-accent/20 to-transparent rounded-tr-2xl rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl gradient-gold flex items-center justify-center text-primary mb-4 md:mb-5 group-hover:rotate-6 transition-transform duration-500">
                    <f.icon className="h-6 w-6 md:h-7 md:w-7" />
                  </div>
                  <h3 className="font-serif font-bold text-base md:text-xl mb-2 text-primary">{t(`home.${f.key as 'whyUsExperience'}`)}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{t(`home.${f.key as 'whyUsExperience'}Desc`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED TRIPS ============ */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-cream to-muted/40">
        <div className="container">
          <Reveal className="flex items-end justify-between flex-wrap gap-4 mb-10 md:mb-12">
            <div>
              <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">{isAr ? 'رحلاتنا المميزة' : 'Curated experiences'}</div>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary mb-2">{t('home.featuredTrips')}</h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-md">{t('home.featuredTripsDesc')}</p>
            </div>
            <Button asChild variant="ghost" className="text-accent-700 hover:text-accent hover:bg-accent/10 group">
              <Link href="/trips">
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
        <section className="py-16 md:py-24 bg-primary-800 text-cream relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 md:w-96 h-72 md:h-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 md:w-96 h-72 md:h-96 rounded-full bg-accent/5 blur-3xl" />
          <div className="container relative">
            <Reveal className="text-center mb-10 md:mb-14">
              <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">
                {isAr ? 'آراء عملائنا' : 'What our guests say'}
              </div>
              <h2 className="font-serif text-3xl md:text-5xl font-bold mb-2">
                {isAr ? 'تجارب حقيقية من رحلاتهم معنا' : 'Real stories from real travelers'}
              </h2>
              <p className="text-sm md:text-base opacity-75 max-w-xl mx-auto">
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
      <section className="py-16 md:py-24 bg-cream">
        <div className="container">
          <Reveal>
            <div className="relative max-w-5xl mx-auto rounded-2xl md:rounded-3xl gradient-luxury text-cream p-8 md:p-16 text-center overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
              <div className="absolute -top-32 -right-32 w-72 md:w-96 h-72 md:h-96 rounded-full bg-accent/15 blur-3xl" />

              <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-accent mx-auto mb-4 md:mb-6" />
              <h2 className="font-serif text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-balance">
                {isAr ? 'جاهز لمغامرتك القادمة؟' : 'Ready for your next adventure?'}
              </h2>
              <p className="text-sm md:text-lg opacity-90 mb-8 md:mb-10 max-w-2xl mx-auto">
                {isAr
                  ? 'احجز رحلتك اليوم واستمتع بتجربة سياحية فاخرة لا تُنسى في شرم الشيخ'
                  : 'Book today and enjoy an unforgettable luxury experience in Sharm El Sheikh'}
              </p>
              <Button asChild size="lg" className="bg-accent text-primary hover:bg-accent-400 font-bold shadow-2xl shadow-accent/40 group">
                <Link href="/trips">
                  {t('common.bookNow')}
                  <ArrowRight className="h-5 w-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
