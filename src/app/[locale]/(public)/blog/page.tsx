import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Reveal } from '@/components/public/motion';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { BlogPostDTO } from '@/types/api';
import { localeToApiCode, buildWhatsAppLink, L } from '@/lib/utils';
import { pickCoverImage } from '@/lib/blog-images';
import { Calendar, Clock, BookOpen, MessageCircle, ArrowRight } from 'lucide-react';
import { fetchCMSPage } from '@/lib/cms';

export const revalidate = 60;

// Curated travel-guide topics shown as placeholders until the client publishes real posts
const PLACEHOLDER_TOPICS = [
  { slug: '#', cat_ar: 'دليل الزائر', cat_en: 'Visitor Guide', cat_de: 'Besucherführer', cat_ru: 'Гид для туристов', cat_it: 'Guida del visitatore', ar: 'أفضل 10 أنشطة تجربها في شرم الشيخ', en: '10 Must-Do Activities in Sharm El Sheikh', de: '10 unverzichtbare Aktivitäten in Sharm El Sheikh', ru: '10 обязательных активностей в Шарм-эль-Шейхе', it: '10 attività imperdibili a Sharm El Sheikh', img: '/hero-slides/hero-01.jpg' },
  { slug: '#', cat_ar: 'نصائح سفر', cat_en: 'Travel Tips', cat_de: 'Reisetipps', cat_ru: 'Советы путешественникам', cat_it: 'Consigli di viaggio', ar: 'متى أفضل وقت لزيارة شرم الشيخ؟', en: 'Best Time to Visit Sharm El Sheikh', de: 'Beste Reisezeit für Sharm El Sheikh', ru: 'Лучшее время для поездки в Шарм-эль-Шейх', it: 'Quando visitare Sharm El Sheikh', img: '/hero-slides/hero-04.jpg' },
  { slug: '#', cat_ar: 'الغوص', cat_en: 'Diving', cat_de: 'Tauchen', cat_ru: 'Дайвинг', cat_it: 'Diving', ar: 'أفضل 5 مواقع غوص في البحر الأحمر', en: 'Top 5 Diving Spots in the Red Sea', de: 'Top 5 Tauchplätze im Roten Meer', ru: 'Топ-5 мест для дайвинга в Красном море', it: 'Top 5 spot per il diving nel Mar Rosso', img: '/hero-slides/hero-07.jpg' },
  { slug: '#', cat_ar: 'صحراء', cat_en: 'Desert', cat_de: 'Wüste', cat_ru: 'Пустыня', cat_it: 'Deserto', ar: 'مغامرة سفاري الصحراء — ماذا تتوقع؟', en: 'Desert Safari Adventure — What to Expect', de: 'Wüstensafari — Was Sie erwartet', ru: 'Сафари в пустыне — чего ждать', it: 'Safari nel deserto — cosa aspettarsi', img: '/hero-slides/hero-02.jpg' },
  { slug: '#', cat_ar: 'تاريخ', cat_en: 'History', cat_de: 'Geschichte', cat_ru: 'История', cat_it: 'Storia', ar: 'دير سانت كاترين: تاريخ يمتد 1500 سنة', en: 'St. Catherine Monastery: 1500 Years of History', de: 'Katharinenkloster: 1500 Jahre Geschichte', ru: 'Монастырь Святой Екатерины: 1500 лет истории', it: 'Monastero di S. Caterina: 1500 anni di storia', img: '/hero-slides/hero-11.jpg' },
  { slug: '#', cat_ar: 'طبيعة', cat_en: 'Nature', cat_de: 'Natur', cat_ru: 'Природа', cat_it: 'Natura', ar: 'محمية راس محمد: جنة الشعاب المرجانية', en: 'Ras Mohammed: Coral Reef Paradise', de: 'Ras Mohammed: Korallenriff-Paradies', ru: 'Рас-Мохаммед: рай коралловых рифов', it: 'Ras Mohammed: paradiso dei coralli', img: '/hero-slides/hero-13.jpg' },
];

