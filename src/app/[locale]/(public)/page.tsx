import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { TripCard } from '@/components/public/trip-card';
import { Reveal } from '@/components/public/motion';
import { HeroSlider } from '@/components/public/hero-slider';
import { ReviewsCarousel, type ReviewItem } from '@/components/public/reviews-carousel';
import { FacebookReviewsWidget } from '@/components/public/facebook-reviews-widget';
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
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/json-ld';
import { PAYMENT_METHODS } from '@/lib/payment-methods';
import {
  SITE_URL, buildPageMetadata, buildTravelAgencyLd, buildWebsiteLd,
  buildBreadcrumbLd, buildFaqLd, buildAggregateRating, crumbLabel,
} from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: '',
    title: {
      ar: 'لوتس شرم للسياحة — رحلات شرم الشيخ، فنادق، سفاري، خدمات النقل',
      en: 'Lotus Sharm Tourism — Sharm El Sheikh Tours, Hotels, Safari & Transfers',
      ru: 'Lotus Sharm — Экскурсии и Отели в Шарм-эль-Шейхе, Сафари, Трансферы',
      it: 'Lotus Sharm Tourism — Tour Sharm El Sheikh, Hotel, Safari, Transfer',
      de: 'Lotus Sharm Tourism — Sharm El Sheikh Touren, Hotels, Safari & Transfers',
    },
    description: {
      ar: 'احجز رحلات شرم الشيخ اليومية مع لوتس شرم: رأس محمد، الجزيرة البيضاء، سفاري الصحراء، عرض الدلافين، يخت كاتاماران، فنادق وخدمات نقل من المطار. خبرة 13 سنة وأسعار مميزة بالدولار والجنيه.',
      en: 'Book Sharm El Sheikh day tours with Lotus Sharm: Ras Mohammed, White Island, desert safari, dolphin show, catamaran cruise, hotels and airport transfers. 13+ years of expertise — prices in USD & EGP.',
      ru: 'Бронируйте экскурсии в Шарм-эль-Шейхе с Lotus Sharm: Рас-Мохаммед, Белый остров, сафари в пустыне, шоу дельфинов, прогулки на катамаране, отели и трансферы. 13+ лет опыта.',
      it: 'Prenota escursioni a Sharm El Sheikh con Lotus Sharm: Ras Mohammed, Isola Bianca, safari nel deserto, spettacolo dei delfini, catamarano, hotel e transfer aeroportuali. 13+ anni di esperienza.',
      de: 'Buchen Sie Sharm El Sheikh Tagesausflüge mit Lotus Sharm: Ras Mohammed, Weiße Insel, Wüstensafari, Delfinshow, Katamaran-Tour, Hotels und Flughafentransfers. 13+ Jahre Erfahrung.',
    },
    keywords: {
      ar: 'رحلات شرم الشيخ, شرم الشيخ سياحة, راس محمد, الجزيرة البيضاء, سفاري شرم الشيخ, عرض الدولفين, يخت شرم الشيخ, فنادق شرم الشيخ, نقل مطار شرم الشيخ, لوتس شرم',
      en: 'sharm el sheikh tours, sharm el sheikh excursions, ras mohammed, white island, sharm desert safari, dolphin show sharm, sharm catamaran, sharm hotels, sharm airport transfer, lotus sharm tourism',
      ru: 'экскурсии Шарм-эль-Шейх, Рас-Мохаммед, Белый остров, сафари Шарм, шоу дельфинов Шарм, отели Шарм, трансфер аэропорт Шарм, Lotus Sharm',
      it: 'tour sharm el sheikh, escursioni sharm, ras mohammed, isola bianca, safari sharm, delfini sharm, hotel sharm, transfer aeroporto sharm, lotus sharm',
      de: 'sharm el sheikh touren, ausflüge sharm, ras mohammed, weiße insel, wüstensafari sharm, delfinshow sharm, hotels sharm, flughafentransfer sharm, lotus sharm',
    },
  });
}

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

  // === Structured data (JSON-LD) for Sharm El Sheikh tourism search ===
  const orgLd: Record<string, unknown> = buildTravelAgencyLd(settings, locale);
  if (reviewsTotal > 0 && reviewsAvg > 0) {
    orgLd.aggregateRating = buildAggregateRating(reviewsAvg, reviewsTotal);
  }
  const homeUrl = `${SITE_URL}/${locale}`;
  const breadcrumbLd = buildBreadcrumbLd([{ name: crumbLabel('home', locale), url: homeUrl }]);
  const websiteLd = buildWebsiteLd(locale);
  const faqLd = buildFaqLd([
    {
      q: L(locale, {
        ar: 'ما هي أفضل الرحلات في شرم الشيخ؟',
        en: 'What are the best tours in Sharm El Sheikh?',
        ru: 'Какие лучшие экскурсии в Шарм-эль-Шейхе?',
        it: 'Quali sono le migliori escursioni a Sharm El Sheikh?',
        de: 'Was sind die besten Touren in Sharm El Sheikh?',
      }),
      a: L(locale, {
        ar: 'أفضل الرحلات في شرم الشيخ: محمية رأس محمد للسنوركلينج، الجزيرة البيضاء، سفاري الصحراء بالكواد والجمل، عرض الدلافين، يخت كاتاماران فاخر، ورحلة الكنيسة والمسجد والجامع المعلق.',
        en: 'Top Sharm El Sheikh tours include Ras Mohammed snorkelling, White Island, desert quad/camel safari, dolphin show, catamaran yacht cruise, and Sharm city tour.',
        ru: 'Лучшие экскурсии: Рас-Мохаммед со снорклингом, Белый остров, пустынное сафари на квадроциклах/верблюдах, шоу дельфинов, прогулка на катамаране.',
        it: 'I migliori tour includono Ras Mohammed con snorkeling, Isola Bianca, safari nel deserto in quad/cammello, spettacolo dei delfini, catamarano.',
        de: 'Top-Touren: Ras Mohammed Schnorcheln, Weiße Insel, Wüstensafari mit Quad/Kamel, Delfinshow, Katamaran-Kreuzfahrt.',
      }),
    },
    {
      q: L(locale, {
        ar: 'كم تكلفة رحلة شرم الشيخ اليومية؟',
        en: 'How much does a Sharm El Sheikh day tour cost?',
        ru: 'Сколько стоит однодневная экскурсия в Шарм-эль-Шейхе?',
        it: 'Quanto costa un tour giornaliero a Sharm El Sheikh?',
        de: 'Wie viel kostet ein Tagesausflug in Sharm El Sheikh?',
      }),
      a: L(locale, {
        ar: 'تبدأ أسعار الرحلات اليومية من 25$ للأجانب أو من 400 جنيه للمصريين، وتشمل النقل والمرشد وأحياناً الغداء حسب الرحلة.',
        en: 'Day tours start from $25 for foreign visitors or 400 EGP for locals, including transfer, guide and often lunch depending on the trip.',
        ru: 'Цена от $25 для иностранцев и от 400 EGP для местных. Включает трансфер, гида и часто обед.',
        it: 'Le escursioni partono da 25$ per stranieri o 400 EGP per egiziani, includono trasferimento, guida e spesso il pranzo.',
        de: 'Tagesausflüge ab 25 $ für ausländische Gäste oder 400 EGP für Einheimische, inklusive Transfer, Reiseleiter und oft Mittagessen.',
      }),
    },
    {
      q: L(locale, {
        ar: 'هل توفرون استقبال من مطار شرم الشيخ؟',
        en: 'Do you offer Sharm El Sheikh airport transfers?',
        ru: 'Предоставляете ли вы трансфер из аэропорта Шарм-эль-Шейха?',
        it: 'Offrite i transfer dall\'aeroporto di Sharm El Sheikh?',
        de: 'Bieten Sie Flughafentransfers in Sharm El Sheikh an?',
      }),
      a: L(locale, {
        ar: 'نعم — خدمات استقبال وتوصيل من مطار شرم الشيخ بسيارات خاصة، ميكروباص، أو أوتوبيس لأي فندق. وكذلك بين شرم الشيخ ودهب والقاهرة والغردقة.',
        en: 'Yes — private car, microbus or coach transfers from Sharm El Sheikh airport to any hotel, and between Sharm, Dahab, Cairo and Hurghada.',
        ru: 'Да — трансферы из аэропорта Шарм-эль-Шейха на легковом авто, микроавтобусе или автобусе до любого отеля.',
        it: 'Sì — transfer privati, microbus o pullman dall\'aeroporto di Sharm El Sheikh a qualsiasi hotel, e tra Sharm, Dahab, Il Cairo e Hurghada.',
        de: 'Ja — private Transfers, Microbus oder Reisebus vom Flughafen Sharm El Sheikh zu jedem Hotel, sowie zwischen Sharm, Dahab, Kairo und Hurghada.',
      }),
    },
    {
      q: L(locale, {
        ar: 'هل أحجز فنادق شرم الشيخ من خلالكم؟',
        en: 'Can I book Sharm El Sheikh hotels with you?',
        ru: 'Можно ли забронировать отели Шарм-эль-Шейха у вас?',
        it: 'Posso prenotare gli hotel di Sharm El Sheikh con voi?',
        de: 'Kann ich Hotels in Sharm El Sheikh bei Ihnen buchen?',
      }),
      a: L(locale, {
        ar: 'نعم — نوفر أفضل أسعار فنادق شرم الشيخ ودهب على نظام All Inclusive وHalf Board مع تأكيد فوري ودفع آمن.',
        en: 'Yes — best rates on All Inclusive & Half Board hotels in Sharm El Sheikh and Dahab with instant confirmation and secure payment.',
        ru: 'Да — лучшие цены на отели Шарм-эль-Шейха и Дахаба, All Inclusive и Half Board, с мгновенным подтверждением.',
        it: 'Sì — migliori tariffe su hotel All Inclusive e Mezza Pensione a Sharm El Sheikh e Dahab con conferma immediata.',
        de: 'Ja — beste Preise für All-Inclusive- und Halbpension-Hotels in Sharm El Sheikh und Dahab mit sofortiger Bestätigung.',
      }),
    },
    {
      q: L(locale, {
        ar: 'بأي لغات تتحدث مرشدوكم؟',
        en: 'What languages do your guides speak?',
        ru: 'На каких языках говорят ваши гиды?',
        it: 'Che lingue parlano le vostre guide?',
        de: 'Welche Sprachen sprechen Ihre Reiseleiter?',
      }),
      a: L(locale, {
        ar: 'مرشدونا يتحدثون العربية، الإنجليزية، الروسية، الإيطالية والألمانية.',
        en: 'Our guides speak Arabic, English, Russian, Italian and German.',
        ru: 'Наши гиды говорят на арабском, английском, русском, итальянском и немецком.',
        it: 'Le nostre guide parlano arabo, inglese, russo, italiano e tedesco.',
        de: 'Unsere Reiseleiter sprechen Arabisch, Englisch, Russisch, Italienisch und Deutsch.',
      }),
    },
  ]);

  return (
    <>
      <JsonLd data={orgLd} id="ld-organization" />
      <JsonLd data={websiteLd} id="ld-website" />
      <JsonLd data={breadcrumbLd} id="ld-breadcrumb" />
      <JsonLd data={faqLd} id="ld-faq" />
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
                    {L(locale, { ar: 'تقييم', en: 'reviews', de: 'Bewertungen', ru: 'отзывов', it: 'recensioni' })}
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
                  {L(locale, { ar: 'تقييمات فيسبوك', en: 'Facebook reviews', de: 'Facebook-Bewertungen', ru: 'Отзывы Facebook', it: 'Recensioni Facebook' })}
                </a>
              </div>
            </Reveal>

            {/* Trust strip — compact */}
            <Reveal delay={0.65}>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-cream/75">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  {L(locale, { ar: 'مرخصة قانونياً', en: 'Licensed', de: 'Lizenziert', ru: 'Лицензировано', it: 'Concessionato' })}
                </span>
                <span className="w-px h-4 bg-cream/20" />
                <span className="inline-flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4 text-[#25D366]" />
                  {L(locale, { ar: 'دعم 24/7', en: '24/7 Support', de: '24/7-Support', ru: 'Поддержка 24/7', it: 'Supporto 24/7' })}
                </span>
              </div>
            </Reveal>
          </div>
        </div>

      </section>

      {/* ============ EASYCASH SECTION — directly after hero ============ */}
      <section className="relative py-12 md:py-16 bg-gradient-to-b from-cream via-muted/30 to-cream overflow-hidden">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        <div aria-hidden className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-accent/8 blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="container relative">
          {/* Heading */}
          <Reveal className="text-center max-w-3xl mx-auto mb-8 md:mb-10 flex flex-col items-center">
            <span className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-accent/15 border border-accent/40 text-accent text-[11px] font-extrabold uppercase tracking-[0.18em]">
              <Sparkles className="h-3.5 w-3.5" />
              {L(locale, { ar: 'دفع آمن وتقسيط لحد 18 شهر', en: 'Secure payment & up to 18-month instalments', de: 'Sichere Zahlung & bis zu 18 Monate Raten', ru: 'Безопасная оплата и рассрочка до 18 месяцев', it: 'Pagamento sicuro & rate fino a 18 mesi' })}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary leading-tight text-balance">
              {L(locale, {
                ar: 'ادفع أو قسّط رحلتك مع EasyCash',
                en: 'Pay now or in instalments — with EasyCash',
                de: 'Sofort zahlen oder in Raten — mit EasyCash',
                ru: 'Оплатите сразу или в рассрочку — с EasyCash',
                it: 'Paga subito o a rate — con EasyCash',
              })}
            </h2>
            <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl">
              {L(locale, {
                ar: 'احجز أي رحلة في شرم الشيخ ودفع بالطريقة اللي تناسبك — كارت بنكي، محفظة، Apple Pay، أو تقسيط مع البنك الأهلي / valU / Aman / Souhoola / Forsa / Tru / Klivvr.',
                en: 'Book any Sharm El Sheikh trip and pay the way that fits you — card, wallet, Apple Pay, or instalments through NBE / valU / Aman / Souhoola / Forsa / Tru / Klivvr.',
                de: 'Buchen Sie eine Sharm-El-Sheikh-Tour und zahlen Sie nach Wahl — Karte, Wallet, Apple Pay oder in Raten über NBE / valU / Aman / Souhoola / Forsa / Tru / Klivvr.',
                ru: 'Бронируйте экскурсии и платите удобно — карта, кошелёк, Apple Pay или рассрочка NBE / valU / Aman / Souhoola / Forsa / Tru / Klivvr.',
                it: 'Prenota qualsiasi tour e paga come preferisci — carta, wallet, Apple Pay o rate con NBE / valU / Aman / Souhoola / Forsa / Tru / Klivvr.',
              })}
            </p>
          </Reveal>

          {/* Logo + benefits row */}
          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 md:gap-6 items-stretch mb-8 md:mb-10">
              {/* Logo card */}
              <div className="lg:col-span-2 relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-primary-800 to-primary-900 text-cream p-7 md:p-9 flex flex-col justify-between min-h-[240px] shadow-xl">
                <div aria-hidden className="absolute -top-14 -right-14 w-44 h-44 rounded-full bg-accent/20 blur-2xl" />
                <div className="relative inline-flex items-center justify-center rounded-2xl bg-cream p-4 self-start shadow-lg">
                  <Image src="/logo-easycash.png" alt="EasyCash" width={120} height={120} className="h-16 w-16 md:h-20 md:w-20 object-contain" />
                </div>
                <div className="relative mt-5">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-accent font-bold mb-1.5">
                    {L(locale, { ar: 'الشريك الرسمي للتقسيط', en: 'Our official instalment partner', de: 'Offizieller Ratenpartner', ru: 'Партнёр по рассрочке', it: 'Partner ufficiale per le rate' })}
                  </div>
                  <p className="font-serif text-xl md:text-2xl leading-tight font-bold">
                    {L(locale, {
                      ar: 'احجز دلوقتي… وادفع كاش أو على دفعات.',
                      en: 'Book now — pay full or in instalments.',
                      de: 'Jetzt buchen — voll oder in Raten zahlen.',
                      ru: 'Бронируйте — оплачивайте сразу или частями.',
                      it: 'Prenota ora — paga subito o a rate.',
                    })}
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Clock, title: L(locale, { ar: 'موافقة في دقايق', en: 'Approval in minutes', de: 'Zusage in Minuten', ru: 'Одобрение за минуты', it: 'Approvazione rapida' }), body: L(locale, { ar: 'بدون أوراق معقّدة.', en: 'No paperwork hassle.', de: 'Kein Papierkram.', ru: 'Без сложных бумаг.', it: 'Niente burocrazia.' }) },
                  { icon: CreditCard, title: L(locale, { ar: 'دفعات مرنة', en: 'Flexible plans', de: 'Flexible Pläne', ru: 'Гибкие планы', it: 'Piani flessibili' }), body: L(locale, { ar: 'من شهر لحد 18 شهر.', en: 'From 1 to 18 months.', de: 'Von 1 bis 18 Monaten.', ru: 'От 1 до 18 месяцев.', it: 'Da 1 a 18 mesi.' }) },
                  { icon: ShieldCheck, title: L(locale, { ar: 'آمن ومضمون', en: 'Safe & secure', de: 'Sicher & geprüft', ru: 'Безопасно', it: 'Sicuro' }), body: L(locale, { ar: 'منصة EasyCash المعتمدة.', en: 'Trusted EasyCash platform.', de: 'Geprüfte EasyCash-Plattform.', ru: 'Проверенная платформа.', it: 'Piattaforma certificata.' }) },
                ].map((f, i) => (
                  <div key={i} className="group bg-white rounded-2xl p-4 md:p-5 border border-accent/15 hover:border-accent/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/25 to-accent/10 text-accent-700 flex items-center justify-center mb-3">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-serif text-base md:text-lg font-bold text-primary leading-tight mb-1">{f.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Payment methods grid — every option supported, grouped */}
          <Reveal delay={0.15}>
            <div className="bg-white rounded-3xl border border-accent/20 shadow-md p-5 md:p-7">
              {/* Pay now group */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="h-4 w-4 text-accent" />
                  <h3 className="font-serif text-sm md:text-base font-extrabold text-primary uppercase tracking-wider">
                    {L(locale, { ar: 'الدفع الفوري', en: 'Pay now', de: 'Sofortzahlung', ru: 'Оплата сейчас', it: 'Paga subito' })}
                  </h3>
                  <span className="flex-1 h-px bg-accent/20" />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {PAYMENT_METHODS.filter((m) => !m.installment).map((m) => (
                    <div key={m.name} className="group flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-cream/60 hover:bg-cream hover:border-accent/40 border border-transparent transition-all">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.src} alt={m.name} className="h-10 w-auto max-w-[64px] object-contain" loading="lazy" />
                      <span className="text-[10px] font-bold text-primary/80 leading-none text-center">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instalments group */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-accent" />
                  <h3 className="font-serif text-sm md:text-base font-extrabold text-primary uppercase tracking-wider">
                    {L(locale, { ar: 'التقسيط (لحد 18 شهر)', en: 'Instalments (up to 18 months)', de: 'Raten (bis 18 Monate)', ru: 'Рассрочка (до 18 мес.)', it: 'Rate (fino a 18 mesi)' })}
                  </h3>
                  <span className="flex-1 h-px bg-accent/20" />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2.5">
                  {PAYMENT_METHODS.filter((m) => m.installment).map((m) => (
                    <div key={`${m.name}-${m.suffix ?? ''}`} className="group relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-cream/60 hover:bg-cream hover:border-accent/40 border border-transparent transition-all">
                      {m.suffix && (
                        <span className="absolute top-1 end-1 text-[9px] font-extrabold text-accent-700 bg-accent/20 px-1 rounded">
                          {m.suffix}
                        </span>
                      )}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.src} alt={m.name} className="h-10 w-auto max-w-[64px] object-contain" loading="lazy" />
                      <span className="text-[10px] font-bold text-primary/80 leading-none text-center">
                        {m.name.replace(/ \d+m$/, '')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-accent/15">
                <p className="text-sm text-primary font-semibold text-center sm:text-start">
                  {L(locale, {
                    ar: 'متاح على كل الرحلات — بحرية، سفاري، غوص وغيرها.',
                    en: 'Available on every trip — sea tours, safaris, diving and more.',
                    de: 'Für alle Touren — Seefahrten, Safaris, Tauchen und mehr.',
                    ru: 'Доступно для всех экскурсий.',
                    it: 'Disponibile per ogni tour.',
                  })}
                </p>
                <Button asChild size="sm" className="bg-accent text-primary hover:bg-accent-400 font-bold shadow-md shadow-accent/25 group whitespace-nowrap">
                  <Link href="/trips">
                    {L(locale, { ar: 'احجز واقسّط الآن', en: 'Book & pay in instalments', de: 'Jetzt buchen & in Raten zahlen', ru: 'Бронировать в рассрочку', it: 'Prenota a rate' })}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mobile stats — separate band below hero (no overlap) */}
      <section className="md:hidden bg-primary-900 text-cream py-5">
        <div className="container">
          <div className="grid grid-cols-4 gap-3">
            {[
              { v: `${settings.yearsExperience}+`, l: L(locale, { ar: 'سنة', en: 'Yrs', de: 'Jahre', ru: 'Лет', it: 'Anni' }) },
              { v: '5★', l: L(locale, { ar: 'تقييم', en: 'Rating', de: 'Bewertung', ru: 'Рейтинг', it: 'Valutazione' }) },
              { v: '10k+', l: L(locale, { ar: 'سائح', en: 'Guests', de: 'Gäste', ru: 'Гостей', it: 'Ospiti' }) },
              { v: '24/7', l: L(locale, { ar: 'دعم', en: 'Support', de: 'Support', ru: 'Поддержка', it: 'Supporto' }) },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="font-serif text-xl font-bold text-accent leading-none">{s.v}</div>
                <div className="text-[10px] text-cream/70 uppercase tracking-wider mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FACEBOOK REVIEWS — directly after hero ============ */}
      <FacebookReviewsWidget />

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
                    alt={L(locale, { ar: 'لوتس شرم — شركة السياحة الفاخرة', en: 'Lotus Sharm — luxury tourism', de: 'Lotus Sharm — Luxustourismus', ru: 'Lotus Sharm — люкс-туризм', it: 'Lotus Sharm — turismo di lusso' }) as string}
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
                        {L(locale, { ar: 'سنة خبرة', en: 'Years', de: 'Jahre', ru: 'Лет', it: 'Anni' })}
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
                        {L(locale, { ar: 'سائح راضي', en: 'Happy guests', de: 'Zufriedene Gäste', ru: 'Гостей', it: 'Ospiti felici' })}
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
                  {L(locale, { ar: 'تعرّف علينا', en: 'About us', de: 'Über uns', ru: 'О нас', it: 'Chi siamo' })}
                </span>
                <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary leading-tight text-balance mb-4">
                  {L(locale, {
                    ar: 'شريكك المثالي لتجربة لا تُنسى في شرم الشيخ',
                    en: 'Your trusted partner for unforgettable Sharm El Sheikh experiences', de: 'Ihr vertrauensvoller Partner für unvergessliche Erlebnisse in Sharm El Sheikh',
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
                    en: "At Lotus Sharm, we offer more than just trips — we craft luxury experiences led by local guides who know every corner of the Red Sea, supported by genuine 24/7 customer care.", de: 'Bei Lotus Sharm bieten wir mehr als nur Ausflüge — wir gestalten Luxuserlebnisse mit einheimischen Guides, die jeden Winkel des Roten Meeres kennen, unterstützt durch echten Rund-um-die-Uhr-Service.',
                    ru: 'Lotus Sharm — это не просто экскурсии, а тщательно продуманные люксовые впечатления с местными гидами и круглосуточной поддержкой.',
                    it: 'A Lotus Sharm offriamo esperienze di lusso curate da guide locali esperte, con assistenza 24/7.',
                  })}
                </p>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
                  {L(locale, {
                    ar: 'من الغوص في الشعاب المرجانية إلى رحلات السفاري الصحراوية، من الفنادق الفاخرة إلى خدمات النقل الخاصة — كل تفصيلة مدروسة لتمنحك راحة بال كاملة طوال إقامتك.',
                    en: 'From coral reef diving to desert safaris, from luxury hotels to private transfers — every detail is thought through to give you complete peace of mind.', de: 'Vom Tauchen am Korallenriff bis zur Wüstensafari, von Luxushotels bis zu privaten Transfers — jedes Detail ist durchdacht, damit Sie sich völlig sorglos fühlen.',
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
                      {L(locale, { ar: 'تعرف علينا أكثر', en: 'Learn more', de: 'Mehr erfahren', ru: 'Узнать больше', it: 'Scopri di più' })}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-accent/40 text-accent-700 hover:bg-accent/10">
                    <Link href="/contact">
                      <MessageCircle className="h-4 w-4" />
                      {L(locale, { ar: 'تواصل معنا', en: 'Contact us', de: 'Kontaktieren Sie uns', ru: 'Связаться', it: 'Contatti' })}
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
            <span className="eyebrow">{L(locale, { ar: 'لماذا نحن', en: 'Why choose us', de: 'Warum wir', ru: 'Почему выбирают нас', it: 'Perché sceglierci' })}</span>
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
              <span className="eyebrow">{L(locale, { ar: 'رحلاتنا المميزة', en: 'Curated experiences', de: 'Sorgfältig kuratierte Erlebnisse', ru: 'Лучшие туры', it: 'Esperienze selezionate' })}</span>
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
            <span className="eyebrow">{L(locale, { ar: 'مميزاتنا', en: 'What we offer', de: 'Was wir bieten', ru: 'Наши преимущества', it: 'Cosa offriamo' })}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary leading-tight text-balance">
              {L(locale, {
                ar: 'تجربة سياحية متكاملة من البداية للنهاية',
                en: 'A complete travel experience, beginning to end', de: 'Ein komplettes Reiseerlebnis, von Anfang bis Ende',
                ru: 'Полный туристический опыт от начала до конца',
                it: "Un'esperienza di viaggio completa, dall'inizio alla fine",
              })}
            </h2>
            <span className="rule-gold" />
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl">
              {L(locale, {
                ar: 'كل ما تحتاجه لرحلة مثالية في شرم الشيخ تحت سقف واحد — رحلات، فنادق، مواصلات، ومرشدين محترفين.',
                en: 'Everything you need for a perfect Sharm El Sheikh trip under one roof — tours, hotels, transfers, and expert guides.', de: 'Alles für eine perfekte Sharm-El-Sheikh-Reise unter einem Dach — Touren, Hotels, Transfers und erfahrene Guides.',
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
                badge: { ar: 'رحلات مميزة', en: 'Curated tours', de: 'Kuratierte Touren', ru: 'Туры', it: 'Tour' },
                title: {
                  ar: 'مغامرات لا تُنسى بقيادة خبراء محليين',
                  en: 'Unforgettable adventures led by local experts',
                  de: 'Unvergessliche Abenteuer mit lokalen Experten',
                  ru: 'Незабываемые приключения с местными экспертами',
                  it: 'Avventure indimenticabili con guide locali',
                },
                desc: {
                  ar: 'من رحلات الغوص في الشعاب المرجانية، إلى السفاري في الصحراء، والإبحار في البحر الأحمر — مرشدوننا يحملون شغف المكان ويعرفون أفضل اللحظات والأماكن لكل تجربة.',
                  en: 'From coral reef dives to desert safaris and Red Sea sailing — our guides carry a passion for the place and know the best spots and moments for every experience.',
                  de: 'Vom Tauchen am Korallenriff über Wüstensafaris bis zum Segeln im Roten Meer — unsere Guides lieben die Region und kennen die besten Orte und Momente für jedes Erlebnis.',
                  ru: 'От дайвинга и сафари до плавания по Красному морю — наши гиды знают лучшие места и моменты.',
                  it: 'Dal diving al safari nel deserto alla navigazione nel Mar Rosso — le nostre guide conoscono i luoghi migliori.',
                },
                bullets: [
                  { ar: 'مجموعات صغيرة وخاصة', en: 'Small private groups', de: 'Kleine private Gruppen', ru: 'Малые группы', it: 'Piccoli gruppi' },
                  { ar: 'معدّات احترافية', en: 'Pro equipment', de: 'Profi-Ausrüstung', ru: 'Проф. снаряжение', it: 'Attrezzatura pro' },
                  { ar: 'وجبات وترفيه مشمول', en: 'Meals & entertainment included', de: 'Mahlzeiten & Unterhaltung inklusive', ru: 'Питание включено', it: 'Pasti inclusi' },
                ],
                cta: { href: '/trips', ar: 'تصفح الرحلات', en: 'Browse trips', de: 'Ausflüge ansehen', ru: 'Туры', it: 'Tour' },
                reverse: false,
              },
              {
                img: '/hero-slides/hotels-tourists.jpg',
                icon: BedDouble,
                badge: { ar: 'إقامة فاخرة', en: 'Luxury stays', de: 'Luxusunterkünfte', ru: 'Люкс отели', it: 'Soggiorni lusso' },
                title: {
                  ar: 'فنادق خمس نجوم بأسعار حصرية',
                  en: 'Five-star hotels at exclusive rates',
                  de: 'Fünf-Sterne-Hotels zu exklusiven Preisen',
                  ru: 'Пятизвёздочные отели по эксклюзивным ценам',
                  it: 'Hotel 5 stelle a tariffe esclusive',
                },
                desc: {
                  ar: 'شراكات مع أرقى الفنادق على البحر الأحمر تتيح لك الإقامة في غرف بإطلالات خلابة، خدمة استثنائية، وأسعار لن تجدها في مكان آخر.',
                  en: 'Partnerships with the finest Red Sea hotels mean stunning rooms, exceptional service, and rates you won\'t find anywhere else.',
                  de: 'Partnerschaften mit den besten Hotels am Roten Meer bedeuten traumhafte Zimmer, außergewöhnlichen Service und Preise, die Sie sonst nirgends finden.',
                  ru: 'Партнёрства с лучшими отелями Красного моря — потрясающие номера и эксклюзивные цены.',
                  it: 'Partnership con i migliori hotel del Mar Rosso — camere stupende e tariffe esclusive.',
                },
                bullets: [
                  { ar: 'all-inclusive ميسر', en: 'Easy all-inclusive', de: 'Unkompliziert All-Inclusive', ru: 'Всё включено', it: 'All-inclusive facile' },
                  { ar: 'إطلالة على البحر', en: 'Sea-view rooms', de: 'Zimmer mit Meerblick', ru: 'Вид на море', it: 'Vista mare' },
                  { ar: 'spa وأنشطة عائلية', en: 'Spa & family activities', de: 'Spa & Familienaktivitäten', ru: 'Спа и активности', it: 'Spa e attività' },
                ],
                cta: { href: '/hotels', ar: 'تصفح الفنادق', en: 'View hotels', de: 'Hotels ansehen', ru: 'Отели', it: 'Hotel' },
                reverse: true,
              },
              {
                img: '/hero-slides/hero-12.jpg',
                icon: Camera,
                badge: { ar: 'تجارب مخصصة', en: 'Tailored experiences', de: 'Maßgeschneiderte Erlebnisse', ru: 'Индивидуально', it: 'Su misura' },
                title: {
                  ar: 'رحلتك بالطريقة التي تحبها',
                  en: 'Your trip, exactly the way you like it',
                  de: 'Ihre Reise, genau nach Ihrem Geschmack',
                  ru: 'Ваша поездка по вашим правилам',
                  it: 'Il tuo viaggio, come piace a te',
                },
                desc: {
                  ar: 'سفر عائلي؟ شهر عسل؟ رحلة عمل؟ مجموعة أصحاب؟ كل تجربة نُصمّمها بناءً على احتياجاتك — من اختيار المواعيد، إلى التفاصيل الصغيرة التي تصنع الفارق.',
                  en: 'Family trip? Honeymoon? Business retreat? Group of friends? We tailor every experience to your needs — from dates to the small details that make all the difference.',
                  de: 'Familienurlaub? Flitterwochen? Geschäftsreise? Freundesgruppe? Wir gestalten jedes Erlebnis nach Ihren Wünschen — von den Terminen bis zu den kleinen Details, die den Unterschied machen.',
                  ru: 'Семейный отдых, медовый месяц, бизнес или дружеская компания — мы подстраиваемся под вас.',
                  it: 'Famiglia, luna di miele, business o amici — adattiamo tutto alle tue esigenze.',
                },
                bullets: [
                  { ar: 'لباقة العائلات والأطفال', en: 'Family & kids friendly', de: 'Familien- & kinderfreundlich', ru: 'Для детей', it: 'Famiglia' },
                  { ar: 'تخفيضات للمجموعات', en: 'Group discounts', de: 'Gruppenrabatte', ru: 'Скидки группам', it: 'Sconti gruppo' },
                  { ar: 'مرشد ناطق بلغتك', en: 'Guide in your language', de: 'Guide in Ihrer Sprache', ru: 'Гид на вашем языке', it: 'Guida nella tua lingua' },
                ],
                cta: { href: '/contact', ar: 'صمم رحلتك', en: 'Plan your trip', de: 'Reise planen', ru: 'План тура', it: 'Pianifica' },
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

      {/* (EasyCash section moved directly under the hero — search for
           "EASYCASH SECTION — directly after hero" below.) */}
      <section className="hidden">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        <div aria-hidden className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent/8 blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="container relative">
          <Reveal className="text-center max-w-2xl mx-auto mb-10 md:mb-14 flex flex-col items-center">
            <span className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-accent/15 border border-accent/40 text-accent text-[11px] font-extrabold uppercase tracking-[0.18em]">
              <Sparkles className="h-3.5 w-3.5" />
              {L(locale, { ar: 'خدمة جديدة', en: 'New service', de: 'Neuer Service', ru: 'Новая услуга', it: 'Nuovo servizio' })}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary leading-tight text-balance">
              {L(locale, {
                ar: 'قسط رحلتك — أقساط ميسرة مع EasyCash',
                en: 'Pay your trip in instalments — with EasyCash',
                de: 'Zahlen Sie Ihre Reise in Raten — mit EasyCash',
                ru: 'Оплачивайте поездку в рассрочку — с EasyCash',
                it: 'Paga il tuo viaggio a rate — con EasyCash',
              })}
            </h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl">
              {L(locale, {
                ar: 'كل رحلاتنا في شرم الشيخ متاحة الآن بالتقسيط — سهل، سريع، وبدون تعقيد.',
                en: 'All our Sharm El Sheikh trips are now available in instalments — simple, fast, and hassle-free.',
                de: 'Alle unsere Sharm-El-Sheikh-Touren sind ab sofort in Raten erhältlich — einfach, schnell und unkompliziert.',
                ru: 'Все наши экскурсии в Шарм-эль-Шейхе теперь доступны в рассрочку — просто, быстро и без лишних формальностей.',
                it: 'Tutti i nostri tour a Sharm El Sheikh sono ora disponibili a rate — semplice, veloce e senza complicazioni.',
              })}
            </p>
          </Reveal>

          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 items-stretch">
              {/* Logo + tagline card */}
              <div className="lg:col-span-2 relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-primary-800 to-primary-900 text-cream p-8 md:p-10 flex flex-col justify-between min-h-[280px] shadow-xl">
                <div aria-hidden className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-accent/20 blur-2xl" />
                <div aria-hidden className="absolute top-3 right-3 h-px w-24 bg-gradient-to-r from-transparent to-accent/60" />

                <div className="relative inline-flex items-center justify-center rounded-2xl bg-cream p-5 self-start shadow-lg">
                  <Image
                    src="/logo-easycash.png"
                    alt="EasyCash"
                    width={140}
                    height={140}
                    className="h-20 w-20 md:h-24 md:w-24 object-contain"
                  />
                </div>

                <div className="relative mt-6">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-accent font-bold mb-2">
                    {L(locale, {
                      ar: 'الشريك الرسمي للتقسيط',
                      en: 'Our official instalment partner',
                      de: 'Unser offizieller Ratenzahlungspartner',
                      ru: 'Наш официальный партнёр по рассрочке',
                      it: 'Il nostro partner ufficiale per le rate',
                    })}
                  </div>
                  <p className="font-serif text-2xl md:text-3xl leading-tight font-bold">
                    {L(locale, {
                      ar: 'احجز رحلتك دلوقتي… وادفعها على دفعات.',
                      en: 'Book your trip now — pay over time.',
                      de: 'Buchen Sie jetzt — zahlen Sie in Raten.',
                      ru: 'Бронируйте сейчас — платите частями.',
                      it: 'Prenota ora — paga a rate.',
                    })}
                  </p>
                </div>
              </div>

              {/* Benefits grid */}
              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
                {[
                  {
                    icon: Clock,
                    title: L(locale, { ar: 'موافقة في دقايق', en: 'Approval in minutes', de: 'Zusage in Minuten', ru: 'Одобрение за минуты', it: 'Approvazione in pochi minuti' }),
                    body: L(locale, { ar: 'بدون أوراق معقّدة ولا انتظار طويل.', en: 'No paperwork, no waiting around.', de: 'Kein Papierkram, keine langen Wartezeiten.', ru: 'Без сложных бумаг и долгого ожидания.', it: 'Niente burocrazia, niente attese.' }),
                  },
                  {
                    icon: CreditCard,
                    title: L(locale, { ar: 'دفعات مرنة', en: 'Flexible plans', de: 'Flexible Pläne', ru: 'Гибкие планы', it: 'Piani flessibili' }),
                    body: L(locale, { ar: 'اختار خطة الدفع اللي بتناسبك على عدة شهور.', en: 'Pick a plan that fits you across several months.', de: 'Wählen Sie einen Plan über mehrere Monate.', ru: 'Выберите план оплаты на несколько месяцев.', it: 'Scegli un piano su più mesi.' }),
                  },
                  {
                    icon: ShieldCheck,
                    title: L(locale, { ar: 'آمن ومضمون', en: 'Safe & secure', de: 'Sicher & geprüft', ru: 'Безопасно и надёжно', it: 'Sicuro e affidabile' }),
                    body: L(locale, { ar: 'كل المعاملات تتم عبر منصة EasyCash المعتمدة.', en: 'All transactions handled by the trusted EasyCash platform.', de: 'Alle Zahlungen über die geprüfte EasyCash-Plattform.', ru: 'Все операции через проверенную платформу EasyCash.', it: 'Tutto gestito dalla piattaforma EasyCash certificata.' }),
                  },
                ].map((f, i) => (
                  <div key={i} className="group bg-white rounded-2xl p-5 md:p-6 border border-accent/15 hover:border-accent/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-accent/25 to-accent/10 text-accent-700 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <f.icon className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <h3 className="font-serif text-lg md:text-xl font-bold text-primary leading-tight mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                  </div>
                ))}

                <div className="sm:col-span-3 flex flex-col sm:flex-row items-center justify-between gap-4 mt-1 px-5 py-4 rounded-2xl bg-gradient-to-r from-accent/15 via-accent/10 to-accent/15 border border-accent/30">
                  <p className="text-sm md:text-base text-primary font-semibold text-center sm:text-start">
                    {L(locale, {
                      ar: 'متاح على كل الرحلات — بحرية، سفاري، غوص وغيرها.',
                      en: 'Available on every trip — sea tours, safaris, diving and more.',
                      de: 'Verfügbar für alle Touren — Seefahrten, Safaris, Tauchen und mehr.',
                      ru: 'Доступно для всех экскурсий — морских туров, сафари, дайвинга и других.',
                      it: 'Disponibile per ogni tour — gite in mare, safari, immersioni e altro.',
                    })}
                  </p>
                  <Button asChild size="sm" className="bg-accent text-primary hover:bg-accent-400 font-bold shadow-md shadow-accent/25 group whitespace-nowrap">
                    <Link href="/trips">
                      {L(locale, {
                        ar: 'احجز واقسّط الآن',
                        en: 'Book & pay in instalments',
                        de: 'Jetzt buchen & in Raten zahlen',
                        ru: 'Бронировать в рассрочку',
                        it: 'Prenota a rate',
                      })}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

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
                    {L(locale, { ar: 'آراء عملائنا', en: 'What our guests say', de: 'Was unsere Gäste sagen', ru: 'Что говорят гости', it: 'I nostri ospiti' })}
                  </span>
                  <h2 className="font-serif text-2xl md:text-4xl font-bold leading-tight text-balance">
                    {L(locale, { ar: 'تجارب حقيقية من رحلاتهم معنا', en: 'Real stories from real travelers', de: 'Echte Geschichten von echten Reisenden', ru: 'Реальные отзывы', it: 'Storie vere' })}
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
                      {reviewsTotal} {L(locale, { ar: 'تقييم', en: 'reviews', de: 'Bewertungen', ru: 'отзывов', it: 'recensioni' })}
                    </span>
                  </div>
                  <Button asChild size="sm" className="bg-accent text-primary hover:bg-accent-400 font-bold shadow-lg shadow-accent/25 group h-9 text-xs">
                    <Link href="/review">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {L(locale, { ar: 'اكتب تقييمك', en: 'Write a review', de: 'Bewertung schreiben', ru: 'Написать', it: 'Scrivi' })}
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
            <span className="eyebrow">{L(locale, { ar: 'كيف تحجز', en: 'How it works', de: 'So funktioniert es', ru: 'Как забронировать', it: 'Come prenotare' })}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary leading-tight text-balance">
              {L(locale, {
                ar: '4 خطوات بسيطة لرحلة أحلامك',
                en: '4 simple steps to your dream trip', de: '4 einfache Schritte zu Ihrer Traumreise',
                ru: '4 простых шага к мечте',
                it: '4 semplici passi al viaggio dei sogni',
              })}
            </h2>
            <span className="rule-gold" />
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {L(locale, {
                ar: 'من اختيار الرحلة إلى الاستمتاع بها — كل خطوة سهلة وواضحة.',
                en: 'From choosing your trip to enjoying it — every step is easy and clear.', de: 'Von der Auswahl bis zum Genuss — jeder Schritt ist einfach und klar.',
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
                {L(locale, { ar: 'إلغاء مجاني', en: 'Free cancellation', de: 'Kostenlose Stornierung', ru: 'Бесплатная отмена', it: 'Cancellazione gratuita' })}
              </span>
              <span className="w-px h-4 bg-accent/30" />
              <span className="inline-flex items-center gap-2 font-bold text-primary">
                <Sparkles className="h-4 w-4 text-accent" />
                {L(locale, { ar: 'تأكيد فوري', en: 'Instant confirmation', de: 'Sofortige Bestätigung', ru: 'Мгновенное подтверждение', it: 'Conferma immediata' })}
              </span>
              <span className="w-px h-4 bg-accent/30" />
              <span className="inline-flex items-center gap-2 font-bold text-primary">
                <Award className="h-4 w-4 text-accent-700" />
                {L(locale, { ar: 'مرخصة قانونياً', en: 'Officially licensed', de: 'Offiziell lizenziert', ru: 'Лицензировано', it: 'Concessionato' })}
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
                  {L(locale, { ar: 'جاهز لمغامرتك القادمة؟', en: 'Ready for your next adventure?', de: 'Bereit für Ihr nächstes Abenteuer?', ru: 'Готовы к новому приключению?', it: 'Pronto per la prossima avventura?' })}
                </h2>
                <span className="rule-gold" />
                <p className="text-sm md:text-lg opacity-90 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
                  {L(locale, { ar: 'احجز رحلتك اليوم واستمتع بتجربة سياحية لا تُنسى في شرم الشيخ', en: 'Book today and enjoy an unforgettable experience in Sharm El Sheikh', de: 'Buchen Sie heute und genießen Sie ein unvergessliches Erlebnis in Sharm El Sheikh', ru: 'Забронируйте сегодня и получите незабываемые впечатления в Шарм-эль-Шейхе', it: 'Prenota oggi e goditi un\'esperienza indimenticabile a Sharm El Sheikh' })}
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
