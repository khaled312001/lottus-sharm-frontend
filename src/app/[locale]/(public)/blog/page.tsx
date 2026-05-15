import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Reveal } from '@/components/public/motion';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { BlogPostDTO } from '@/types/api';
import { localeToApiCode, buildWhatsAppLink, L } from '@/lib/utils';
import { Calendar, Clock, BookOpen, MessageCircle, ArrowRight } from 'lucide-react';

export const revalidate = 60;

// Curated travel-guide topics shown as placeholders until the client publishes real posts
const PLACEHOLDER_TOPICS = [
  { slug: '#', cat_ar: 'دليل الزائر', cat_en: 'Visitor Guide', ar: 'أفضل 10 أنشطة تجربها في شرم الشيخ', en: '10 Must-Do Activities in Sharm El Sheikh', img: '/hero-slides/hero-01.jpg' },
  { slug: '#', cat_ar: 'نصائح سفر', cat_en: 'Travel Tips', ar: 'متى أفضل وقت لزيارة شرم الشيخ؟', en: 'Best Time to Visit Sharm El Sheikh', img: '/hero-slides/hero-04.jpg' },
  { slug: '#', cat_ar: 'الغوص', cat_en: 'Diving', ar: 'أفضل 5 مواقع غوص في البحر الأحمر', en: 'Top 5 Diving Spots in the Red Sea', img: '/hero-slides/hero-07.jpg' },
  { slug: '#', cat_ar: 'صحراء', cat_en: 'Desert', ar: 'مغامرة سفاري الصحراء — ماذا تتوقع؟', en: 'Desert Safari Adventure — What to Expect', img: '/hero-slides/hero-02.jpg' },
  { slug: '#', cat_ar: 'تاريخ', cat_en: 'History', ar: 'دير سانت كاترين: تاريخ يمتد 1500 سنة', en: 'St. Catherine Monastery: 1500 Years of History', img: '/hero-slides/hero-11.jpg' },
  { slug: '#', cat_ar: 'طبيعة', cat_en: 'Nature', ar: 'محمية راس محمد: جنة الشعاب المرجانية', en: 'Ras Mohammed: Coral Reef Paradise', img: '/hero-slides/hero-13.jpg' },
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

  return (
    <>
      <section className="relative bg-primary-900 text-cream py-20 md:py-28 overflow-hidden">
        <Image src="/hero-slides/hero-09.jpg" alt="" fill className="object-cover opacity-30" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 via-primary-900/70 to-primary-900" />
        <div className="container relative">
          <Reveal>
            <BookOpen className="h-10 w-10 text-accent mb-4" />
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">{L(locale, { ar: 'مدوّنة لوتس شرم', en: 'Lotus Sharm Blog', ru: 'Блог Lotus Sharm', it: 'Blog Lotus Sharm' })}</div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 max-w-3xl leading-[1.1]">{t('blog.title')}</h1>
            <p className="text-lg opacity-90 max-w-2xl">{t('blog.subtitle')}</p>
          </Reveal>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        {hasPosts ? (
          <>
            {/* Featured post */}
            {featured && (
              <Reveal>
                <Link href={`/blog/${featured.slug}`} className="group block mb-12">
                  <article className="grid md:grid-cols-2 gap-6 md:gap-10 bg-white rounded-2xl overflow-hidden border border-accent/15 card-shadow hover:card-shadow-gold transition-shadow">
                    <div className="relative aspect-[4/3] md:aspect-auto bg-muted">
                      {featured.coverImage?.url && (
                        <Image src={featured.coverImage.mediumUrl || featured.coverImage.url} alt={featured.tr?.title || ''} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      )}
                      <span className="absolute top-4 start-4 inline-block px-3 py-1 rounded-full bg-accent text-primary text-xs font-bold uppercase tracking-wider">
                        {L(locale, { ar: 'مقال مميز', en: 'Featured', ru: 'Популярный', it: 'In evidenza' })}
                      </span>
                    </div>
                    <div className="p-6 md:p-10 flex flex-col justify-center">
                      <h2 className="font-serif text-2xl md:text-4xl font-bold text-primary mb-3 leading-tight group-hover:text-accent transition-colors">
                        {featured.tr?.title}
                      </h2>
                      <p className="text-muted-foreground mb-6 line-clamp-3">{featured.tr?.excerpt}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {featured.publishedAt && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(featured.publishedAt).toLocaleDateString(L(locale, { ar: 'ar-EG', en: 'en' }))}</span>}
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {t('blog.readTime', { min: featured.readTime })}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              </Reveal>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.08}>
                  <Link href={`/blog/${p.slug}`} className="group block h-full">
                    <article className="bg-white rounded-2xl overflow-hidden border border-accent/15 card-shadow hover:card-shadow-gold transition-shadow h-full">
                      <div className="aspect-[16/9] relative bg-muted">
                        {p.coverImage?.url && <Image src={p.coverImage.mediumUrl || p.coverImage.url} alt={p.tr?.title || ''} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform" />}
                      </div>
                      <div className="p-5">
                        <h3 className="font-serif font-bold text-lg mb-2 line-clamp-2 text-primary group-hover:text-accent transition-colors">{p.tr?.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{p.tr?.excerpt}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {p.publishedAt && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(p.publishedAt).toLocaleDateString(L(locale, { ar: 'ar-EG', en: 'en' }))}</span>}
                          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {t('blog.readTime', { min: p.readTime })}</span>
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
            <div className="text-center mb-12">
              <div className="inline-block px-4 py-2 rounded-full bg-accent/15 text-accent-700 font-bold text-xs uppercase tracking-wider mb-4">
                {L(locale, { ar: 'قريباً', en: 'Coming soon', ru: 'Скоро', it: 'Presto' })}
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-3">
                {L(locale, { ar: 'مقالات سفر وأدلة سياحية تُنشر قريباً', en: 'Travel articles and guides launching soon', ru: 'Скоро опубликуем статьи и гиды по путешествиям', it: 'Articoli di viaggio e guide in arrivo' })}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {L(locale, { ar: 'فريقنا يجهز محتوى ثرياً عن شرم الشيخ وأجمل وجهات مصر السياحية', en: "Our team is preparing rich content about Sharm El Sheikh and Egypt's top destinations" })}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {PLACEHOLDER_TOPICS.map((p, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <article className="group bg-white rounded-2xl overflow-hidden border border-accent/15 card-shadow hover:card-shadow-gold transition-all h-full opacity-90">
                    <div className="aspect-[16/9] relative bg-muted overflow-hidden">
                      <Image src={p.img} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-primary-900/40" />
                      <span className="absolute top-3 start-3 inline-block px-2.5 py-1 rounded-full bg-cream/95 text-primary text-[10px] font-bold uppercase tracking-wider">
                        {L(locale, { ar: p.cat_ar, en: p.cat_en })}
                      </span>
                      <span className="absolute top-3 end-3 inline-block px-2 py-1 rounded-full bg-accent/95 text-primary text-[9px] font-bold uppercase">
                        {L(locale, { ar: 'قريباً', en: 'Soon', ru: 'Скоро', it: 'Presto' })}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif font-bold text-lg leading-snug text-primary line-clamp-2">{L(locale, { ar: p.ar, en: p.en })}</h3>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </Reveal>
        )}
      </section>

      <section className="py-16 bg-gradient-to-b from-cream to-muted/30">
        <div className="container">
          <Reveal>
            <div className="relative max-w-4xl mx-auto rounded-2xl bg-primary text-cream p-8 md:p-12 text-center overflow-hidden">
              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/15 blur-3xl" />
              <MessageCircle className="h-10 w-10 text-accent mx-auto mb-4" />
              <h3 className="font-serif text-2xl md:text-3xl font-bold mb-3">
                {L(locale, { ar: 'استفسارات سفر؟', en: 'Travel questions?', ru: 'Вопросы о путешествии?', it: 'Domande di viaggio?' })}
              </h3>
              <p className="opacity-85 mb-6 max-w-xl mx-auto">
                {L(locale, { ar: 'خبراءنا متاحون عبر واتساب للإجابة على كل أسئلتك عن السفر في مصر', en: 'Our experts are on WhatsApp to answer all your Egypt travel questions', ru: 'Наши эксперты в WhatsApp ответят на все ваши вопросы о Египте', it: 'I nostri esperti rispondono via WhatsApp a tutte le domande sull\'Egitto' })}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a href={buildWhatsAppLink('201090767278')} target="_blank" rel="noopener" className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ea954] text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-[#25D366]/30">
                  <MessageCircle className="h-5 w-5" /> {L(locale, { ar: 'واتساب', en: 'WhatsApp', ru: 'WhatsApp', it: 'WhatsApp' })}
                </a>
                <Button asChild size="lg" variant="outline" className="border-cream/40 text-cream hover:bg-cream hover:text-primary">
                  <Link href="/trips">{L(locale, { ar: 'تصفح الرحلات', en: 'Browse Trips', ru: 'Просмотреть туры', it: 'Sfoglia i tour' })} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
