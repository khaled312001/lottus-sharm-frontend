import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { Star, MessageCircle, ArrowRight, Quote } from 'lucide-react';
import { api } from '@/lib/api';
import { L } from '@/lib/utils';
import { Reveal } from '@/components/public/motion';

export const revalidate = 60;

interface ReviewItem {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  locale: 'AR' | 'EN' | 'RU' | 'IT';
  createdAt: string;
  trip?: {
    slug: string;
    translations: Array<{ locale: string; title: string }>;
  } | null;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const title = L(locale, {
    ar: 'تقييمات الضيوف — لوتس شرم للسياحة',
    en: 'Guest Reviews — Lotus Sharm Tourism',
    ru: 'Отзывы гостей — Lotus Sharm',
    it: 'Recensioni — Lotus Sharm Tourism',
  });
  const description = L(locale, {
    ar: 'تقييمات حقيقية من زوار لوتس شرم — تجارب من شرم الشيخ والبحر الأحمر.',
    en: 'Verified guest reviews — real Lotus Sharm experiences in Sharm El Sheikh and the Red Sea.',
    ru: 'Реальные отзывы гостей Lotus Sharm о Шарм-эль-Шейхе и Красном море.',
    it: 'Recensioni verificate degli ospiti — esperienze Lotus Sharm a Sharm El Sheikh.',
  });
  return { title, description };
}

export default async function ReviewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  let reviews: ReviewItem[] = [];
  try {
    const company = await api.get<{ items: ReviewItem[] }>('/public/reviews/company?limit=60');
    reviews = company.items || [];
    if (reviews.length < 12) {
      const tripWide = await api.get<{ items: ReviewItem[] }>('/public/reviews?limit=40');
      reviews = [...reviews, ...(tripWide.items || [])];
    }
  } catch {
    reviews = [];
  }

  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;

  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary to-primary-900 text-cream py-14 md:py-20 overflow-hidden">
        <div aria-hidden className="absolute -top-32 -end-32 w-96 h-96 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute -bottom-20 -start-20 w-72 h-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="container relative">
          <Reveal>
            <span className="eyebrow">
              {L(locale, { ar: 'آراء عملائنا', en: 'What guests say', ru: 'Отзывы гостей', it: 'Cosa dicono gli ospiti' })}
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4 leading-tight">
              {L(locale, {
                ar: 'تجارب حقيقية من ضيوفنا',
                en: 'Real stories from real travelers',
                ru: 'Реальные истории реальных путешественников',
                it: 'Storie vere di veri viaggiatori',
              })}
            </h1>
            <div className="w-16 h-0.5 gradient-gold rounded-full mb-5" />
            <div className="flex flex-wrap items-center gap-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cream/10 backdrop-blur border border-accent/30">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < Math.round(avg) ? 'fill-accent text-accent' : 'text-cream/30'}`} />
                  ))}
                </div>
                <span className="font-serif text-2xl font-bold text-accent">{avg.toFixed(1)}</span>
                <span className="text-xs uppercase tracking-wider text-cream/65">/ 5.0</span>
              </div>
              <div className="text-sm">
                <strong className="text-accent">{reviews.length}+</strong> {L(locale, { ar: 'تقييم موثّق', en: 'verified reviews', ru: 'проверенных отзывов', it: 'recensioni verificate' })}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Action band */}
      <section className="bg-accent/10 border-y border-accent/20 py-4">
        <div className="container flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-primary font-bold">
            {L(locale, {
              ar: 'سافرت معنا قبل كده؟ شاركنا تجربتك.',
              en: 'Travelled with us before? Share your experience.',
              ru: 'Уже путешествовали с нами? Поделитесь впечатлениями.',
              it: 'Hai viaggiato con noi? Condividi la tua esperienza.',
            })}
          </p>
          <Link
            href={'/review' as never}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-cream font-bold hover:bg-primary-900 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            {L(locale, { ar: 'اترك تقييمك', en: 'Leave a review', ru: 'Оставить отзыв', it: 'Lascia una recensione' })}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>

      {/* List */}
      <section className="container py-12">
        {reviews.length === 0 ? (
          <div className="text-center py-16">
            <Quote className="h-12 w-12 text-accent/30 mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold text-primary mb-2">
              {L(locale, { ar: 'أول تقييم منك!', en: 'Be the first to review us', ru: 'Будьте первым', it: 'Sii il primo' })}
            </h2>
            <p className="text-muted-foreground mb-6">
              {L(locale, {
                ar: 'لسه مفيش تقييمات منشورة. لو سافرت معانا، شاركنا تجربتك.',
                en: 'No reviews yet. If you have travelled with us, share your story.',
                ru: 'Отзывов пока нет. Поделитесь своей историей.',
                it: 'Nessuna recensione ancora. Condividi la tua storia.',
              })}
            </p>
            <Link href={'/review' as never} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-cream font-bold hover:bg-primary-900 transition-colors">
              <Star className="h-4 w-4 fill-current" />
              {L(locale, { ar: 'اترك تقييمك', en: 'Leave a review', ru: 'Оставить отзыв', it: 'Lascia una recensione' })}
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {reviews.map((r, i) => {
              const tripTitle = r.trip?.translations.find((t) => t.locale === locale.toUpperCase())?.title || r.trip?.translations[0]?.title;
              return (
                <Reveal key={r.id} delay={(i % 6) * 0.05}>
                  <article className="bg-white rounded-2xl border border-accent/15 p-5 hover:border-accent/40 hover:shadow-lg transition-all h-full flex flex-col">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} className={`h-4 w-4 ${idx < r.rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{r.locale}</span>
                    </div>
                    <Quote className="h-5 w-5 text-accent/30 mb-2" />
                    <p className="text-sm text-foreground/85 leading-relaxed mb-4 flex-1 line-clamp-6">{r.comment}</p>
                    <div className="pt-3 border-t border-accent/10 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-primary text-sm truncate">{r.customerName}</div>
                        {tripTitle && (
                          <Link href={`/trips/${r.trip!.slug}`} className="text-[11px] text-muted-foreground hover:text-accent-700 truncate inline-block max-w-full">
                            {tripTitle}
                          </Link>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : locale, { year: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
