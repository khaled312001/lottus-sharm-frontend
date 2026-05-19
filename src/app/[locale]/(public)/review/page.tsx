import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { ReviewForm } from '@/components/public/review-form';
import { L } from '@/lib/utils';
import { Star, Quote, MessageCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Reveal } from '@/components/public/motion';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface ReviewItem {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  locale: 'AR' | 'EN' | 'RU' | 'IT' | 'DE';
  createdAt: string;
  images?: string[];
  videos?: string[];
  trip?: { slug: string; translations: Array<{ locale: string; title: string }> } | null;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const title = L(locale, {
    ar: 'تقييمات العملاء واترك تقييمك — لوتس شرم',
    en: 'Customer reviews — Lotus Sharm Tourism',
    ru: 'Отзывы клиентов — Lotus Sharm',
    it: 'Recensioni clienti — Lotus Sharm',
  });
  const description = L(locale, {
    ar: 'اقرأ تقييمات حقيقية من ضيوف لوتس شرم — أو شاركنا تجربتك في دقيقة واحدة.',
    en: 'Read verified Lotus Sharm guest reviews — or share your own in a minute.',
    ru: 'Реальные отзывы гостей Lotus Sharm — или поделитесь своим за минуту.',
    it: 'Recensioni verificate degli ospiti Lotus Sharm — o condividi la tua.',
  });
  return { title, description };
}

