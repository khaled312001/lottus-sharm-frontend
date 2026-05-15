import { setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/public/motion';
import { Award, Heart, Compass, Shield, Sparkles, Target, Eye, ArrowRight, Phone, MapPin, Users, Calendar, Briefcase, Mic, Plane } from 'lucide-react';
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
    { v: '13+',  ar: 'سنة من الخبرة', en: 'Years',        ru: 'Лет опыта',     it: 'Anni' },
    { v: '10k+', ar: 'سائح سعيد',     en: 'Travelers',    ru: 'Путешественников', it: 'Viaggiatori' },
    { v: '50+',  ar: 'وجهة سياحية',   en: 'Destinations', ru: 'Направлений',   it: 'Destinazioni' },
    { v: '4.9★', ar: 'تقييم العملاء', en: 'Rating',       ru: 'Рейтинг',       it: 'Valutazione' },
  ];

  return (
    <>
      <section className="relative bg-primary-900 text-cream py-20 md:py-28 overflow-hidden">
        <Image src="/hero-slides/hero-05.jpg" alt="" fill className="object-cover opacity-30" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 via-primary-900/70 to-primary-900" />
        <div className="absolute top-1/4 -end-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="container relative">
          <Reveal>
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-4">{L(locale, { ar: 'تعرف علينا', en: 'Get to know us', ru: 'Познакомьтесь с нами', it: 'Conoscici' })}</div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-5 max-w-3xl leading-[1.1]">
              {L(locale, { ar: 'قصتنا — من شغف بالسياحة إلى علامة فاخرة', en: 'Our story — from passion to a luxury brand', ru: 'Наша история — от страсти к люксовому бренду', it: 'La nostra storia — dalla passione a un brand di lusso' })}
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl leading-relaxed">
              {L(locale, { ar: 'منذ 2013 ونحن نرسم خرائط السعادة لآلاف الزوار في شرم الشيخ. كل رحلة قصة، وكل عميل عائلة.', en: 'Since 2013 we have been crafting happiness for thousands of visitors. Every trip is a story, every guest family.' })}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-accent py-8 md:py-10">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-primary">
          {stats.map((s, i) => (
            <Reveal key={s.en} delay={i * 0.1}>
              <div>
                <div className="font-serif text-3xl md:text-5xl font-bold leading-none">{s.v}</div>
                <div className="text-xs md:text-sm font-semibold mt-2 uppercase tracking-wider">{L(locale, { ar: s.ar, en: s.en, ru: s.ru, it: s.it })}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SLOGAN BANNER */}
      <section className="py-12 md:py-16 bg-cream relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <Image src="/logo.jpg" alt="" fill className="object-contain" sizes="100vw" />
        </div>
        <div className="container relative text-center">
          <Reveal>
            <div className="text-accent uppercase tracking-[0.4em] text-xs font-bold mb-4">{L(locale, { ar: 'سلوجاننا', en: 'Our slogan', ru: 'Наш слоган', it: 'Il nostro slogan' })}</div>
            <p className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight italic">
              {L(locale, { ar: '«لو جاى شرم متشلش هم»', en: '«Visiting Sharm? No worries with us»', ru: '«Едете в Шарм? С нами — никаких забот»', it: '«Vai a Sharm? Nessun problema con noi»' })}
            </p>
            <div className="w-24 h-0.5 bg-accent mx-auto mt-6" />
          </Reveal>
        </div>
      </section>

      {/* LEGAL IDENTITY */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-cream to-muted/30 border-y border-accent/15">
        <div className="container max-w-4xl">
          <Reveal>
            <div className="bg-white rounded-2xl p-8 md:p-10 border border-accent/15 card-shadow text-center">
              <Briefcase className="h-10 w-10 text-accent mx-auto mb-4" />
              <div className="text-accent uppercase tracking-[0.3em] text-[11px] font-bold mb-3">{L(locale, { ar: 'التعريف القانوني', en: 'Legal identity', ru: 'Юридическое наименование', it: 'Denominazione legale' })}</div>
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-3 leading-tight">
                {L(locale, { ar: 'شركة لوتتس شرم للإستثمار والتسويق السياحي', en: 'Lottus Sharm Tourism Investment & Marketing Co.', ru: 'ООО «Lottus Sharm Tourism Investment & Marketing»', it: 'Lottus Sharm Tourism Investment & Marketing S.r.l.' })}
              </h3>
              <p className="text-sm md:text-base text-foreground/75 leading-relaxed">
                {L(locale, { ar: 'الاسم التجاري المعتمد: "لوتس شرم — Lotus Sharm" · مرخّصة قانونياً بمصر · مقرها شرم الشيخ، محافظة جنوب سيناء', en: 'Trade name: "Lotus Sharm" · Legally licensed in Egypt · Based in Sharm El Sheikh, South Sinai Governorate' })}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-cream">
        <div className="container grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <Reveal>
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">{L(locale, { ar: 'قصتنا', en: 'Our story', ru: 'Наша история', it: 'La nostra storia' })}</div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary mb-6 leading-tight">
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
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden card-shadow-gold">
              <Image src="/hero-slides/hero-08.jpg" alt={brand} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              <div className="absolute bottom-4 start-4 right-4 glass-dark rounded-xl p-4 text-cream">
                <div className="font-serif text-2xl font-bold text-accent">{brand}</div>
                <div className="text-xs opacity-80 mt-1">{L(locale, { ar: 'منذ 2013 — شرم الشيخ', en: 'Since 2013 — Sharm El Sheikh', ru: 'С 2013 — Шарм-эль-Шейх', it: 'Dal 2013 — Sharm El Sheikh' })}</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-cream to-muted/30">
        <div className="container">
          <Reveal className="text-center mb-12">
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">{L(locale, { ar: 'خدماتنا', en: 'Our services', ru: 'Наши услуги', it: 'I nostri servizi' })}</div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary">{L(locale, { ar: 'باقة متكاملة من الخدمات', en: 'A complete suite of services', ru: 'Полный комплекс услуг', it: 'Suite completa di servizi' })}</h2>
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
                <div className="group bg-white rounded-2xl p-6 md:p-7 border border-accent/10 hover:border-accent hover:-translate-y-2 transition-all duration-500 card-shadow h-full">
                  <div className="w-14 h-14 rounded-xl bg-primary text-accent flex items-center justify-center mb-5 group-hover:bg-accent group-hover:text-primary transition-colors">
                    <s.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-serif font-bold text-lg md:text-xl text-primary mb-2">{L(locale, { ar: s.ar, en: s.en, ru: s.ru, it: s.it })}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{L(locale, { ar: s.arDesc, en: s.enDesc, ru: s.ruDesc, it: s.itDesc })}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* COVERAGE */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="container">
          <Reveal className="text-center mb-12">
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">{L(locale, { ar: 'نطاق تغطيتنا', en: 'Our coverage', ru: 'Наша зона покрытия', it: 'La nostra copertura' })}</div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary mb-3">
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
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">{L(locale, { ar: 'مهمتنا ورؤيتنا', en: 'Mission & Vision', ru: 'Миссия и видение', it: 'Missione e visione' })}</div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary">{L(locale, { ar: 'نحو سياحة فاخرة ومستدامة', en: 'Toward luxury & sustainable tourism', ru: 'К люксовому и устойчивому туризму', it: 'Verso un turismo di lusso e sostenibile' })}</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            <Reveal delay={0.1}>
              <div className="bg-white rounded-2xl p-8 border border-accent/10 hover:border-accent/40 transition-colors card-shadow h-full">
                <div className="w-14 h-14 rounded-xl gradient-gold flex items-center justify-center mb-5">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-primary mb-3">{L(locale, { ar: 'مهمتنا', en: 'Our Mission', ru: 'Наша миссия', it: 'La nostra missione' })}</h3>
                <p className="text-foreground/80 leading-relaxed">
                  {L(locale, { ar: 'تقديم تجارب سياحية فاخرة وأصيلة في شرم الشيخ وسيناء، بأعلى معايير الجودة والأمان، وبأسعار شفافة وعادلة.', en: 'Deliver luxury, authentic tourism experiences in Sharm El Sheikh with the highest quality and transparent pricing.' })}
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="bg-white rounded-2xl p-8 border border-accent/10 hover:border-accent/40 transition-colors card-shadow h-full">
                <div className="w-14 h-14 rounded-xl gradient-gold flex items-center justify-center mb-5">
                  <Eye className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-primary mb-3">{L(locale, { ar: 'رؤيتنا', en: 'Our Vision', ru: 'Наше видение', it: 'La nostra visione' })}</h3>
                <p className="text-foreground/80 leading-relaxed">
                  {L(locale, { ar: 'أن نكون العلامة السياحية الأولى المختارة في شرم الشيخ، ومنصة عربية تنافس الشركات العالمية.', en: 'To be the #1 chosen tourism brand in Sharm, an Egyptian platform competing globally.' })}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-cream">
        <div className="container">
          <Reveal className="text-center mb-12">
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">{L(locale, { ar: 'قيمنا', en: 'Our values', ru: 'Наши ценности', it: 'I nostri valori' })}</div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary">{L(locale, { ar: 'ما نؤمن به', en: 'What we believe in', ru: 'Во что мы верим', it: 'In cosa crediamo' })}</h2>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {values.map((v, i) => (
              <Reveal key={v.en} delay={i * 0.1}>
                <div className="group bg-white rounded-2xl p-5 md:p-7 border border-accent/10 hover:border-accent hover:-translate-y-2 transition-all duration-500 card-shadow h-full">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl gradient-gold flex items-center justify-center text-primary mb-4 group-hover:rotate-6 transition-transform">
                    <v.icon className="h-6 w-6 md:h-7 md:w-7" />
                  </div>
                  <h3 className="font-serif font-bold text-base md:text-xl text-primary mb-2">{L(locale, { ar: v.ar, en: v.en, ru: v.ru, it: v.it })}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{L(locale, { ar: v.arDesc, en: v.enDesc, ru: v.ruDesc, it: v.itDesc })}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary-900 text-cream relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="container relative">
          <Reveal className="text-center mb-12">
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">{L(locale, { ar: 'رحلتنا', en: 'Our journey', ru: 'Наш путь', it: 'Il nostro viaggio' })}</div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold">{L(locale, { ar: 'محطات مهمة', en: 'Key milestones', ru: 'Ключевые вехи', it: 'Tappe principali' })}</h2>
          </Reveal>
          <div className="max-w-3xl mx-auto space-y-5 md:space-y-7">
            {timeline.map((t, i) => (
              <Reveal key={t.year} delay={i * 0.08}>
                <div className="flex items-center gap-4 md:gap-6 group">
                  <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-accent text-primary font-serif font-bold text-base md:text-lg flex items-center justify-center shadow-lg shadow-accent/30 group-hover:scale-110 transition-transform">
                    {t.year}
                  </div>
                  <div className="flex-1 bg-cream/5 backdrop-blur rounded-xl p-4 md:p-5 border border-accent/15">
                    <p className="text-cream/90 leading-relaxed text-sm md:text-base">{L(locale, { ar: t.ar, en: t.en, ru: t.ru, it: t.it })}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-cream">
        <div className="container">
          <Reveal>
            <div className="relative max-w-4xl mx-auto rounded-3xl gradient-luxury text-cream p-10 md:p-14 text-center overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
              <Sparkles className="h-10 w-10 text-accent mx-auto mb-5" />
              <h2 className="font-serif text-2xl md:text-4xl font-bold mb-4">
                {L(locale, { ar: 'جاهز للانضمام لعائلتنا؟', en: 'Ready to join our family?', ru: 'Готовы стать частью нашей семьи?', it: 'Pronto a unirti alla nostra famiglia?' })}
              </h2>
              <p className="opacity-90 mb-8 max-w-xl mx-auto">
                {L(locale, { ar: 'تواصل معنا اليوم ودعنا نخطط رحلتك المثالية', en: 'Contact us today — let us plan your perfect getaway', ru: 'Свяжитесь с нами — спланируем идеальный отдых', it: 'Contattaci — pianifichiamo la tua vacanza perfetta' })}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button asChild size="lg" className="bg-accent text-primary hover:bg-accent-400 font-bold">
                  <Link href="/trips">{L(locale, { ar: 'تصفح رحلاتنا', en: 'Browse Trips', ru: 'Просмотреть туры', it: 'Sfoglia i tour' })} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-cream/40 text-cream hover:bg-cream hover:text-primary">
                  <Link href="/contact"><Phone className="h-4 w-4" /> {L(locale, { ar: 'تواصل معنا', en: 'Contact Us', ru: 'Связаться с нами', it: 'Contattaci' })}</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