export default async function BlogIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const isAr = locale === 'ar';

  let posts: BlogPostDTO[] = [];
  try {
    const res = await api.get<{ items: BlogPostDTO[] }>(`/public/blog?locale=${localeToApiCode(locale)}&pageSize=12`);
    posts = res.items;
  } catch { /* ignore */ }

  const hasPosts = posts.length > 0;
  const featured = posts[0];
  const rest = posts.slice(1);

  const cms = await fetchCMSPage('blog', locale);
  const heroTitle = cms?.tr?.title || t('blog.title');
  const heroSubtitle = cms?.tr?.subtitle || t('blog.subtitle');
  const heroImageUrl = cms?.heroImage?.url || '/hero-slides/hero-09.jpg';

  return (
    <>
      <section className="relative bg-primary-900 text-cream py-16 md:py-28 overflow-hidden">
        <Image src={heroImageUrl} alt="" fill className="object-cover opacity-30 scale-105" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/85 via-primary-900/65 to-primary-900" />
        <div className="absolute top-1/4 -end-24 w-80 h-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -start-20 w-80 h-80 rounded-full bg-accent/8 blur-3xl pointer-events-none" />
        <div className="container relative">
          <Reveal>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 mb-5 backdrop-blur">
              <BookOpen className="h-7 w-7 text-accent" />
            </div>
            <div className="inline-flex items-center gap-2.5 mb-3">
              <span className="block w-7 h-px bg-accent" />
              <span className="text-accent uppercase tracking-[0.3em] text-[10px] sm:text-xs font-bold">{L(locale, { ar: 'مدوّنة لوتس شرم', en: 'Lotus Sharm Blog', de: 'Lotus Sharm Blog', ru: 'Блог Lotus Sharm', it: 'Blog Lotus Sharm' })}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl font-bold mb-4 max-w-3xl leading-[1.1] text-balance">{heroTitle}</h1>
            <p className="text-base sm:text-lg opacity-90 max-w-2xl leading-relaxed">{heroSubtitle}</p>
          </Reveal>
        </div>
      </section>

      <section className="container py-10 md:py-16">
        {hasPosts ? (
          <>
            {/* Featured post */}
            {featured && (
              <Reveal>
                <Link href={`/blog/${featured.slug}`} className="group block mb-10 md:mb-14">
                  <article className="relative grid md:grid-cols-2 gap-0 md:gap-10 bg-white rounded-2xl overflow-hidden border border-accent/15 card-shadow hover:card-shadow-gold hover:-translate-y-1 transition-all duration-300">
                    <div className="relative aspect-[16/10] md:aspect-auto bg-muted overflow-hidden">
                      <Image
                        src={featured.coverImage?.mediumUrl || featured.coverImage?.url || pickCoverImage(featured.slug)}
                        alt={featured.tr?.title || ''}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-primary-900/60 via-primary-900/10 to-transparent md:via-transparent" />
                      <span className="absolute top-4 start-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-primary text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg shadow-accent/30">
                        <span className="block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        {L(locale, { ar: 'مقال مميز', en: 'Featured', de: 'Empfohlen', ru: 'Популярный', it: 'In evidenza' })}
                      </span>
                    </div>
                    <div className="p-6 md:p-10 flex flex-col justify-center">
                      <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 leading-tight group-hover:text-accent transition-colors text-balance">
                        {featured.tr?.title}
                      </h2>
                      <p className="text-muted-foreground mb-5 line-clamp-3 leading-relaxed">{featured.tr?.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {featured.publishedAt && <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-accent" /> {new Date(featured.publishedAt).toLocaleDateString(L(locale, { ar: 'ar-EG', en: 'en', ru: 'ru-RU', it: 'it-IT', de: 'de-DE' }))}</span>}
                        <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-accent" /> {t('blog.readTime', { min: featured.readTime })}</span>
                        <span className="ms-auto inline-flex items-center gap-1 text-accent font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          {L(locale, { ar: 'اقرأ', en: 'Read', de: 'Lesen', ru: 'Читать', it: 'Leggi' })} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              </Reveal>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {rest.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.08}>
                  <Link href={`/blog/${p.slug}`} className="group block h-full">
                    <article className="relative bg-white rounded-2xl overflow-hidden border border-accent/15 card-shadow hover:card-shadow-gold hover:-translate-y-1 hover:border-accent/40 transition-all duration-300 h-full flex flex-col">
                      <div className="aspect-[16/9] relative bg-muted overflow-hidden">
                        <Image
                          src={p.coverImage?.mediumUrl || p.coverImage?.url || pickCoverImage(p.slug)}
                          alt={p.tr?.title || ''}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-serif font-bold text-lg mb-2 line-clamp-2 text-primary group-hover:text-accent transition-colors leading-snug">{p.tr?.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">{p.tr?.excerpt}</p>
                        <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-accent/10">
                          {p.publishedAt && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3 text-accent" /> {new Date(p.publishedAt).toLocaleDateString(L(locale, { ar: 'ar-EG', en: 'en', ru: 'ru-RU', it: 'it-IT', de: 'de-DE' }))}</span>}
                          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3 text-accent" /> {t('blog.readTime', { min: p.readTime })}</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </Reveal>
              ))}
            </div>
          </>
        ) : (
          // Placeholder: showcase coming-soon topics
          <Reveal>
            <div className="text-center mb-10 md:mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/15 text-accent-700 font-bold text-xs uppercase tracking-wider mb-4 border border-accent/20">
                <span className="block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                {L(locale, { ar: 'قريباً', en: 'Coming soon', de: 'Coming soon', ru: 'Скоро', it: 'Presto' })}
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 max-w-2xl mx-auto leading-tight text-balance">
                {L(locale, { ar: 'مقالات سفر وأدلة سياحية تُنشر قريباً', en: 'Travel articles and guides launching soon', de: 'Travel articles and guides launching soon', ru: 'Скоро опубликуем статьи и гиды по путешествиям', it: 'Articoli di viaggio e guide in arrivo' })}
              </h2>
              <div className="w-16 h-0.5 gradient-gold rounded-full mx-auto my-4" />
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {L(locale, { ar: 'فريقنا يجهز محتوى ثرياً عن شرم الشيخ وأجمل وجهات مصر السياحية', en: "Our team is preparing rich content about Sharm El Sheikh and Egypt's top destinations", de: "Our team is preparing rich content about Sharm El Sheikh and Egypt's top destinations", ru: 'Наша команда готовит интересный контент о Шарм-эль-Шейхе и лучших местах Египта', it: 'Il nostro team sta preparando contenuti su Sharm El Sheikh e le migliori destinazioni egiziane' })}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {PLACEHOLDER_TOPICS.map((p, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <article className="group relative bg-white rounded-2xl overflow-hidden border border-accent/15 card-shadow hover:card-shadow-gold hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="aspect-[16/9] relative bg-muted overflow-hidden">
                      <Image src={p.img} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-primary-900/20 to-primary-900/10" />
                      <span className="absolute top-3 start-3 inline-block px-2.5 py-1 rounded-full bg-cream/95 text-primary text-[10px] font-bold uppercase tracking-wider shadow-md">
                        {L(locale, { ar: p.cat_ar, en: p.cat_en, ru: p.cat_ru, it: p.cat_it, de: p.cat_en })}
                      </span>
                      <span className="absolute top-3 end-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/95 text-primary text-[9px] font-bold uppercase shadow-md">
                        <span className="block w-1 h-1 rounded-full bg-primary animate-pulse" />
                        {L(locale, { ar: 'قريباً', en: 'Soon', de: 'Soon', ru: 'Скоро', it: 'Presto' })}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif font-bold text-lg leading-snug text-primary line-clamp-2 group-hover:text-accent transition-colors">{L(locale, { ar: p.ar, en: p.en, ru: p.ru, it: p.it, de: p.de })}</h3>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </Reveal>
        )}
      </section>

      <section className="relative py-14 md:py-20 bg-gradient-to-b from-cream to-muted/30 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="container relative">
          <Reveal>
            <div className="relative max-w-4xl mx-auto rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-900 text-cream p-7 sm:p-10 md:p-12 text-center overflow-hidden border border-accent/20 shadow-2xl">
              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/15 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 mx-auto mb-4 backdrop-blur">
                  <MessageCircle className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-balance">
                  {L(locale, { ar: 'استفسارات سفر؟', en: 'Travel questions?', de: 'Travel questions?', ru: 'Вопросы о путешествии?', it: 'Domande di viaggio?' })}
                </h3>
                <div className="w-12 h-0.5 gradient-gold rounded-full mx-auto mb-4" />
                <p className="opacity-85 mb-7 max-w-xl mx-auto leading-relaxed">
                  {L(locale, { ar: 'خبراءنا متاحون عبر واتساب للإجابة على كل أسئلتك عن السفر في مصر', en: 'Our experts are on WhatsApp to answer all your Egypt travel questions', de: 'Our experts are on WhatsApp to answer all your Egypt travel questions', ru: 'Наши эксперты в WhatsApp ответят на все ваши вопросы о Египте', it: 'I nostri esperti rispondono via WhatsApp a tutte le domande sull\'Egitto' })}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <a href={buildWhatsAppLink('201090767278')} target="_blank" rel="noopener" className="group inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ea954] text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 hover:-translate-y-0.5 transition-all duration-200">
                    <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" /> {L(locale, { ar: 'واتساب', en: 'WhatsApp', de: 'WhatsApp', ru: 'WhatsApp', it: 'WhatsApp' })}
                  </a>
                  <Button asChild size="lg" variant="outline" className="border-cream/40 text-cream hover:bg-cream hover:text-primary group">
                    <Link href="/trips">{L(locale, { ar: 'تصفح الرحلات', en: 'Browse Trips', de: 'Browse Trips', ru: 'Просмотреть туры', it: 'Sfoglia i tour' })} <ArrowRight className="h-4 w-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" /></Link>
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
