import { setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/public/motion';
import { Award, Heart, Compass, Shield, Sparkles, Target, Eye, ArrowRight, Phone, MapPin, Users, Calendar, Briefcase, Mic, Plane } from 'lucide-react';
import { getSiteSettings, getLocalizedName } from '@/lib/site-settings';

export const revalidate = 120;

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const settings = await getSiteSettings();
  const brand = getLocalizedName(settings, locale);
  const isAr = locale === 'ar';

  const values = [
    { icon: Award, ar: 'الجودة أولاً', en: 'Quality First', arDesc: 'كل تفصيلة في رحلاتنا مختارة بعناية لتقدم أفضل تجربة سياحية ممكنة.', enDesc: 'Every detail in our trips is carefully chosen to deliver the best experience.' },
    { icon: Heart, ar: 'شغف الخدمة', en: 'Passion for Service', arDesc: 'نعشق ما نفعل ونرى السعادة في عيون عملائنا، وهذا وقودنا اليومي.', enDesc: 'We love what we do — the joy in our guests\' eyes is our daily fuel.' },
    { icon: Compass, ar: 'الابتكار', en: 'Innovation', arDesc: 'نطور باستمرار وجهات ومسارات جديدة لتقديم تجارب مبتكرة وحصرية.', enDesc: 'We constantly develop new destinations and exclusive experiences.' },
    { icon: Shield, ar: 'الأمان والثقة', en: 'Safety & Trust', arDesc: 'فريقنا مدرب ومرخص، ومعداتنا معتمدة بأعلى معايير السلامة الدولية.', enDesc: 'Trained, certified team and equipment meeting international standards.' },
  ];

  const timeline = [
    { year: '2013', ar: 'تأسيس لوتس شرم — انطلاقتنا الأولى', en: 'Lotus Sharm founded — our first launch' },
    { year: '2016', ar: 'توسيع الأسطول البحري وإضافة رحلات الغوص', en: 'Marine fleet expanded, diving trips added' },
    { year: '2018', ar: 'تجاوزنا حاجز الـ 5,000 سائح سنوياً', en: 'Crossed 5,000 annual guests milestone' },
    { year: '2020', ar: 'إطلاق رحلات السفاري الفاخرة', en: 'Launched luxury safari trips' },
    { year: '2022', ar: 'شراكات مع أكبر فنادق الـ 5 نجوم', en: 'Partnerships with major 5-star hotels' },
    { year: '2026', ar: 'إطلاق منصتنا الرقمية الجديدة بـ 4 لغات', en: 'Launched new digital platform in 4 languages' },
  ];

  const stats = [
    { v: '13+', ar: 'سنة من الخبرة', en: 'Years' },
    { v: '10k+', ar: 'سائح سعيد', en: 'Travelers' },
    { v: '50+', ar: 'وجهة سياحية', en: 'Destinations' },
    { v: '4.9★', ar: 'تقييم العملاء', en: 'Rating' },
  ];

  return (
    <>
      <section className="relative bg-primary-900 text-cream py-20 md:py-28 overflow-hidden">
        <Image src="/hero-slides/hero-05.jpg" alt="" fill className="object-cover opacity-30" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 via-primary-900/70 to-primary-900" />
        <div className="absolute top-1/4 -end-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="container relative">
          <Reveal>
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-4">{isAr ? 'تعرف علينا' : 'Get to know us'}</div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-5 max-w-3xl leading-[1.1]">
              {isAr ? 'قصتنا — من شغف بالسياحة إلى علامة فاخرة' : 'Our story — from passion to a luxury brand'}
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl leading-relaxed">
              {isAr
                ? 'منذ 2013 ونحن نرسم خرائط السعادة لآلاف الزوار في شرم الشيخ. كل رحلة قصة، وكل عميل عائلة.'
                : 'Since 2013 we have been crafting happiness for thousands of visitors. Every trip is a story, every guest family.'}
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
                <div className="text-xs md:text-sm font-semibold mt-2 uppercase tracking-wider">{isAr ? s.ar : s.en}</div>
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
            <div className="text-accent uppercase tracking-[0.4em] text-xs font-bold mb-4">{isAr ? 'سلوجاننا' : 'Our slogan'}</div>
            <p className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight italic">
              {isAr ? '«لو جاى شرم متشلش هم»' : '«Visiting Sharm? No worries with us»'}
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
              <div className="text-accent uppercase tracking-[0.3em] text-[11px] font-bold mb-3">{isAr ? 'التعريف القانوني' : 'Legal identity'}</div>
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-3 leading-tight">
                {isAr ? 'شركة لوتتس شرم للإستثمار والتسويق السياحي' : 'Lottus Sharm Tourism Investment & Marketing Co.'}
              </h3>
              <p className="text-sm md:text-base text-foreground/75 leading-relaxed">
                {isAr
                  ? 'الاسم التجاري المعتمد: "لوتس شرم — Lotus Sharm" · مرخّصة قانونياً بمصر · مقرها شرم الشيخ، محافظة جنوب سيناء'
                  : 'Trade name: "Lotus Sharm" · Legally licensed in Egypt · Based in Sharm El Sheikh, South Sinai Governorate'}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-cream">
        <div className="container grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <Reveal>
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">{isAr ? 'قصتنا' : 'Our story'}</div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary mb-6 leading-tight">
              {isAr ? 'من حلم صغير إلى أكبر مكتب سياحة في شرم' : 'From small dream to Sharm\'s premier brand'}
            </h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed">
              {isAr ? (
                <>
                  <p>«لوتس شرم» شركة تعمل في مجال السياحة منذ <strong className="text-accent">أكثر من 13 عاماً</strong>، ولنا خبرة واسعة في تنظيم الرحلات والجولات السياحية. مقرنا الرئيسي في شرم الشيخ، لكننا <strong className="text-primary">نغطي مصر كلها</strong> — من القاهرة والأقصر إلى أسوان والإسكندرية ودهب — بتركيز خاص على شرم الشيخ كوجهتنا الرئيسية.</p>
                  <p>على استعداد كامل لتنظيم <strong>الحفلات والمؤتمرات</strong> بكافة أحجامها، سواء للشركات أو المناسبات الخاصة، مع باقات شاملة للضيافة والإقامة والترفيه.</p>
                  <p>ما يميزنا؟ <strong className="text-primary">التفاصيل والشفافية</strong>. كل رحلة نخطط لها بعناية، كل دليل سياحي نختاره بدقة، وكل سعر نقدمه واضح بدون مفاجآت.</p>
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
                <div className="text-xs opacity-80 mt-1">{isAr ? 'منذ 2013 — شرم الشيخ' : 'Since 2013 — Sharm El Sheikh'}</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-cream to-muted/30">
        <div className="container">
          <Reveal className="text-center mb-12">
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">{isAr ? 'خدماتنا' : 'Our services'}</div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary">{isAr ? 'باقة متكاملة من الخدمات' : 'A complete suite of services'}</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: Plane,     ar: 'تنظيم الرحلات السياحية', en: 'Tourism Trips',       arDesc: 'محميات، جزر، رحلات بحرية وصحراوية في شرم الشيخ ومصر كلها.', enDesc: 'Reserves, islands, sea and desert trips across Sharm and all Egypt.' },
              { icon: Compass,   ar: 'الجولات الإرشادية',       en: 'Guided Tours',       arDesc: 'مرشدون معتمدون بـ 4 لغات، رحلات يومية ومسارات حصرية.', enDesc: 'Certified guides in 4 languages, daily tours and exclusive routes.' },
              { icon: Sparkles,  ar: 'تنظيم الحفلات',           en: 'Event Planning',     arDesc: 'حفلات خاصة، أعياد ميلاد، حفلات زفاف على الشاطئ، حفلات شركات.', enDesc: 'Private parties, birthdays, beach weddings, corporate events.' },
              { icon: Mic,       ar: 'المؤتمرات والفعاليات',    en: 'Conferences',        arDesc: 'تجهيز فعاليات كبرى مع باقات إقامة وضيافة كاملة وخدمات صوتية.', enDesc: 'Full conference setup with stay, hospitality and AV services.' },
            ].map((s, i) => (
              <Reveal key={s.en} delay={i * 0.1}>
                <div className="group bg-white rounded-2xl p-6 md:p-7 border border-accent/10 hover:border-accent hover:-translate-y-2 transition-all duration-500 card-shadow h-full">
                  <div className="w-14 h-14 rounded-xl bg-primary text-accent flex items-center justify-center mb-5 group-hover:bg-accent group-hover:text-primary transition-colors">
                    <s.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-serif font-bold text-lg md:text-xl text-primary mb-2">{isAr ? s.ar : s.en}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{isAr ? s.arDesc : s.enDesc}</p>
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
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">{isAr ? 'نطاق تغطيتنا' : 'Our coverage'}</div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary mb-3">
              {isAr ? 'نغطي مصر كلها — بقلب في شرم الشيخ' : 'We cover all Egypt — with our heart in Sharm El Sheikh'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isAr ? 'مقرنا الرئيسي شرم الشيخ، لكن خبرتنا تمتد عبر أهم الوجهات السياحية في مصر' : 'Headquartered in Sharm El Sheikh, our expertise spans Egypt\'s top tourist destinations'}
            </p>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 max-w-5xl mx-auto">
            {[
              { ar: 'شرم الشيخ', en: 'Sharm El Sheikh', flag: '⭐', primary: true },
              { ar: 'دهب', en: 'Dahab', flag: '🏖️' },
              { ar: 'سانت كاترين', en: 'St. Catherine', flag: '⛰️' },
              { ar: 'القاهرة', en: 'Cairo', flag: '🏛️' },
              { ar: 'الأقصر', en: 'Luxor', flag: '🏺' },
              { ar: 'أسوان', en: 'Aswan', flag: '🚢' },
              { ar: 'الإسكندرية', en: 'Alexandria', flag: '🏛️' },
              { ar: 'مرسى علم', en: 'Marsa Alam', flag: '🐠' },
              { ar: 'الغردقة', en: 'Hurghada', flag: '🌊' },
              { ar: 'سيوة', en: 'Siwa', flag: '🌴' },
              { ar: 'الفيوم', en: 'Fayoum', flag: '🐪' },
              { ar: 'العين السخنة', en: 'Ain Sokhna', flag: '🌅' },
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
                    {isAr ? d.ar : d.en}
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
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">{isAr ? 'مهمتنا ورؤيتنا' : 'Mission & Vision'}</div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary">{isAr ? 'نحو سياحة فاخرة ومستدامة' : 'Toward luxury & sustainable tourism'}</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            <Reveal delay={0.1}>
              <div className="bg-white rounded-2xl p-8 border border-accent/10 hover:border-accent/40 transition-colors card-shadow h-full">
                <div className="w-14 h-14 rounded-xl gradient-gold flex items-center justify-center mb-5">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-primary mb-3">{isAr ? 'مهمتنا' : 'Our Mission'}</h3>
                <p className="text-foreground/80 leading-relaxed">
                  {isAr
                    ? 'تقديم تجارب سياحية فاخرة وأصيلة في شرم الشيخ وسيناء، بأعلى معايير الجودة والأمان، وبأسعار شفافة وعادلة.'
                    : 'Deliver luxury, authentic tourism experiences in Sharm El Sheikh with the highest quality and transparent pricing.'}
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="bg-white rounded-2xl p-8 border border-accent/10 hover:border-accent/40 transition-colors card-shadow h-full">
                <div className="w-14 h-14 rounded-xl gradient-gold flex items-center justify-center mb-5">
                  <Eye className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-primary mb-3">{isAr ? 'رؤيتنا' : 'Our Vision'}</h3>
                <p className="text-foreground/80 leading-relaxed">
                  {isAr
                    ? 'أن نكون العلامة السياحية الأولى المختارة في شرم الشيخ، ومنصة عربية تنافس الشركات العالمية.'
                    : 'To be the #1 chosen tourism brand in Sharm, an Egyptian platform competing globally.'}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-cream">
        <div className="container">
          <Reveal className="text-center mb-12">
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">{isAr ? 'قيمنا' : 'Our values'}</div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary">{isAr ? 'ما نؤمن به' : 'What we believe in'}</h2>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {values.map((v, i) => (
              <Reveal key={v.en} delay={i * 0.1}>
                <div className="group bg-white rounded-2xl p-5 md:p-7 border border-accent/10 hover:border-accent hover:-translate-y-2 transition-all duration-500 card-shadow h-full">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl gradient-gold flex items-center justify-center text-primary mb-4 group-hover:rotate-6 transition-transform">
                    <v.icon className="h-6 w-6 md:h-7 md:w-7" />
                  </div>
                  <h3 className="font-serif font-bold text-base md:text-xl text-primary mb-2">{isAr ? v.ar : v.en}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{isAr ? v.arDesc : v.enDesc}</p>
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
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">{isAr ? 'رحلتنا' : 'Our journey'}</div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold">{isAr ? 'محطات مهمة' : 'Key milestones'}</h2>
          </Reveal>
          <div className="max-w-3xl mx-auto space-y-5 md:space-y-7">
            {timeline.map((t, i) => (
              <Reveal key={t.year} delay={i * 0.08}>
                <div className="flex items-center gap-4 md:gap-6 group">
                  <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-accent text-primary font-serif font-bold text-base md:text-lg flex items-center justify-center shadow-lg shadow-accent/30 group-hover:scale-110 transition-transform">
                    {t.year}
                  </div>
                  <div className="flex-1 bg-cream/5 backdrop-blur rounded-xl p-4 md:p-5 border border-accent/15">
                    <p className="text-cream/90 leading-relaxed text-sm md:text-base">{isAr ? t.ar : t.en}</p>
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
                {isAr ? 'جاهز للانضمام لعائلتنا؟' : 'Ready to join our family?'}
              </h2>
              <p className="opacity-90 mb-8 max-w-xl mx-auto">
                {isAr ? 'تواصل معنا اليوم ودعنا نخطط رحلتك المثالية' : 'Contact us today — let us plan your perfect getaway'}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button asChild size="lg" className="bg-accent text-primary hover:bg-accent-400 font-bold">
                  <Link href="/trips">{isAr ? 'تصفح رحلاتنا' : 'Browse Trips'} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-cream/40 text-cream hover:bg-cream hover:text-primary">
                  <Link href="/contact"><Phone className="h-4 w-4" /> {isAr ? 'تواصل معنا' : 'Contact Us'}</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
