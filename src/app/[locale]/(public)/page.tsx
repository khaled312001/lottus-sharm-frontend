import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { TripCard } from '@/components/public/trip-card';
import { Reveal } from '@/components/public/motion';
import { api } from '@/lib/api';
import type { TripDTO } from '@/types/api';
import { Award, Shield, Compass, Clock, ArrowRight, Sparkles, Quote } from 'lucide-react';
import { localeToApiCode } from '@/lib/utils';
import { getLocalizedTagline, getSiteSettings } from '@/lib/site-settings';

export const revalidate = 60;

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

  const heroImage =
    trips[0]?.heroImage?.url || trips[0]?.gallery[0]?.media?.url || '/hero-fallback.jpg';
  const isAr = locale === 'ar';

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative min-h-screen flex items-center text-cream overflow-hidden">
        {/* Background image */}
        {heroImage && (
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover scale-105"
          />
        )}
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/85 via-primary-800/70 to-primary-900/95" />
        {/* Gold accent glow */}
        <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="container relative z-10 pt-32 pb-16">
          <div className="max-w-3xl">
            <Reveal delay={0.1}>
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-cream/10 backdrop-blur border border-accent/30 text-accent text-sm font-semibold">
                <Sparkles className="h-4 w-4" />
                {settings.yearsExperience}+ {isAr ? 'سنة من الخبرة الفاخرة' : 'years of luxury experience'}
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.05] text-balance">
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
            <Reveal delay={0.3}>
              <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl leading-relaxed font-light">{tagline}</p>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="xl" className="bg-accent text-primary hover:bg-accent-400 font-bold shadow-2xl shadow-accent/30 group">
                  <Link href="/trips">
                    {t('home.ctaPrimary')}
                    <ArrowRight className="h-5 w-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild size="xl" variant="outline" className="border-cream/30 text-cream hover:bg-cream hover:text-primary">
                  <Link href="/contact">{t('home.ctaSecondary')}</Link>
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Floating stats bar at bottom */}
          <Reveal delay={0.6} className="absolute bottom-8 left-0 right-0">
            <div className="container">
              <div className="glass-dark rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {[
                  { v: '13+', l: isAr ? 'سنة خبرة' : 'Years' },
                  { v: '5★', l: isAr ? 'تقييم العملاء' : 'Rating' },
                  { v: '10k+', l: isAr ? 'سائح سعيد' : 'Happy guests' },
                  { v: '24/7', l: isAr ? 'دعم متواصل' : 'Support' },
                ].map((s) => (
                  <div key={s.l} className="text-center">
                    <div className="font-serif text-3xl md:text-4xl font-bold text-accent">{s.v}</div>
                    <div className="text-xs text-cream/80 uppercase tracking-wider">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-0 inset-x-0 flex justify-center pb-2 z-20 pointer-events-none">
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-accent/50 to-accent" />
        </div>
      </section>

      {/* ============ WHY US ============ */}
      <section className="py-24 bg-cream relative">
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">{isAr ? 'لماذا نحن' : 'Why choose us'}</div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-primary">{t('home.whyUs')}</h2>
            <div className="w-16 h-0.5 bg-accent mx-auto" />
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Award, key: 'whyUsExperience' },
              { icon: Shield, key: 'whyUsSafety' },
              { icon: Compass, key: 'whyUsBestPrice' },
              { icon: Clock, key: 'whyUsSupport' },
            ].map((f, i) => (
              <Reveal key={f.key} delay={i * 0.1}>
                <div className="group relative p-8 bg-white rounded-2xl border border-accent/10 hover:border-accent/40 transition-all duration-500 hover:-translate-y-2 card-shadow hover:card-shadow-gold h-full">
                  {/* Gold corner accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-accent/20 to-transparent rounded-tr-2xl rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-14 h-14 rounded-xl gradient-gold flex items-center justify-center text-primary mb-5 group-hover:rotate-6 transition-transform duration-500">
                    <f.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-serif font-bold text-xl mb-2 text-primary">{t(`home.${f.key as 'whyUsExperience'}`)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(`home.${f.key as 'whyUsExperience'}Desc`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED TRIPS ============ */}
      <section className="py-24 bg-gradient-to-b from-cream to-muted/40">
        <div className="container">
          <Reveal className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">{isAr ? 'رحلاتنا المميزة' : 'Curated experiences'}</div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-2">{t('home.featuredTrips')}</h2>
              <p className="text-muted-foreground max-w-md">{t('home.featuredTripsDesc')}</p>
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip, i) => (
                <TripCard key={trip.id} trip={trip} locale={locale} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ TESTIMONIAL / QUOTE ============ */}
      <section className="py-24 bg-primary-800 text-cream relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="container relative">
          <Reveal className="max-w-3xl mx-auto text-center">
            <Quote className="h-12 w-12 text-accent mx-auto mb-6 opacity-80" />
            <p className="font-serif text-2xl md:text-3xl leading-relaxed mb-8 text-balance">
              {isAr
                ? '"تجربة لا تُنسى! نظّموا لنا رحلة لراس محمد بشكل احترافي مع كل التفاصيل. الفريق محترم والأسعار ممتازة. أنصح بهم بشدة لأي حد عاوز يجرب سياحة مختلفة."'
                : '"An unforgettable experience! They organized our Ras Mohammed trip professionally with attention to every detail. Professional team, excellent prices. Highly recommended."'}
            </p>
            <div className="font-bold text-accent">
              {isAr ? '— أحمد محمد، القاهرة' : '— Ahmed Mohammed, Cairo'}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="py-24 bg-cream">
        <div className="container">
          <Reveal>
            <div className="relative max-w-5xl mx-auto rounded-3xl gradient-luxury text-cream p-12 md:p-16 text-center overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
              <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent/15 blur-3xl" />

              <Sparkles className="h-10 w-10 text-accent mx-auto mb-6" />
              <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4 text-balance">
                {isAr ? 'جاهز لمغامرتك القادمة؟' : 'Ready for your next adventure?'}
              </h2>
              <p className="text-lg opacity-90 mb-10 max-w-2xl mx-auto">
                {isAr
                  ? 'احجز رحلتك اليوم واستمتع بتجربة سياحية فاخرة لا تُنسى في شرم الشيخ'
                  : 'Book today and enjoy an unforgettable luxury experience in Sharm El Sheikh'}
              </p>
              <Button asChild size="xl" className="bg-accent text-primary hover:bg-accent-400 font-bold shadow-2xl shadow-accent/40 group">
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
