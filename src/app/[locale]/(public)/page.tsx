import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { TripCard } from '@/components/public/trip-card';
import { Reveal } from '@/components/public/motion';
import { HeroSlider } from '@/components/public/hero-slider';
import { ReviewsCarousel, type ReviewItem } from '@/components/public/reviews-carousel';
import { FbReviewsStrip } from '@/components/public/fb-reviews-strip';
import { api } from '@/lib/api';
import type { TripDTO } from '@/types/api';
import {
  Award, Shield, Compass, Clock, ArrowRight, Sparkles, Star, Users, MessageCircle, ShieldCheck,
  ChevronDown, MapPin, Play, Search, CalendarCheck, CreditCard, Smile, Globe2, BedDouble,
  Camera, Heart,
} from 'lucide-react';
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
  let reviewsAvg = 0;
  let reviewsTotal = 0;
  try {
    // Reviews are company-wide only (submitted from the /review page).
    const company = await api.get<{ items: ReviewItem[]; total: number; average: number }>('/public/reviews/company?limit=24');
    reviews = company.items;
    reviewsAvg = company.average || 0;
    reviewsTotal = company.total || 0;
  } catch { reviews = []; }

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

            {/* Reviews CTA buttons — prominent */}
            <Reveal delay={0.55}>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                <Link
                  href="/review"
                  className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-primary font-bold text-sm shadow-lg shadow-accent/30 hover:bg-accent-400 hover:-translate-y-0.5 transition-all"
                >
                  <span className="inline-flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(reviewsAvg || 5) ? 'fill-current' : 'fill-transparent'}`} strokeWidth={2} />
                    ))}
                  </span>
                  <span>{(reviewsAvg || 5).toFixed(1)}</span>
                  <span className="text-primary/70">·</span>
                  <span>
                    <strong>{reviewsTotal || 0}</strong>{' '}
                    {L(locale, { ar: 'تقييم', en: 'reviews', ru: 'отзывов', it: 'recensioni' })}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                </Link>
                <a
                  href="https://www.facebook.com/profile.php?id=61550600242507&sk=reviews"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#0e63d4] text-white font-bold text-sm shadow-lg shadow-[#1877F2]/30 hover:-translate-y-0.5 transition-all"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.3.2 2.3.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3V22A10 10 0 0 0 22 12Z"/></svg>
                  {L(locale, { ar: 'تقييمات فيسبوك', en: 'Facebook reviews', ru: 'Отзывы Facebook', it: 'Recensioni Facebook' })}
                </a>
              </div>
            </Reveal>

            {/* Trust strip — compact */}
            <Reveal delay={0.65}>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-cream/75">
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

      {/* ============ ABOUT / INTRO ============ */}
      <section className="relative py-14 md:py-24 bg-cream overflow-hidden hairline-top">
        <div aria-hidden className="orb-accent orb-accent-sm absolute top-10 -end-20 pointer-events-none animate-blob" />
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Image collage */}
            <Reveal>
              <div className="relative max-w-md lg:max-w-none mx-auto">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden card-shadow-gold">
                  <Image
                    src="/hero-slides/hero-03.jpg"
                    alt={L(locale, { ar: 'لوتس شرم — شركة السياحة الفاخرة', en: 'Lotus Sharm — luxury tourism', ru: 'Lotus Sharm — люкс-туризм', it: 'Lotus Sharm — turismo di lusso' }) as string}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 via-transparent to-transparent" />
                </div>

                {/* Floating badge — top */}
                <div className="absolute -top-4 -end-4 sm:-top-6 sm:-end-6 bg-white rounded-2xl px-4 py-3 shadow-2xl border border-accent/20 max-w-[180px]">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center text-primary shrink-0">
                      <Award className="h-5 w-5" />
                    </div>
                    <div className="leading-tight">
                      <div className="font-serif text-xl font-bold text-primary">{settings.yearsExperience}+</div>
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                        {L(locale, { ar: 'سنة خبرة', en: 'Years', ru: 'Лет', it: 'Anni' })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badge — bottom */}
                <div className="absolute -bottom-4 -start-4 sm:-bottom-6 sm:-start-6 bg-primary text-cream rounded-2xl px-4 py-3 shadow-2xl border border-accent/40 max-w-[200px]">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/40 flex items-center justify-center text-accent shrink-0">
                      <Star className="h-5 w-5 fill-current" />
                    </div>
                    <div className="leading-tight">
                      <div className="font-serif text-xl font-bold text-accent">10,000+</div>
                      <div className="text-[10px] text-cream/70 font-bold uppercase tracking-wider">
                        {L(locale, { ar: 'سائح راضي', en: 'Happy guests', ru: 'Гостей', it: 'Ospiti felici' })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative gold ring */}
                <div aria-hidden className="absolute -z-10 -bottom-8 -end-8 w-40 h-40 rounded-full border-2 border-accent/30 hidden lg:block" />
              </div>
            </Reveal>

            {/* Text */}
            <div>
              <Reveal>
                <span className="eyebrow">
                  {L(locale, { ar: 'تعرّف علينا', en: 'About us', ru: 'О нас', it: 'Chi siamo' })}
                </span>
                <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary leading-tight text-balance mb-4">
                  {L(locale, {
                    ar: 'شريكك المثالي لتجربة لا تُنسى في شرم الشيخ',
                    en: 'Your trusted partner for unforgettable Sharm El Sheikh experiences',
                    ru: 'Ваш надёжный партнёр в Шарм-эль-Шейхе',
                    it: 'Il tuo partner di fiducia a Sharm El Sheikh',
                  })}
                </h2>
                <span aria-hidden className="block w-20 h-0.5 gradient-gold rounded-full mb-5" />
              </Reveal>

              <Reveal delay={0.15}>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
                  {L(locale, {
                    ar: 'في لوتس شرم، نقدم لك أكثر من مجرد رحلة سياحية — نقدم تجربة فاخرة مصممة بعناية، يقودها مرشدون محليون يعرفون كل ركن من أركان البحر الأحمر، وتدعمها خدمة عملاء حقيقية على مدار اليوم.',
                    en: "At Lotus Sharm, we offer more than just trips — we craft luxury experiences led by local guides who know every corner of the Red Sea, supported by genuine 24/7 customer care.",
                    ru: 'Lotus Sharm — это не просто экскурсии, а тщательно продуманные люксовые впечатления с местными гидами и круглосуточной поддержкой.',
                    it: 'A Lotus Sharm offriamo esperienze di lusso curate da guide locali esperte, con assistenza 24/7.',
                  })}
                </p>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
                  {L(locale, {
                    ar: 'من الغوص في الشعاب المرجانية إلى رحلات السفاري الصحراوية، من الفنادق الفاخرة إلى خدمات النقل الخاصة — كل تفصيلة مدروسة لتمنحك راحة بال كاملة طوال إقامتك.',
                    en: 'From coral reef diving to desert safaris, from luxury hotels to private transfers — every detail is thought through to give you complete peace of mind.',
                    ru: 'От дайвинга на коралловых рифах до сафари в пустыне, от люкс-отелей до индивидуальных трансферов — каждая деталь продумана.',
                    it: 'Dal diving alle safari nel deserto, dagli hotel di lusso ai transfer privati — ogni dettaglio è curato.',
                  })}
                </p>
              </Reveal>

              {/* Inline mini-features */}
              <Reveal delay={0.25}>
                <div className="grid sm:grid-cols-2 gap-3 mb-7">
                  {[
                    { icon: Globe2, ar: 'متعدد اللغات', en: 'Multi-language', ru: 'Многоязычный', it: 'Multilingue' },
                    { icon: ShieldCheck, ar: 'دفع آمن 100%', en: '100% secure payment', ru: 'Безопасная оплата', it: 'Pagamento sicuro' },
                    { icon: Heart, ar: 'مناسب للعائلات', en: 'Family-friendly', ru: 'Для семей', it: 'Famiglia' },
                    { icon: MessageCircle, ar: 'دعم 24/7', en: '24/7 support', ru: 'Поддержка 24/7', it: 'Supporto 24/7' },
                  ].map((m) => {
                    const I = m.icon;
                    return (
                      <div key={m.en} className="flex items-center gap-2.5">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-accent/15 text-accent-700 shrink-0">
                          <I className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-bold text-primary">{L(locale, m) as string}</span>
                      </div>
                    );
                  })}
                </div>
              </Reveal>

              <Reveal delay={0.35}>
                <div className="flex flex-wrap items-center gap-3">
                  <Button asChild className="bg-primary text-cream hover:bg-primary-900 font-bold group">
                    <Link href="/about">
                      {L(locale, { ar: 'تعرف علينا أكثر', en: 'Learn more', ru: 'Узнать больше', it: 'Scopri di più' })}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-accent/40 text-accent-700 hover:bg-accent/10">
                    <Link href="/contact">
                      <MessageCircle className="h-4 w-4" />
                      {L(locale, { ar: 'تواصل معنا', en: 'Contact us', ru: 'Связаться', it: 'Contatti' })}
                    </Link>
                  </Button>
                </div>
              </Reveal>
            </div>
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

      {/* ============ FEATURES SHOWCASE (zig-zag) ============ */}
      <section className="relative py-14 md:py-24 bg-cream overflow-hidden hairline-top">
        <div aria-hidden className="orb-accent orb-accent-sm absolute top-1/4 -end-24 pointer-events-none animate-blob" style={{ animationDelay: '2s' }} />
        <div aria-hidden className="orb-accent orb-accent-sm absolute bottom-1/4 -start-24 pointer-events-none animate-blob" style={{ animationDelay: '6s' }} />

        <div className="container relative">
          <Reveal className="text-center max-w-2xl mx-auto mb-12 md:mb-16 flex flex-col items-center">
            <span className="eyebrow">{L(locale, { ar: 'مميزاتنا', en: 'What we offer', ru: 'Наши преимущества', it: 'Cosa offriamo' })}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary leading-tight text-balance">
              {L(locale, {
                ar: 'تجربة سياحية متكاملة من البداية للنهاية',
                en: 'A complete travel experience, beginning to end',
                ru: 'Полный туристический опыт от начала до конца',
                it: "Un'esperienza di viaggio completa, dall'inizio alla fine",
              })}
            </h2>
            <span className="rule-gold" />
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl">
              {L(locale, {
                ar: 'كل ما تحتاجه لرحلة مثالية في شرم الشيخ تحت سقف واحد — رحلات، فنادق، مواصلات، ومرشدين محترفين.',
                en: 'Everything you need for a perfect Sharm El Sheikh trip under one roof — tours, hotels, transfers, and expert guides.',
                ru: 'Всё для идеального путешествия в Шарм-эль-Шейхе в одном месте.',
                it: 'Tutto per un viaggio perfetto a Sharm El Sheikh in un solo posto.',
              })}
            </p>
          </Reveal>

          <div className="space-y-12 md:space-y-20">
            {[
              {
                img: '/hero-slides/hero-05.jpg',
                icon: Compass,
                badge: { ar: 'رحلات مميزة', en: 'Curated tours', ru: 'Туры', it: 'Tour' },
                title: {
                  ar: 'مغامرات لا تُنسى بقيادة خبراء محليين',
                  en: 'Unforgettable adventures led by local experts',
                  ru: 'Незабываемые приключения с местными экспертами',
                  it: 'Avventure indimenticabili con guide locali',
                },
                desc: {
                  ar: 'من رحلات الغوص في الشعاب المرجانية، إلى السفاري في الصحراء، والإبحار في البحر الأحمر — مرشدوننا يحملون شغف المكان ويعرفون أفضل اللحظات والأماكن لكل تجربة.',
                  en: 'From coral reef dives to desert safaris and Red Sea sailing — our guides carry a passion for the place and know the best spots and moments for every experience.',
                  ru: 'От дайвинга и сафари до плавания по Красному морю — наши гиды знают лучшие места и моменты.',
                  it: 'Dal diving al safari nel deserto alla navigazione nel Mar Rosso — le nostre guide conoscono i luoghi migliori.',
                },
                bullets: [
                  { ar: 'مجموعات صغيرة وخاصة', en: 'Small private groups', ru: 'Малые группы', it: 'Piccoli gruppi' },
                  { ar: 'معدّات احترافية', en: 'Pro equipment', ru: 'Проф. снаряжение', it: 'Attrezzatura pro' },
                  { ar: 'وجبات وترفيه مشمول', en: 'Meals & entertainment included', ru: 'Питание включено', it: 'Pasti inclusi' },
                ],
                cta: { href: '/trips', ar: 'تصفح الرحلات', en: 'Browse trips', ru: 'Туры', it: 'Tour' },
                reverse: false,
              },
              {
                img: '/hero-slides/hotels-tourists.jpg',
                icon: BedDouble,
                badge: { ar: 'إقامة فاخرة', en: 'Luxury stays', ru: 'Люкс отели', it: 'Soggiorni lusso' },
                title: {
                  ar: 'فنادق خمس نجوم بأسعار حصرية',
                  en: 'Five-star hotels at exclusive rates',
                  ru: 'Пятизвёздочные отели по эксклюзивным ценам',
                  it: 'Hotel 5 stelle a tariffe esclusive',
                },
                desc: {
                  ar: 'شراكات مع أرقى الفنادق على البحر الأحمر تتيح لك الإقامة في غرف بإطلالات خلابة، خدمة استثنائية، وأسعار لن تجدها في مكان آخر.',
                  en: 'Partnerships with the finest Red Sea hotels mean stunning rooms, exceptional service, and rates you won\'t find anywhere else.',
                  ru: 'Партнёрства с лучшими отелями Красного моря — потрясающие номера и эксклюзивные цены.',
                  it: 'Partnership con i migliori hotel del Mar Rosso — camere stupende e tariffe esclusive.',
                },
                bullets: [
                  { ar: 'all-inclusive ميسر', en: 'Easy all-inclusive', ru: 'Всё включено', it: 'All-inclusive facile' },
                  { ar: 'إطلالة على البحر', en: 'Sea-view rooms', ru: 'Вид на море', it: 'Vista mare' },
                  { ar: 'spa وأنشطة عائلية', en: 'Spa & family activities', ru: 'Спа и активности', it: 'Spa e attività' },
                ],
                cta: { href: '/hotels', ar: 'تصفح الفنادق', en: 'View hotels', ru: 'Отели', it: 'Hotel' },
                reverse: true,
              },
              {
                img: '/hero-slides/hero-12.jpg',
                icon: Camera,
                badge: { ar: 'تجارب مخصصة', en: 'Tailored experiences', ru: 'Индивидуально', it: 'Su misura' },
                title: {
                  ar: 'رحلتك بالطريقة التي تحبها',
                  en: 'Your trip, exactly the way you like it',
                  ru: 'Ваша поездка по вашим правилам',
                  it: 'Il tuo viaggio, come piace a te',
                },
                desc: {
                  ar: 'سفر عائلي؟ شهر عسل؟ رحلة عمل؟ مجموعة أصحاب؟ كل تجربة نُصمّمها بناءً على احتياجاتك — من اختيار المواعيد، إلى التفاصيل الصغيرة التي تصنع الفارق.',
                  en: 'Family trip? Honeymoon? Business retreat? Group of friends? We tailor every experience to your needs — from dates to the small details that make all the difference.',
                  ru: 'Семейный отдых, медовый месяц, бизнес или дружеская компания — мы подстраиваемся под вас.',
                  it: 'Famiglia, luna di miele, business o amici — adattiamo tutto alle tue esigenze.',
                },
                bullets: [
                  { ar: 'لباقة العائلات والأطفال', en: 'Family & kids friendly', ru: 'Для детей', it: 'Famiglia' },
                  { ar: 'تخفيضات للمجموعات', en: 'Group discounts', ru: 'Скидки группам', it: 'Sconti gruppo' },
                  { ar: 'مرشد ناطق بلغتك', en: 'Guide in your language', ru: 'Гид на вашем языке', it: 'Guida nella tua lingua' },
                ],
                cta: { href: '/contact', ar: 'صمم رحلتك', en: 'Plan your trip', ru: 'План тура', it: 'Pianifica' },
                reverse: false,
              },
            ].map((f, i) => {
              const FIcon = f.icon;
              return (
                <Reveal key={i}>
                  <div className={`grid lg:grid-cols-2 gap-8 lg:gap-14 items-center ${f.reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                    {/* Image */}
                    <div className="relative group">
                      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden card-shadow-gold">
                        <Image
                          src={f.img}
                          alt={L(locale, f.title) as string}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/55 via-primary-900/10 to-transparent" />
                        <div className="absolute bottom-4 start-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream/90 backdrop-blur border border-accent/30 text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider">
                          <FIcon className="h-3.5 w-3.5 text-accent" />
                          {L(locale, f.badge)}
                        </div>
                      </div>
                      {/* Floating sparkle */}
                      <div className="absolute -top-3 -end-3 w-12 h-12 rounded-2xl gradient-gold flex items-center justify-center text-primary shadow-xl shadow-accent/30 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                        <Sparkles className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Text */}
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-accent-700 mb-3">
                        <span className="font-serif text-2xl text-accent">{String(i + 1).padStart(2, '0')}</span>
                        <span className="w-8 h-px bg-accent" />
                        {L(locale, f.badge)}
                      </span>
                      <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-primary leading-tight mb-4 text-balance">
                        {L(locale, f.title)}
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5">
                        {L(locale, f.desc)}
                      </p>
                      <ul className="space-y-2 mb-6">
                        {f.bullets.map((b, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-primary">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-700 shrink-0">
                              <CalendarCheck className="h-3 w-3" />
                            </span>
                            <span className="font-semibold">{L(locale, b) as string}</span>
                          </li>
                        ))}
                      </ul>
                      <Button asChild className="bg-accent text-primary hover:bg-accent-400 font-bold group">
                        <Link href={f.cta.href as '/trips'}>
                          {L(locale, f.cta)}
                          <ArrowRight className="h-4 w-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ FACEBOOK REVIEWS STRIP — auto-scrolling marquee (above site reviews) ============ */}
      <FbReviewsStrip locale={locale} />

      {/* ============ REVIEWS CAROUSEL ============ */}
      {reviews.length > 0 && (
        <section className="relative py-10 md:py-16 bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900 text-cream overflow-hidden hairline-top">
          <div className="absolute -top-20 -right-20 w-64 md:w-80 h-64 md:h-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 md:w-80 h-64 md:h-80 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
          <span aria-hidden className="sparkle delay-1" style={{ top: '18%', insetInlineStart: '8%' }} />
          <span aria-hidden className="sparkle delay-3" style={{ top: '72%', insetInlineEnd: '10%' }} />
          <div aria-hidden className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

          <div className="container relative">
            {/* Compact header — title + rating + CTA all in one row on desktop */}
            <Reveal className="mb-6 md:mb-8">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
                <div className="text-center md:text-start">
                  <span className="eyebrow eyebrow-center md:!self-start">
                    {L(locale, { ar: 'آراء عملائنا', en: 'What our guests say', ru: 'Что говорят гости', it: 'I nostri ospiti' })}
                  </span>
                  <h2 className="font-serif text-2xl md:text-4xl font-bold leading-tight text-balance">
                    {L(locale, { ar: 'تجارب حقيقية من رحلاتهم معنا', en: 'Real stories from real travelers', ru: 'Реальные отзывы', it: 'Storie vere' })}
                  </h2>
                </div>

                {/* Right: rating badge + CTA stack */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 items-center md:items-end shrink-0">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream/10 border border-accent/30 backdrop-blur">
                    <span className="font-serif text-xl font-bold text-accent leading-none">{reviewsAvg.toFixed(1)}</span>
                    <div className="inline-flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < Math.round(reviewsAvg) ? 'fill-accent text-accent' : 'fill-transparent text-cream/25'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-cream/60 font-bold border-s border-cream/20 ps-2 ms-0.5">
                      {reviewsTotal} {L(locale, { ar: 'تقييم', en: 'reviews', ru: 'отзывов', it: 'recensioni' })}
                    </span>
                  </div>
                  <Button asChild size="sm" className="bg-accent text-primary hover:bg-accent-400 font-bold shadow-lg shadow-accent/25 group h-9 text-xs">
                    <Link href="/review">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {L(locale, { ar: 'اكتب تقييمك', en: 'Write a review', ru: 'Написать', it: 'Scrivi' })}
                      <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <ReviewsCarousel reviews={reviews} locale={locale} />
            </Reveal>
          </div>
        </section>
      )}

      {/* ============ HOW IT WORKS ============ */}
      <section className="relative py-14 md:py-24 bg-gradient-to-b from-cream via-muted/30 to-cream overflow-hidden">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        <div className="container relative">
          <Reveal className="text-center max-w-2xl mx-auto mb-12 md:mb-16 flex flex-col items-center">
            <span className="eyebrow">{L(locale, { ar: 'كيف تحجز', en: 'How it works', ru: 'Как забронировать', it: 'Come prenotare' })}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary leading-tight text-balance">
              {L(locale, {
                ar: '4 خطوات بسيطة لرحلة أحلامك',
                en: '4 simple steps to your dream trip',
                ru: '4 простых шага к мечте',
                it: '4 semplici passi al viaggio dei sogni',
              })}
            </h2>
            <span className="rule-gold" />
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {L(locale, {
                ar: 'من اختيار الرحلة إلى الاستمتاع بها — كل خطوة سهلة وواضحة.',
                en: 'From choosing your trip to enjoying it — every step is easy and clear.',
                ru: 'От выбора тура до самого путешествия — всё просто.',
                it: 'Dalla scelta del tour al viaggio — tutto è semplice.',
              })}
            </p>
          </Reveal>

          <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Connecting line (decorative, desktop only) */}
            <div aria-hidden className="hidden lg:block absolute top-12 inset-x-12 h-0.5 bg-gradient-to-r from-accent/10 via-accent/40 to-accent/10 -z-10" />

            {[
              {
                icon: Search,
                title: { ar: 'اختر رحلتك', en: 'Browse trips', ru: 'Выберите тур', it: 'Scegli il tour' },
                desc: { ar: 'تصفح كل الرحلات والمميزات والأسعار', en: 'Explore all tours, features, and prices', ru: 'Изучите туры и цены', it: 'Esplora tour e prezzi' },
              },
              {
                icon: CalendarCheck,
                title: { ar: 'حدد التاريخ', en: 'Pick a date', ru: 'Выберите дату', it: 'Scegli la data' },
                desc: { ar: 'اختار اليوم المناسب وعدد المسافرين', en: 'Pick your day and travelers', ru: 'Дата и количество', it: 'Data e ospiti' },
              },
              {
                icon: CreditCard,
                title: { ar: 'احجز بأمان', en: 'Book securely', ru: 'Безопасная оплата', it: 'Prenota sicuro' },
                desc: { ar: 'ادفع بطرق متعددة وبسرية تامة', en: 'Pay with multiple secure methods', ru: 'Несколько способов оплаты', it: 'Più metodi di pagamento' },
              },
              {
                icon: Smile,
                title: { ar: 'استمتع برحلتك', en: 'Enjoy your trip', ru: 'Наслаждайтесь', it: 'Goditi il viaggio' },
                desc: { ar: 'فريقنا معاك في كل خطوة، استمتع وسيب الباقي علينا', en: 'Our team is with you every step — just enjoy', ru: 'Команда рядом — просто отдыхайте', it: 'Il team è con te — rilassati' },
              },
            ].map((s, i) => {
              const SIcon = s.icon;
              return (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="group relative bg-white rounded-2xl p-5 md:p-6 card-shadow hover:card-shadow-gold hover:-translate-y-1.5 transition-all duration-300 border border-accent/15 h-full text-center">
                    {/* Step number */}
                    <span aria-hidden className="absolute top-3 end-3 font-serif text-4xl font-bold text-accent/10 group-hover:text-accent/25 transition-colors leading-none">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    {/* Icon */}
                    <div className="relative mx-auto w-16 h-16 mb-4">
                      <div className="absolute inset-0 rounded-2xl gradient-gold opacity-20 blur-md group-hover:opacity-40 transition-opacity" />
                      <div className="relative w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center text-primary shadow-lg shadow-accent/30 group-hover:rotate-[-6deg] transition-transform duration-500">
                        <SIcon className="h-7 w-7" />
                      </div>
                    </div>

                    <h3 className="font-serif text-lg md:text-xl font-bold text-primary mb-2 leading-tight group-hover:text-accent-700 transition-colors">
                      {L(locale, s.title)}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {L(locale, s.desc)}
                    </p>

                    {/* Arrow chevron (desktop, between cards) */}
                    {i < 3 && (
                      <div aria-hidden className="hidden lg:flex absolute top-10 -end-3 z-10 w-6 h-6 rounded-full bg-accent text-primary items-center justify-center shadow-md rtl:rotate-180">
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Bottom trust strip */}
          <Reveal delay={0.5}>
            <div className="mt-10 md:mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
              <span className="inline-flex items-center gap-2 font-bold text-primary">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                {L(locale, { ar: 'إلغاء مجاني', en: 'Free cancellation', ru: 'Бесплатная отмена', it: 'Cancellazione gratuita' })}
              </span>
              <span className="w-px h-4 bg-accent/30" />
              <span className="inline-flex items-center gap-2 font-bold text-primary">
                <Sparkles className="h-4 w-4 text-accent" />
                {L(locale, { ar: 'تأكيد فوري', en: 'Instant confirmation', ru: 'Мгновенное подтверждение', it: 'Conferma immediata' })}
              </span>
              <span className="w-px h-4 bg-accent/30" />
              <span className="inline-flex items-center gap-2 font-bold text-primary">
                <Award className="h-4 w-4 text-accent-700" />
                {L(locale, { ar: 'مرخصة قانونياً', en: 'Officially licensed', ru: 'Лицензировано', it: 'Concessionato' })}
              </span>
            </div>
          </Reveal>
        </div>
      </section>

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
                  {L(locale, { ar: 'احجز رحلتك اليوم واستمتع بتجربة سياحية لا تُنسى في شرم الشيخ', en: 'Book today and enjoy an unforgettable experience in Sharm El Sheikh', ru: 'Забронируйте сегодня и получите незабываемые впечатления в Шарм-эль-Шейхе', it: 'Prenota oggi e goditi un\'esperienza indimenticabile a Sharm El Sheikh' })}
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