export default async function ReviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  let reviews: ReviewItem[] = [];
  let avg = 0;
  let total = 0;
  try {
    const c = await api.get<{ items: ReviewItem[]; total: number; average: number }>('/public/reviews/company?limit=60');
    reviews = c.items || [];
    avg = c.average || 0;
    total = c.total || 0;
    if (reviews.length < 12) {
      const tripWide = await api.get<{ items: ReviewItem[] }>('/public/reviews?limit=40');
      // Dedupe by id — company and trip-wide endpoints can overlap
      const seenIds = new Set(reviews.map((r) => r.id));
      for (const r of (tripWide.items || [])) {
        if (!seenIds.has(r.id)) {
          reviews.push(r);
          seenIds.add(r.id);
        }
      }
      total = Math.max(total, reviews.length);
      if (avg === 0 && reviews.length > 0) avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
    }
  } catch { /* ignore */ }

  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary to-primary-900 text-cream py-12 md:py-16 overflow-hidden">
        <div aria-hidden className="absolute -top-32 -end-32 w-96 h-96 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div className="container relative text-center max-w-3xl mx-auto">
          <Reveal>
            <span className="eyebrow eyebrow-center">
              {L(locale, { ar: 'تقييمات الضيوف', en: 'Guest reviews', ru: 'Отзывы гостей', it: 'Recensioni' })}
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4 leading-tight">
              {L(locale, {
                ar: 'تجارب حقيقية من ضيوفنا',
                en: 'Real stories from real travelers',
                ru: 'Реальные истории от реальных путешественников',
                it: 'Storie vere di veri viaggiatori',
              })}
            </h1>
            <div className="w-16 h-0.5 gradient-gold rounded-full mx-auto mb-5" />
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-cream/10 backdrop-blur border border-accent/30">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.round(avg) ? 'fill-accent text-accent' : 'text-cream/30'}`} />
                ))}
              </div>
              <span className="font-serif text-2xl font-bold text-accent">{avg.toFixed(1)}</span>
              <span className="text-xs uppercase tracking-wider text-cream/60 ms-1 ps-2 border-s border-cream/20">
                <strong className="text-accent">{total}+</strong>{' '}
                {L(locale, { ar: 'تقييم موثّق', en: 'verified reviews', ru: 'проверенных отзывов', it: 'recensioni verificate' })}
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container py-10 md:py-14 grid lg:grid-cols-[1fr_400px] gap-6 md:gap-8">
        {/* === LEFT: All reviews list === */}
        <div>
          <div className="flex items-baseline justify-between gap-3 mb-5">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary">
              {L(locale, { ar: 'كل التقييمات', en: 'All reviews', ru: 'Все отзывы', it: 'Tutte le recensioni' })}
            </h2>
            <span className="text-sm text-muted-foreground tabular-nums">{reviews.length}</span>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-accent/25 p-10 text-center">
              <Quote className="h-10 w-10 text-accent/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                {L(locale, { ar: 'كن أول من يقيّمنا!', en: 'Be the first to review us!', ru: 'Будьте первым!', it: 'Sii il primo!' })}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
              {reviews.map((r, i) => {
                const tripTitle = r.trip?.translations.find((t) => t.locale === locale.toUpperCase())?.title || r.trip?.translations[0]?.title;
                return (
                  <Reveal key={r.id} delay={(i % 6) * 0.04}>
                    <article className="bg-white rounded-xl border border-accent/15 p-4 hover:border-accent/40 hover:shadow-md transition-all h-full flex flex-col overflow-hidden">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star key={idx} className={`h-3.5 w-3.5 ${idx < r.rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`} />
                          ))}
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{r.locale}</span>
                      </div>
                      <p className="text-[13px] text-foreground/85 leading-relaxed mb-3 flex-1 line-clamp-6" dir="auto">{r.comment}</p>

                      {/* Attached images */}
                      {r.images && r.images.length > 0 && (
                        <div className={`grid gap-1 mb-3 ${r.images.length === 1 ? 'grid-cols-1' : r.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                          {r.images.slice(0, 3).map((url, idx) => (
                            <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="relative aspect-square overflow-hidden rounded-md bg-muted group">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              {idx === 2 && r.images!.length > 3 && (
                                <span className="absolute inset-0 bg-black/55 flex items-center justify-center text-white text-xs font-bold">+{r.images!.length - 3}</span>
                              )}
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Attached videos */}
                      {r.videos && r.videos.length > 0 && (
                        <div className="grid gap-1 mb-3 grid-cols-1">
                          {r.videos.slice(0, 1).map((url) => (
                            <video key={url} src={url} controls preload="metadata" className="w-full aspect-video rounded-md bg-black" />
                          ))}
                        </div>
                      )}

                      <div className="pt-2 border-t border-accent/10 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-bold text-primary text-xs truncate">{r.customerName}</div>
                          {tripTitle && <div className="text-[10px] text-muted-foreground truncate">{tripTitle}</div>}
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
        </div>

        {/* === RIGHT: Sticky leave-a-review form === */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-gradient-to-br from-primary-900 via-primary to-primary-900 text-cream rounded-3xl p-5 md:p-6 shadow-xl border border-accent/30">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent/20 border border-accent/40 backdrop-blur">
                <MessageCircle className="h-6 w-6 text-accent" />
              </span>
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-accent font-bold">
                  {L(locale, { ar: 'سافرت معنا؟', en: 'Travelled with us?', ru: 'Путешествовали?', it: 'Hai viaggiato con noi?' })}
                </div>
                <h2 className="font-serif text-xl font-bold leading-tight">
                  {L(locale, { ar: 'اترك تقييمك', en: 'Leave a review', ru: 'Оставьте отзыв', it: 'Lascia una recensione' })}
                </h2>
              </div>
            </div>
            <p className="text-xs text-cream/75 leading-relaxed mb-4">
              {L(locale, {
                ar: 'رأيك يهمنا. اكتب عن رحلتك في دقيقة، وهيظهر بعد المراجعة.',
                en: 'Your feedback matters. Write in a minute — appears after review.',
                ru: 'Поделитесь впечатлениями за минуту — появится после модерации.',
                it: 'Scrivi in un minuto — apparirà dopo la moderazione.',
              })}
            </p>
            <div className="bg-cream/5 backdrop-blur border border-accent/20 rounded-2xl p-4">
              <ReviewForm locale={locale} />
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
