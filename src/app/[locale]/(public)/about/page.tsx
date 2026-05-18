import { setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/public/motion';
import { Award, Heart, Compass, Shield, Sparkles, Target, Eye, ArrowRight, Phone, MapPin, Users, Calendar, Briefcase, Mic, Plane, Star, Quote, MapPinned, MessageCircle, Search, ClipboardCheck, BadgeCheck, Trophy, Globe2 } from 'lucide-react';
import { getSiteSettings, getLocalizedName } from '@/lib/site-settings';
import { L } from '@/lib/utils';

export const revalidate = 120;

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const settings = await getSiteSettings();
  const brand = getLocalizedName(settings, locale);
  const isAr = locale === 'ar';

  const values = [
    { icon: Award,   ar: 'الجودة أولاً',  en: 'Quality First',       ru: 'Качество прежде всего', it: 'Qualità prima di tutto',
      arDesc: 'كل تفصيلة في رحلاتنا مختارة بعناية لتقدم أفضل تجربة سياحية ممكنة.',
      enDesc: 'Every detail in our trips is carefully chosen to deliver the best experience.',
      ruDesc: 'Каждая деталь наших туров тщательно подобрана для лучшего впечатления.',
      itDesc: 'Ogni dettaglio dei tour è scelto con cura per offrire la migliore esperienza.' },
    { icon: Heart,   ar: 'شغف الخدمة',     en: 'Passion for Service', ru: 'Страсть к сервису',     it: 'Passione per il servizio',
      arDesc: 'نعشق ما نفعل ونرى السعادة في عيون عملائنا، وهذا وقودنا اليومي.',
      enDesc: "We love what we do — the joy in our guests' eyes is our daily fuel.",
      ruDesc: 'Мы любим то, что делаем — радость в глазах гостей наше топливо.',
      itDesc: 'Amiamo ciò che facciamo — la gioia negli occhi degli ospiti ci motiva.' },
    { icon: Compass, ar: 'الابتكار',       en: 'Innovation',          ru: 'Инновации',             it: 'Innovazione',
      arDesc: 'نطور باستمرار وجهات ومسارات جديدة لتقديم تجارب مبتكرة وحصرية.',
      enDesc: 'We constantly develop new destinations and exclusive experiences.',
      ruDesc: 'Постоянно создаём новые направления и эксклюзивные маршруты.',
      itDesc: 'Sviluppiamo costantemente nuove destinazioni ed esperienze esclusive.' },
    { icon: Shield,  ar: 'الأمان والثقة',  en: 'Safety & Trust',      ru: 'Безопасность',          it: 'Sicurezza e fiducia',
      arDesc: 'فريقنا مدرب ومرخص، ومعداتنا معتمدة بأعلى معايير السلامة الدولية.',
      enDesc: 'Trained, certified team and equipment meeting international standards.',
      ruDesc: 'Сертифицированная команда и оборудование международных стандартов.',
      itDesc: 'Team certificato e attrezzatura conforme agli standard internazionali.' },
  ];

  const timeline = [
    { year: '2013', ar: 'تأسيس لوتس شرم — انطلاقتنا الأولى',           en: 'Lotus Sharm founded — our first launch',
      ru: 'Основание Lotus Sharm — наш первый запуск',
      it: 'Fondazione di Lotus Sharm — il nostro primo lancio' },
    { year: '2016', ar: 'توسيع الأسطول البحري وإضافة رحلات الغوص',      en: 'Marine fleet expanded, diving trips added',
      ru: 'Расширение морского флота, добавлены дайв-туры',
      it: 'Flotta marina ampliata, aggiunti tour di immersioni' },
    { year: '2018', ar: 'تجاوزنا حاجز الـ 5,000 سائح سنوياً',          en: 'Crossed 5,000 annual guests milestone',
      ru: 'Преодолели рубеж в 5 000 гостей в год',
      it: 'Superati 5.000 ospiti annui' },
    { year: '2020', ar: 'إطلاق رحلات السفاري الفاخرة',                  en: 'Launched luxury safari trips',
      ru: 'Запуск премиальных сафари-туров',
      it: 'Lancio dei safari di lusso' },
    { year: '2022', ar: 'شراكات مع أكبر فنادق الـ 5 نجوم',              en: 'Partnerships with major 5-star hotels',
      ru: 'Партнёрство с ведущими 5-звёздочными отелями',
      it: 'Partnership con i principali hotel 5 stelle' },
    { year: '2026', ar: 'إطلاق منصتنا الرقمية الجديدة بـ 4 لغات',       en: 'Launched new digital platform in 4 languages',
      ru: 'Запуск новой цифровой платформы на 4 языках',
      it: 'Lancio della nuova piattaforma digitale in 4 lingue' },
  ];

  const stats = [
    { v: '13+',  icon: Calendar, ar: 'سنة من الخبرة', en: 'Years',        ru: 'Лет опыта',     it: 'Anni' },
    { v: '10k+', icon: Users,    ar: 'سائح سعيد',     en: 'Travelers',    ru: 'Путешественников', it: 'Viaggiatori' },
    { v: '50+',  icon: MapPinned, ar: 'وجهة سياحية',   en: 'Destinations', ru: 'Направлений',   it: 'Destinazioni' },
    { v: '4.9',  icon: Star,     ar: 'تقييم العملاء', en: 'Rating',       ru: 'Рейтинг',       it: 'Valutazione' },
  ];

  return (
    <>
      <section className="relative bg-primary-900 text-cream py-16 md:py-28 overflow-hidden">
        <Image src="/hero-slides/hero-05.jpg" alt="" fill className="object-cover opacity-30 scale-105" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/85 via-primary-900/65 to-primary-900" />
        <div className="absolute top-1/4 -end-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -start-20 w-80 h-80 rounded-full bg-accent/8 blur-3xl pointer-events-none" />
        <div className="container relative">
          <Reveal>
            <span className="eyebrow">{L(locale, { ar: 'تعرف علينا', en: 'Get to know us', ru: 'Познакомьтесь с нами', it: 'Conoscici' })}</span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-5 max-w-3xl leading-[1.1] text-balance">
              {L(locale, { ar: 'قصتنا — من شغف بالسياحة إلى علامة فاخرة', en: 'Our story — from passion to a luxury brand', ru: 'Наша история — от страсти к люксовому бренду', it: 'La nostra storia — dalla passione a un brand di lusso' })}
            </h1>
            <div className="w-16 h-0.5 gradient-gold rounded-full mb-5" />
            <p className="text-base sm:text-lg md:text-xl opacity-90 max-w-2xl leading-relaxed">
              {L(locale, { ar: 'منذ 2013 ونحن نرسم خرائط السعادة لآلاف الزوار في شرم الشيخ. كل رحلة قصة، وكل عميل عائلة.', en: 'Since 2013 we have been crafting happiness for thousands of visitors. Every trip is a story, every guest family.' })}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative bg-gradient-to-br from-accent via-accent to-accent-600 py-10 md:py-14 overflow-hidden">
        <div aria-hidden className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(13,58,58,0.4) 0%, transparent 40%), radial-gradient(circle at 80% 50%, rgba(13,58,58,0.3) 0%, transparent 40%)' }} />
        <div aria-hidden className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div aria-hidden className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="container relative grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-primary">
          {stats.map((s, i) => (
            <Reveal key={s.en} delay={i * 0.1}>
              <div className="group flex flex-col items-center text-center">
                <span className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 border border-primary/15 mb-2.5 group-hover:bg-primary/20 group-hover:rotate-6 transition-all duration-300">
                  <s.icon className="h-5 w-5 md:h-6 md:w-6" />
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-3xl md:text-5xl font-bold leading-none group-hover:scale-110 transition-transform duration-300 inline-block tabular-nums">{s.v}</span>
                  {s.v === '4.9' && <Star className="h-4 w-4 md:h-5 md:w-5 fill-primary text-primary" />}
                </div>
                <div className="text-[10px] md:text-xs font-bold mt-1.5 uppercase tracking-[0.18em] opacity-85">{L(locale, { ar: s.ar, en: s.en, ru: s.ru, it: s.it })}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PULL QUOTE — editorial slogan */}
      <section className="relative py-16 md:py-24 bg-cream overflow-hidden">
        <div aria-hidden className="absolute -top-20 -end-20 w-[28rem] h-[28rem] rounded-full bg-accent/8 blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute -bottom-32 -start-20 w-[28rem] h-[28rem] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="container relative max-w-4xl">
          <Reveal>
            <figure className="relative">
              {/* Decorative oversized quote mark */}
              <Quote
                aria-hidden
                className="absolute -top-6 -start-2 md:-top-10 md:-start-6 h-20 w-20 md:h-32 md:w-32 text-accent/25 rtl:scale-x-[-1]"
                strokeWidth={1}
              />
              <blockquote className="relative ps-12 md:ps-20 border-s-[3px] border-accent">
                <p className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-tight italic text-balance">
                  {L(locale, {
                    ar: 'لو جاى شرم متشلش هم — كل رحلة قصة، وكل عميل عائلة.',
                    en: "Visiting Sharm? No worries with us — every trip is a story, every guest is family.",
                    ru: 'Едете в Шарм? Не переживайте — каждое путешествие это история, каждый гость — семья.',
                    it: 'Vai a Sharm? Niente pensieri — ogni viaggio è una storia, ogni ospite è famiglia.',
                  })}
                </p>
                <figcaption className="mt-6 flex items-center gap-3 text-sm">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent text-primary font-serif font-bold">L</span>
                  <div>
                    <div className="font-bold text-primary">{brand}</div>
                    <div className="text-xs text-muted-foreground">{L(locale, { ar: 'فلسفتنا منذ 2013', en: 'Our philosophy since 2013', ru: 'Наша философия с 2013', it: 'La nostra filosofia dal 2013' })}</div>
                  </div>
                </figcaption>
              </blockquote>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* LEGAL IDENTITY — premium credential card */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-cream to-muted/30">
        <div className="container max-w-5xl">
          <Reveal>
            <div className="relative bg-gradient-to-br from-primary via-primary to-primary-900 text-cream rounded-2xl md:rounded-3xl border border-accent/25 shadow-2xl overflow-hidden">
              <div aria-hidden className="absolute -top-32 -end-32 w-80 h-80 rounded-full bg-accent/15 blur-3xl" />
              <div aria-hidden className="absolute -bottom-32 -start-32 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
              <div aria-hidden className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

              <div className="relative grid md:grid-cols-[auto_1fr_auto] gap-6 md:gap-10 items-center p-6 md:p-10">
                {/* Left: official seal */}
                <div className="flex md:flex-col items-center gap-3 md:gap-2">
                  <div className="relative inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-accent/15 border-2 border-accent/40 backdrop-blur shrink-0">
                    <Briefcase className="h-10 w-10 md:h-11 md:w-11 text-accent" />
                    <BadgeCheck aria-hidden className="absolute -bottom-2 -end-2 h-7 w-7 text-emerald-400 fill-primary-900 bg-primary-900 rounded-full" />
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-accent font-bold whitespace-nowrap md:text-center">
                    {L(locale, { ar: 'مرخصة قانونياً', en: 'Licensed entity', ru: 'Лицензировано', it: 'Concessionato' })}
                  </div>
                </div>

                {/* Middle: company info */}
                <div className="text-center md:text-start">
                  <div className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-accent font-bold mb-2">
                    {L(locale, { ar: 'الكيان القانوني', en: 'Legal identity', ru: 'Юридическое лицо', it: 'Entità legale' })}
                  </div>
                  <h3 className="font-serif text-xl md:text-2xl lg:text-3xl font-bold mb-2 leading-tight text-balance">
                    {L(locale, { ar: 'شركة لوتس شرم للإستثمار والتسويق السياحي', en: 'Lotus Sharm Tourism Investment & Marketing Co.', ru: 'ООО «Lotus Sharm Tourism Investment & Marketing»', it: 'Lotus Sharm Tourism Investment & Marketing S.r.l.' })}
                  </h3>
                  <p className="text-sm text-cream/75 leading-relaxed">
                    {L(locale, { ar: 'الاسم التجاري المعتمد: «لوتس شرم — Lotus Sharm» · شرم الشيخ، جنوب سيناء، مصر', en: 'Trade name: "Lotus Sharm" · Sharm El Sheikh, South Sinai, Egypt' })}
                  </p>
                </div>

                {/* Right: registration number plate */}
                <div className="flex md:flex-col items-center justify-center gap-2 md:min-w-[160px]">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-cream/65 font-bold whitespace-nowrap">
                    {L(locale, { ar: 'سجل تجاري', en: 'Comm. Reg.', ru: 'Рег. №', it: 'Reg. n.' })}
                  </div>
                  <div className="font-mono font-bold text-2xl md:text-3xl tabular-nums text-accent px-4 py-2 rounded-xl bg-cream/10 border border-accent/30">
                    269494
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-cream">
        <div className="container grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <Reveal>
            <span className="eyebrow">{L(locale, { ar: 'قصتنا', en: 'Our story', ru: 'Наша история', it: 'La nostra storia' })}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary mb-6 leading-tight text-balance">
              {L(locale, {
                ar: 'من حلم صغير إلى أكبر مكتب سياحة في شرم',
                en: "From small dream to Sharm's premier brand",
                ru: 'От маленькой мечты до ведущего бренда Шарма',
                it: 'Da piccolo sogno al brand premium di Sharm',
              })}
            </h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed">
              {locale === 'ar' ? (
                <>
                  <p>«لوتس شرم» شركة تعمل في مجال السياحة منذ <strong className="text-accent">أكثر من 13 عاماً</strong>، ولنا خبرة واسعة في تنظيم الرحلات والجولات السياحية. مقرنا الرئيسي في شرم الشيخ، لكننا <strong className="text-primary">نغطي مصر كلها</strong> — من القاهرة والأقصر إلى أسوان والإسكندرية ودهب — بتركيز خاص على شرم الشيخ كوجهتنا الرئيسية.</p>
                  <p>على استعداد كامل لتنظيم <strong>الحفلات والمؤتمرات</strong> بكافة أحجامها، سواء للشركات أو المناسبات الخاصة، مع باقات شاملة للضيافة والإقامة والترفيه.</p>
                  <p>ما يميزنا؟ <strong className="text-primary">التفاصيل والشفافية</strong>. كل رحلة نخطط لها بعناية، كل دليل سياحي نختاره بدقة، وكل سعر نقدمه واضح بدون مفاجآت.</p>
                </>
              ) : locale === 'ru' ? (
                <>
                  <p>Lotus Sharm работает в сфере туризма <strong className="text-accent">более 13 лет</strong> и обладает большим опытом в организации экскурсий и туров. Штаб-квартира — в Шарм-эль-Шейхе, но мы <strong className="text-primary">покрываем весь Египет</strong> — Каир, Луксор, Асуан, Александрию и Дахаб — с особым акцентом на Шарм-эль-Шейх как нашу главную локацию.</p>
                  <p>Готовы организовать <strong>частные мероприятия и конференции</strong> любого масштаба, для корпоративных или личных событий, с полным пакетом гостеприимства, проживания и развлечений.</p>
                  <p>Что нас отличает? <strong className="text-primary">Детали и прозрачность</strong>. Каждая экскурсия тщательно спланирована, каждый гид подобран лично, каждая цена прозрачна — без неприятных сюрпризов.</p>
                </>
              ) : locale === 'it' ? (
                <>
                  <p>Lotus Sharm opera nel turismo da <strong className="text-accent">oltre 13 anni</strong>, con profonda esperienza nell'organizzazione di tour ed escursioni. Con sede a Sharm El Sheikh, <strong className="text-primary">copriamo tutto l'Egitto</strong> — dal Cairo a Luxor, da Aswan ad Alessandria e Dahab — con un focus speciale su Sharm El Sheikh come nostra destinazione principale.</p>
                  <p>Pronti a organizzare <strong>feste private e conferenze</strong> di qualsiasi dimensione, per aziende o eventi privati, con pacchetti completi di ospitalità, alloggio e intrattenimento.</p>
                  <p>Cosa ci distingue? <strong className="text-primary">Dettagli e trasparenza</strong>. Ogni tour pianificato con cura, ogni guida selezionata personalmente, ogni prezzo trasparente — senza sorprese.</p>
                </>
              ) : (
                <>
                  <p>Lotus Sharm has been operating in tourism for <strong className="text-accent">over 13 years</strong>, with deep experience organizing trips and tours. Headquartered in Sharm El Sheikh, we <strong className="text-primary">cover all of Egypt</strong> — from Cairo and Luxor to Aswan, Alexandria and Dahab — with a special focus on Sharm El Sheikh as our flagship destination.</p>
                  <p>Fully equipped to organize <strong>parties and conferences</strong> of any size, for corporates or private events, with full hospitality, accommodation and entertainment packages.</p>
                  <p>What sets us apart? <strong className="text-primary">Details and transparency</strong>. Every trip carefully planned, every guide hand-picked, every price clear with no surprises.</p>
                </>
              )}
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="relative">
              {/* Floating decorative gold frame behind */}
              <div aria-hidden className="absolute -top-4 -end-4 md:-top-5 md:-end-5 inset-0 rounded-2xl border-2 border-accent/40 pointer-events-none" />
              {/* Floating decorative dot grid */}
              <div aria-hidden className="absolute -bottom-6 -start-6 w-24 h-24 opacity-30 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle, #c9a86a 1.5px, transparent 1.5px)',
                backgroundSize: '12px 12px',
              }} />
              {/* Main image */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden card-shadow-gold group">
                <Image src="/hero-slides/hero-08.jpg" alt={brand} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/70 via-primary-900/10 to-transparent" />

                {/* Floating year badge top */}
                <div className="absolute top-4 end-4 inline-flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-accent text-primary font-serif font-bold shadow-2xl shadow-accent/40 animate-float">
                  <span className="text-2xl md:text-3xl leading-none">13</span>
                  <span className="text-[8px] md:text-[9px] uppercase tracking-wider opacity-90 mt-0.5">{L(locale, { ar: 'سنة', en: 'years', ru: 'лет', it: 'anni' })}</span>
                </div>

                {/* Brand info card bottom */}
                <div className="absolute bottom-4 start-4 end-4 glass-dark rounded-xl p-4 text-cream border border-accent/25">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent/20 border border-accent/30">
                      <Sparkles className="h-3.5 w-3.5 text-accent" />
                    </span>
                    <div className="font-serif text-xl font-bold text-accent">{brand}</div>
                  </div>
                  <div className="text-xs opacity-85 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-accent" />
                    {L(locale, { ar: 'منذ 2013 — شرم الشيخ', en: 'Since 2013 — Sharm El Sheikh', ru: 'С 2013 — Шарм-эль-Шейх', it: 'Dal 2013 — Sharm El Sheikh' })}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-cream to-muted/30">
        <div className="container">
          <Reveal className="text-center mb-12">
            <span className="eyebrow eyebrow-center">{L(locale, { ar: 'خدماتنا', en: 'Our services', ru: 'Наши услуги', it: 'I nostri servizi' })}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary leading-tight text-balance">{L(locale, { ar: 'باقة متكاملة من الخدمات', en: 'A complete suite of services', ru: 'Полный комплекс услуг', it: 'Suite completa di servizi' })}</h2>
            <span className="rule-gold" />
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: Plane,    ar: 'تنظيم الرحلات السياحية', en: 'Tourism Trips',  ru: 'Туристические туры', it: 'Tour turistici',
                arDesc: 'محميات، جزر، رحلات بحرية وصحراوية في شرم الشيخ ومصر كلها.',
                enDesc: 'Reserves, islands, sea and desert trips across Sharm and all Egypt.',
                ruDesc: 'Заповедники, острова, морские и пустынные туры в Шарме и по всему Египту.',
                itDesc: 'Riserve, isole, tour marini e desertici a Sharm e in tutto l\'Egitto.' },
              { icon: Compass,  ar: 'الجولات الإرشادية',       en: 'Guided Tours',   ru: 'Экскурсии с гидом',  it: 'Tour guidati',
                arDesc: 'مرشدون معتمدون بـ 4 لغات، رحلات يومية ومسارات حصرية.',
                enDesc: 'Certified guides in 4 languages, daily tours and exclusive routes.',
                ruDesc: 'Сертифицированные гиды на 4 языках, ежедневные туры и эксклюзивные маршруты.',
                itDesc: 'Guide certificate in 4 lingue, tour giornalieri e percorsi esclusivi.' },
              { icon: Sparkles, ar: 'تنظيم الحفلات',           en: 'Event Planning', ru: 'Организация событий', it: 'Pianificazione eventi',
                arDesc: 'حفلات خاصة، أعياد ميلاد، حفلات زفاف على الشاطئ، حفلات شركات.',
                enDesc: 'Private parties, birthdays, beach weddings, corporate events.',
                ruDesc: 'Частные мероприятия, дни рождения, свадьбы на пляже, корпоративы.',
                itDesc: 'Feste private, compleanni, matrimoni sulla spiaggia, eventi aziendali.' },
              { icon: Mic,      ar: 'المؤتمرات والفعاليات',    en: 'Conferences',    ru: 'Конференции',         it: 'Conferenze',
                arDesc: 'تجهيز فعاليات كبرى مع باقات إقامة وضيافة كاملة وخدمات صوتية.',
                enDesc: 'Full conference setup with stay, hospitality and AV services.',
                ruDesc: 'Полная организация конференций с проживанием, кейтерингом и AV-оборудованием.',
                itDesc: 'Allestimento completo di conferenze con soggiorno, ospitalità e servizi AV.' },
            ].map((s, i) => (
              <Reveal key={s.en} delay={i * 0.1}>
                <div className="group relative bg-white rounded-2xl p-6 md:p-7 border border-accent/10 hover:border-accent/50 hover:-translate-y-2 transition-all duration-500 card-shadow hover:card-shadow-gold h-full overflow-hidden">
                  {/* Gradient bloom on hover */}
                  <div aria-hidden className="absolute -top-16 -end-16 w-40 h-40 bg-gradient-to-bl from-accent/20 via-accent/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Faded index number */}
                  <span aria-hidden className="absolute -top-2 end-3 font-serif text-7xl font-bold text-accent/5 group-hover:text-accent/15 transition-colors duration-500 select-none leading-none">
                    0{i + 1}
                  </span>
                  <div className="relative w-14 h-14 rounded-xl bg-primary text-accent flex items-center justify-center mb-5 group-hover:bg-accent group-hover:text-primary group-hover:rotate-6 transition-all duration-500 shadow-md shadow-primary/20">
                    <s.icon className="h-7 w-7" />
                  </div>
                  <h3 className="relative font-serif font-bold text-lg md:text-xl text-primary mb-2 group-hover:text-accent-700 transition-colors">{L(locale, { ar: s.ar, en: s.en, ru: s.ru, it: s.it })}</h3>
                  <p className="relative text-xs md:text-sm text-muted-foreground leading-relaxed">{L(locale, { ar: s.arDesc, en: s.enDesc, ru: s.ruDesc, it: s.itDesc })}</p>
                  {/* Bottom gold rule that grows on hover */}
                  <span aria-hidden className="absolute bottom-0 inset-x-6 md:inset-x-7 h-0.5 gradient-gold rounded-full scale-x-0 group-hover:scale-x-100 origin-start transition-transform duration-500" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW WE WORK — 3-step process */}
      <section className="relative py-16 md:py-24 bg-white overflow-hidden">
        <div aria-hidden className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div aria-hidden className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div aria-hidden className="absolute -top-32 -end-32 w-96 h-96 rounded-full bg-accent/8 blur-3xl pointer-events-none" />

        <div className="container relative">
          <Reveal className="text-center mb-12 md:mb-16 flex flex-col items-center">
            <span className="eyebrow">{L(locale, { ar: 'كيف نعمل', en: 'How we work', ru: 'Как мы работаем', it: 'Come lavoriamo' })}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary leading-tight text-balance">
              {L(locale, { ar: 'ثلاث خطوات لرحلة لا تُنسى', en: 'Three steps to an unforgettable trip', ru: 'Три шага к незабываемому путешествию', it: 'Tre passi per un viaggio indimenticabile' })}
            </h2>
            <span className="rule-gold" />
            <p className="text-muted-foreground max-w-xl mx-auto mt-2 leading-relaxed">
              {L(locale, {
                ar: 'عملية بسيطة وشفافة من اللحظة التي تتواصل فيها معنا حتى عودتك للفندق',
                en: 'A simple, transparent process from the moment you reach out until you return to your hotel',
                ru: 'Простой и прозрачный процесс — от первого сообщения до возвращения в отель',
                it: 'Un processo semplice e trasparente dal primo contatto al rientro in hotel',
              })}
            </p>
          </Reveal>

          <div className="relative max-w-5xl mx-auto">
            {/* Connecting line (desktop) */}
            <div aria-hidden className="hidden md:block absolute top-12 inset-x-12 h-0.5 bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

            <div className="relative grid md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  icon: MessageCircle,
                  ar: 'تواصل معنا', en: 'Reach out', ru: 'Свяжитесь', it: 'Contattaci',
                  arDesc: 'كلمنا على واتساب أو من نموذج الحجز — رد فوري من فريق متعدد اللغات.',
                  enDesc: 'Message us on WhatsApp or via the booking form — instant reply from our multilingual team.',
                  ruDesc: 'Напишите в WhatsApp или через форму бронирования — мгновенный ответ от многоязычной команды.',
                  itDesc: 'Scrivici su WhatsApp o dal form di prenotazione — risposta immediata dal nostro team multilingue.',
                },
                {
                  icon: ClipboardCheck,
                  ar: 'صمم رحلتك', en: 'Plan together', ru: 'Спланируем вместе', it: 'Pianifichiamo insieme',
                  arDesc: 'نقترح المسار الأنسب لاهتماماتك وميزانيتك — مع كل التفاصيل واضحة من البداية.',
                  enDesc: "We suggest the right route for your interests and budget — every detail clear from the start.",
                  ruDesc: 'Подберём маршрут под ваши интересы и бюджет — все детали ясны с самого начала.',
                  itDesc: 'Suggeriamo il percorso giusto per i tuoi interessi e budget — ogni dettaglio chiaro dall’inizio.',
                },
                {
                  icon: Sparkles,
                  ar: 'استمتع', en: 'Enjoy', ru: 'Наслаждайтесь', it: 'Goditela',
                  arDesc: 'الالتقاط من الفندق، مرشد مرخص، معدات معتمدة — ركّز على المتعة، نحن نتولى الباقي.',
                  enDesc: 'Hotel pickup, licensed guide, certified equipment — focus on enjoying; we handle the rest.',
                  ruDesc: 'Трансфер из отеля, лицензированный гид, сертифицированное оборудование — наслаждайтесь, остальное за нами.',
                  itDesc: 'Pick-up in hotel, guida autorizzata, attrezzatura certificata — pensa solo a divertirti.',
                },
              ].map((step, i) => (
                <Reveal key={step.en} delay={i * 0.12}>
                  <div className="relative text-center">
                    {/* Number badge */}
                    <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-white border-2 border-accent shadow-xl shadow-accent/20 mb-5 group-hover:rotate-6 transition-transform">
                      <step.icon className="h-9 w-9 text-accent-700" />
                      <span className="absolute -top-1 -end-1 inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-accent font-serif font-bold text-sm shadow-md">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-primary mb-2">
                      {L(locale, { ar: step.ar, en: step.en, ru: step.ru, it: step.it })}
                    </h3>
                    <p className="text-sm md:text-base text-foreground/75 leading-relaxed max-w-xs mx-auto">
                      {L(locale, { ar: step.arDesc, en: step.enDesc, ru: step.ruDesc, it: step.itDesc })}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COVERAGE */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="container">
          <Reveal className="text-center mb-12">
            <span className="eyebrow eyebrow-center">{L(locale, { ar: 'نطاق تغطيتنا', en: 'Our coverage', ru: 'Наша зона покрытия', it: 'La nostra copertura' })}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary mb-3 leading-tight text-balance">
              {L(locale, { ar: 'نغطي مصر كلها — بقلب في شرم الشيخ', en: 'We cover all Egypt — with our heart in Sharm El Sheikh', ru: 'Мы охватываем весь Египет — с сердцем в Шарм-эль-Шейхе', it: 'Copriamo tutto l\'Egitto — con il cuore a Sharm El Sheikh' })}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {L(locale, { ar: 'مقرنا الرئيسي شرم الشيخ، لكن خبرتنا تمتد عبر أهم الوجهات السياحية في مصر', en: "Headquartered in Sharm El Sheikh, our expertise spans Egypt's top tourist destinations" })}
            </p>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 max-w-5xl mx-auto">
            {[
              { ar: 'شرم الشيخ',     en: 'Sharm El Sheikh', ru: 'Шарм-эль-Шейх', it: 'Sharm El Sheikh', flag: '⭐', primary: true },
              { ar: 'دهب',           en: 'Dahab',           ru: 'Дахаб',          it: 'Dahab',           flag: '🏖️' },
              { ar: 'سانت كاترين',  en: 'St. Catherine',   ru: 'Св. Екатерина',  it: 'S. Caterina',     flag: '⛰️' },
              { ar: 'القاهرة',       en: 'Cairo',           ru: 'Каир',           it: 'Il Cairo',        flag: '🏛️' },
              { ar: 'الأقصر',        en: 'Luxor',           ru: 'Луксор',         it: 'Luxor',           flag: '🏺' },
              { ar: 'أسوان',         en: 'Aswan',           ru: 'Асуан',          it: 'Aswan',           flag: '🚢' },
              { ar: 'الإسكندرية',    en: 'Alexandria',      ru: 'Александрия',    it: 'Alessandria',     flag: '🏛️' },
              { ar: 'مرسى علم',      en: 'Marsa Alam',      ru: 'Марса-Алам',     it: 'Marsa Alam',      flag: '🐠' },
              { ar: 'الغردقة',       en: 'Hurghada',        ru: 'Хургада',        it: 'Hurghada',        flag: '🌊' },
              { ar: 'سيوة',          en: 'Siwa',            ru: 'Сива',           it: 'Siwa',            flag: '🌴' },
              { ar: 'الفيوم',        en: 'Fayoum',          ru: 'Файюм',          it: 'Fayoum',          flag: '🐪' },
              { ar: 'العين السخنة',  en: 'Ain Sokhna',      ru: 'Эйн-Сохна',      it: 'Ain Sokhna',      flag: '🌅' },
            ].map((d, i) => (
              <Reveal key={d.en} delay={i * 0.04}>
                <div className={
                  'rounded-xl p-3 md:p-4 text-center border transition-all hover:-translate-y-1 hover:shadow-md ' +
                  (d.primary
                    ? 'bg-primary text-cream border-accent shadow-lg shadow-primary/15'
                    : 'bg-white border-accent/15 hover:border-accent/40')
                }>
                  <div className="text-2xl md:text-3xl mb-1">{d.flag}</div>
                  <div className={'font-serif font-bold text-sm md:text-base ' + (d.primary ? 'text-accent' : 'text-primary')}>
                    {L(locale, { ar: d.ar, en: d.en, ru: d.ru, it: d.it })}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-b from-cream to-muted/40">
        <div className="container">
          <Reveal className="text-center mb-12 md:mb-16">
            <span className="eyebrow eyebrow-center">{L(locale, { ar: 'مهمتنا ورؤيتنا', en: 'Mission & Vision', ru: 'Миссия и видение', it: 'Missione e visione' })}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary leading-tight text-balance">{L(locale, { ar: 'نحو سياحة فاخرة ومستدامة', en: 'Toward luxury & sustainable tourism', ru: 'К люксовому и устойчивому туризму', it: 'Verso un turismo di lusso e sostenibile' })}</h2>
            <span className="rule-gold" />
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Target, ar: 'مهمتنا', en: 'Our Mission', ru: 'Наша миссия', it: 'La nostra missione',
                arDesc: 'تقديم تجارب سياحية فاخرة وأصيلة في شرم الشيخ وسيناء، بأعلى معايير الجودة والأمان، وبأسعار شفافة وعادلة.',
                enDesc: 'Deliver luxury, authentic tourism experiences in Sharm El Sheikh with the highest quality and transparent pricing.',
                ruDesc: 'Предоставлять подлинные роскошные туристические впечатления в Шарм-эль-Шейхе с высочайшим качеством и прозрачными ценами.',
                itDesc: 'Offrire esperienze turistiche autentiche e di lusso a Sharm El Sheikh con la massima qualità e prezzi trasparenti.' },
              { icon: Eye, ar: 'رؤيتنا', en: 'Our Vision', ru: 'Наше видение', it: 'La nostra visione',
                arDesc: 'أن نكون العلامة السياحية الأولى المختارة في شرم الشيخ، ومنصة عربية تنافس الشركات العالمية.',
                enDesc: 'To be the #1 chosen tourism brand in Sharm, an Egyptian platform competing globally.',
                ruDesc: 'Стать туристическим брендом №1 в Шарме — египетской платформой, конкурирующей на мировом уровне.',
                itDesc: 'Essere il brand turistico #1 a Sharm — una piattaforma egiziana che compete a livello globale.' },
            ].map((item, i) => (
              <Reveal key={item.en} delay={(i + 1) * 0.1}>
                <div className="group relative bg-white rounded-2xl p-8 md:p-9 border border-accent/15 hover:border-accent/50 hover:-translate-y-1 transition-all duration-500 card-shadow hover:card-shadow-gold h-full overflow-hidden">
                  {/* Faded large quote mark */}
                  <Quote aria-hidden className="absolute top-4 end-4 h-16 w-16 text-accent/8 group-hover:text-accent/20 transition-colors duration-500 rtl:scale-x-[-1]" />
                  {/* Gradient bloom on hover */}
                  <div aria-hidden className="absolute -bottom-20 -start-20 w-56 h-56 rounded-full bg-gradient-to-tr from-accent/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative">
                    <div className="w-14 h-14 rounded-xl gradient-gold flex items-center justify-center mb-5 shadow-md shadow-accent/30 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500">
                      <item.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-3 leading-tight">{L(locale, { ar: item.ar, en: item.en, ru: item.ru, it: item.it })}</h3>
                    <span aria-hidden className="block w-10 h-0.5 bg-accent mb-4" />
                    <p className="text-foreground/80 leading-relaxed text-base">
                      {L(locale, { ar: item.arDesc, en: item.enDesc, ru: item.ruDesc, it: item.itDesc })}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-cream">
        <div className="container">
          <Reveal className="text-center mb-12">
            <span className="eyebrow eyebrow-center">{L(locale, { ar: 'قيمنا', en: 'Our values', ru: 'Наши ценности', it: 'I nostri valori' })}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary leading-tight text-balance">{L(locale, { ar: 'ما نؤمن به', en: 'What we believe in', ru: 'Во что мы верим', it: 'In cosa crediamo' })}</h2>
            <span className="rule-gold" />
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {values.map((v, i) => (
              <Reveal key={v.en} delay={i * 0.1}>
                <div className="group relative bg-white rounded-2xl p-5 md:p-7 border border-accent/10 hover:border-accent/50 hover:-translate-y-2 transition-all duration-500 card-shadow hover:card-shadow-gold h-full overflow-hidden">
                  {/* Decorative gold corner */}
                  <div aria-hidden className="absolute -top-12 -end-12 w-24 h-24 bg-gradient-to-bl from-accent/20 via-accent/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                  <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl gradient-gold flex items-center justify-center text-primary mb-4 group-hover:rotate-[-6deg] group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-accent/30">
                    <v.icon className="h-6 w-6 md:h-7 md:w-7" />
                  </div>
                  <h3 className="relative font-serif font-bold text-base md:text-xl text-primary mb-2 group-hover:text-accent-700 transition-colors">{L(locale, { ar: v.ar, en: v.en, ru: v.ru, it: v.it })}</h3>
                  <p className="relative text-xs md:text-sm text-muted-foreground leading-relaxed">{L(locale, { ar: v.arDesc, en: v.enDesc, ru: v.ruDesc, it: v.itDesc })}</p>
                  <span aria-hidden className="absolute bottom-0 inset-x-5 md:inset-x-7 h-0.5 gradient-gold rounded-full scale-x-0 group-hover:scale-x-100 origin-start transition-transform duration-500" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* AWARDS & CERTIFICATIONS */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-muted/20 to-cream overflow-hidden">
        <div aria-hidden className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

        <div className="container relative">
          <Reveal className="text-center mb-12 md:mb-14 flex flex-col items-center">
            <span className="eyebrow">{L(locale, { ar: 'ضمانات الجودة', en: 'Quality assurance', ru: 'Гарантии качества', it: 'Garanzie di qualità' })}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary leading-tight text-balance">
              {L(locale, { ar: 'شهادات وتراخيص نفخر بها', en: 'Certifications & credentials', ru: 'Сертификаты и лицензии', it: 'Certificazioni e licenze' })}
            </h2>
            <span className="rule-gold" />
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 max-w-5xl mx-auto">
            {[
              { icon: BadgeCheck, color: 'emerald',
                ar_t: 'مرخصة في مصر', en_t: 'Egypt licensed', ru_t: 'Лицензия Египта', it_t: 'Licenza Egitto',
                ar_s: 'وزارة السياحة', en_s: 'Ministry of Tourism', ru_s: 'Минтуризма', it_s: 'Min. Turismo' },
              { icon: Shield, color: 'sky',
                ar_t: 'تأمين شامل', en_t: 'Fully insured', ru_t: 'Полная страховка', it_t: 'Assicurato',
                ar_s: 'لكل المسافرين', en_s: 'For all travelers', ru_s: 'Для всех гостей', it_s: 'Per tutti gli ospiti' },
              { icon: Trophy, color: 'amber',
                ar_t: 'تقييم 5★', en_t: '5★ Rated', ru_t: 'Рейтинг 5★', it_t: 'Valutazione 5★',
                ar_s: '500+ مراجعة', en_s: '500+ reviews', ru_s: '500+ отзывов', it_s: '500+ recensioni' },
              { icon: Globe2, color: 'violet',
                ar_t: '4 لغات', en_t: '4 Languages', ru_t: '4 языка', it_t: '4 lingue',
                ar_s: 'مرشدون معتمدون', en_s: 'Certified guides', ru_s: 'Сертифицированные гиды', it_s: 'Guide certificate' },
            ].map((cred, i) => {
              const ring = {
                emerald: 'from-emerald-500/15 to-emerald-500/0 text-emerald-700 border-emerald-300/50',
                sky:     'from-sky-500/15 to-sky-500/0 text-sky-700 border-sky-300/50',
                amber:   'from-amber-500/15 to-amber-500/0 text-amber-700 border-amber-300/50',
                violet:  'from-violet-500/15 to-violet-500/0 text-violet-700 border-violet-300/50',
              }[cred.color] as string;
              return (
                <Reveal key={cred.en_t} delay={i * 0.08}>
                  <div className="group relative bg-white rounded-2xl p-5 border border-accent/15 hover:border-accent/40 hover:-translate-y-1 transition-all duration-300 card-shadow hover:card-shadow-gold h-full text-center">
                    <div className={`absolute -top-px inset-x-3 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent ${ring.split(' ')[2]}`} />
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${ring} border mb-3 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300`}>
                      <cred.icon className="h-7 w-7" />
                    </div>
                    <div className="font-serif font-bold text-base md:text-lg text-primary leading-tight">
                      {L(locale, { ar: cred.ar_t, en: cred.en_t, ru: cred.ru_t, it: cred.it_t })}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {L(locale, { ar: cred.ar_s, en: cred.en_s, ru: cred.ru_s, it: cred.it_s })}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* "Featured in / partnered with" strip */}
          <Reveal delay={0.2} className="mt-12 md:mt-14">
            <div className="text-center mb-5">
              <div className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-muted-foreground font-bold">
                {L(locale, { ar: 'شركاؤنا في الضيافة', en: 'Hospitality partners', ru: 'Партнёры гостеприимства', it: 'Partner ospitalità' })}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-x-12 opacity-60 hover:opacity-100 transition-opacity">
              {['Hilton', 'Marriott', 'Four Seasons', 'Rixos', 'Hyatt', 'Movenpick'].map((h) => (
                <span key={h} className="font-serif font-bold text-lg md:text-xl text-primary/70 hover:text-primary transition-colors tracking-wider">
                  {h}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary-900 text-cream relative overflow-hidden">
        <div aria-hidden className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl animate-blob" />
        <div aria-hidden className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
        <div className="container relative">
          <Reveal className="text-center mb-12 flex flex-col items-center">
            <span className="eyebrow" style={{ background: 'linear-gradient(120deg, rgba(201,168,106,0.25), rgba(201,168,106,0.1))', borderColor: 'rgba(201,168,106,0.4)', color: '#f7f1e3' }}>{L(locale, { ar: 'رحلتنا', en: 'Our journey', ru: 'Наш путь', it: 'Il nostro viaggio' })}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold leading-tight text-balance">{L(locale, { ar: 'محطات مهمة', en: 'Key milestones', ru: 'Ключевые вехи', it: 'Tappe principali' })}</h2>
            <span className="rule-gold" />
          </Reveal>
          <ol className="relative max-w-3xl mx-auto">
            {/* Vertical rail */}
            <span aria-hidden className="absolute inset-y-0 start-8 md:start-10 w-px bg-gradient-to-b from-accent/60 via-accent/30 to-accent/0" />
            {timeline.map((t, i) => (
              <Reveal key={t.year} delay={i * 0.08}>
                <li className="relative ps-20 md:ps-24 pb-6 md:pb-8 group">
                  <div className="absolute start-0 top-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-accent text-primary font-serif font-bold text-base md:text-lg flex items-center justify-center shadow-lg shadow-accent/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 z-10">
                    {t.year}
                  </div>
                  <div className="bg-cream/5 backdrop-blur rounded-xl p-4 md:p-5 border border-accent/15 group-hover:border-accent/40 group-hover:bg-cream/10 transition-all duration-300">
                    <p className="text-cream/90 leading-relaxed text-sm md:text-base">{L(locale, { ar: t.ar, en: t.en, ru: t.ru, it: t.it })}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-mesh-cream">
        <div className="container">
          <Reveal>
            <div className="relative max-w-4xl mx-auto rounded-2xl md:rounded-3xl gradient-luxury text-cream p-8 sm:p-10 md:p-14 text-center overflow-hidden border border-accent/20 shadow-2xl">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
              <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full bg-accent/15 blur-3xl" />
              <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-accent/15 border border-accent/30 mx-auto mb-5 backdrop-blur">
                  <Sparkles className="h-7 w-7 md:h-8 md:w-8 text-accent" />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight text-balance">
                  {L(locale, { ar: 'جاهز للانضمام لعائلتنا؟', en: 'Ready to join our family?', ru: 'Готовы стать частью нашей семьи?', it: 'Pronto a unirti alla nostra famiglia?' })}
                </h2>
                <span className="rule-gold" />
                <p className="opacity-90 mb-8 max-w-xl mx-auto leading-relaxed">
                  {L(locale, { ar: 'تواصل معنا اليوم ودعنا نخطط رحلتك المثالية', en: 'Contact us today — let us plan your perfect getaway', ru: 'Свяжитесь с нами — спланируем идеальный отдых', it: 'Contattaci — pianifichiamo la tua vacanza perfetta' })}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button asChild size="lg" className="bg-accent text-primary hover:bg-accent-400 font-bold shadow-lg shadow-accent/30 hover:-translate-y-0.5 transition-all group">
                    <Link href="/trips">{L(locale, { ar: 'تصفح رحلاتنا', en: 'Browse Trips', ru: 'Просмотреть туры', it: 'Sfoglia i tour' })} <ArrowRight className="h-4 w-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" /></Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-cream/40 text-cream hover:bg-cream hover:text-primary">
                    <Link href="/contact"><Phone className="h-4 w-4" /> {L(locale, { ar: 'تواصل معنا', en: 'Contact Us', ru: 'Связаться с нами', it: 'Contattaci' })}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
