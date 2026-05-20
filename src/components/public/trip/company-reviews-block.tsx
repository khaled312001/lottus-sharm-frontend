'use client';

import { useEffect, useState } from 'react';
import { Star, Quote, MessageSquareQuote } from 'lucide-react';
import { api } from '@/lib/api';
import { L } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ImageLightbox } from '../image-lightbox';

// Display-only company-wide reviews — used on trip detail pages.
// No "write a review" CTAs here; the form lives at /review.

interface CompanyReviewItem {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  locale: string;
  createdAt: string;
  images?: string[];
}

function relativeTime(iso: string, locale: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return L(locale, { ar: 'اليوم', en: 'Today', de: 'Today', ru: 'Сегодня', it: 'Oggi' }) as string;
  if (diff < 7 * day) {
    const n = Math.floor(diff / day);
    return L(locale, { ar: `قبل ${n} ${n === 1 ? 'يوم' : 'أيام'}`, en: `${n}d ago`, de: `${n}d ago`, ru: `${n} дн. назад`, it: `${n}g fa` }) as string;
  }
  return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en');
}

function Stars({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const px = size === 'lg' ? 'h-7 w-7' : size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${px} ${n <= value ? 'fill-accent text-accent' : 'fill-transparent text-accent/30'}`} />
      ))}
    </div>
  );
}

/**
 * Display-only block for company-wide reviews on trip detail pages.
 * Reviews are NOT trip-specific — every trip shows the same approved
 * company reviews. Users submit reviews only from the /review page.
 */
export function CompanyReviewsBlock({ locale }: { locale: string }) {
  const [items, setItems] = useState<CompanyReviewItem[]>([]);
  const [total, setTotal] = useState(0);
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  useEffect(() => {
    setLoading(true);
    api.get<{ items: CompanyReviewItem[]; total: number; average: number }>(`/public/reviews/company?limit=24`)
      .then((d) => {
        setItems(d.items || []);
        setTotal(d.total || 0);
        setAverage(d.average || 0);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const visibleItems = showAll ? items : items.slice(0, 4);

  const distribution = [5, 4, 3, 2, 1].map((s) => {
    const c = items.filter((r) => r.rating === s).length;
    return { s, c, pct: items.length ? Math.round((c / items.length) * 100) : 0 };
  });

  return (
    <div>
      <div className="inline-flex items-center gap-2.5 mb-3">
        <span className="block w-7 h-px bg-accent" />
        <span className="text-accent uppercase tracking-[0.25em] text-[10px] sm:text-[11px] font-bold">
          {L(locale, { ar: 'تقييمات عملائنا', en: 'Customer reviews', de: 'Customer reviews', ru: 'Отзывы клиентов', it: 'Recensioni clienti' })}
        </span>
      </div>
      <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-5 leading-tight text-balance">
        {L(locale, {
          ar: 'تجارب حقيقية من زوارنا',
          en: 'Real stories from our travelers', de: 'Real stories from our travelers',
          ru: 'Реальные истории наших путешественников',
          it: 'Storie vere dei nostri viaggiatori',
        })}
      </h2>

      {/* Summary card — display-only on trip pages (no CTA) */}
      <div className="grid md:grid-cols-[260px_1fr] gap-4 md:gap-6 bg-white rounded-2xl border border-accent/15 p-5 md:p-6 card-shadow">
        {/* Score */}
        <div className="md:border-e rtl:md:border-e-0 rtl:md:border-s md:border-accent/15 md:pe-6 rtl:md:pe-0 rtl:md:ps-6 flex flex-col items-center md:items-start text-center md:text-start">
          <div className="font-serif text-5xl md:text-6xl font-bold text-primary leading-none">{(average || 0).toFixed(1)}</div>
          <div className="mt-2"><Stars value={Math.round(average)} size="lg" /></div>
          <div className="text-sm text-muted-foreground mt-2 font-semibold">
            {L(locale, {
              ar: `${total} تقييم موثق`,
              en: `${total} verified review${total === 1 ? '' : 's'}`, de: `${total} verified review${total === 1 ? '' : 's'}`,
              ru: `${total} проверенных отзыв${total === 1 ? '' : total < 5 ? 'а' : 'ов'}`,
              it: `${total} recensione verificat${total === 1 ? 'a' : 'e'}`,
            })}
          </div>
        </div>

        {/* Distribution */}
        <div className="space-y-2 md:py-1">
          {distribution.map((d) => (
            <div key={d.s} className="flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1 text-foreground/70 w-7 tabular-nums">
                {d.s}<Star className="h-3 w-3 fill-accent text-accent" />
              </span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full gradient-gold transition-all duration-500" style={{ width: `${d.pct}%` }} />
              </div>
              <span className="w-9 text-end tabular-nums text-foreground/60">{d.c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews grid */}
      {loading ? (
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-accent/10 p-5 md:p-6 h-44 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-accent/15 mb-3" />
              <div className="h-3 w-32 bg-accent/15 rounded mb-2" />
              <div className="h-3 w-full bg-accent/10 rounded mb-1.5" />
              <div className="h-3 w-3/4 bg-accent/10 rounded" />
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {visibleItems.map((r) => (
              <article
                key={r.id}
                className="relative bg-white rounded-2xl border border-accent/15 p-5 md:p-6 card-shadow hover:card-shadow-gold hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
              >
                <Quote className="absolute top-3 end-3 h-7 w-7 text-accent/15 group-hover:text-accent/30 transition-colors" />

                <div className="flex items-center gap-3 mb-3">
                  <span className="w-11 h-11 rounded-full gradient-gold text-primary font-bold flex items-center justify-center font-serif text-lg shadow-md">
                    {r.customerName.trim().charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-primary leading-tight truncate break-words">{r.customerName}</div>
                    <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5 mt-0.5">
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-bold border border-emerald-500/25">
                        <svg className="h-2.5 w-2.5" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.2l-3.5-3.5a1 1 0 1 0-1.4 1.4l4.2 4.2c.4.4 1 .4 1.4 0l9-9a1 1 0 1 0-1.4-1.4L9 16.2z"/></svg>
                        {L(locale, { ar: 'موثق', en: 'verified', de: 'verified', ru: 'подтв.', it: 'verificato' })}
                      </span>
                      <span>·</span>
                      <span>{relativeTime(r.createdAt, locale)}</span>
                    </div>
                  </div>
                </div>

                <Stars value={r.rating} size="sm" />
                <p className="mt-2 text-foreground/85 leading-relaxed text-sm md:text-[15px] line-clamp-5 break-words [overflow-wrap:anywhere]">{r.comment}</p>

                {r.images && r.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-1.5">
                    {r.images.slice(0, 4).map((url, idx) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => setLightbox({ images: r.images!, index: idx })}
                        className="relative aspect-square rounded-lg overflow-hidden bg-muted group/img"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" loading="lazy" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300" />
                        {idx === 3 && r.images!.length > 4 && (
                          <div className="absolute inset-0 bg-primary-900/70 flex items-center justify-center text-cream text-sm font-bold">
                            +{r.images!.length - 4}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>

          {items.length > 4 && (
            <div className="mt-5 text-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAll((s) => !s)}
                className="border-accent/40 text-accent-700 hover:bg-accent/10 font-bold"
              >
                {showAll
                  ? (L(locale, { ar: 'عرض أقل', en: 'Show less', de: 'Weniger anzeigen', ru: 'Свернуть', it: 'Mostra meno' }) as string)
                  : (L(locale, {
                      ar: `عرض كل التقييمات (${items.length})`,
                      en: `View all reviews (${items.length})`, de: `View all reviews (${items.length})`,
                      ru: `Все отзывы (${items.length})`,
                      it: `Tutte le recensioni (${items.length})`,
                    }) as string)}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-accent/30 bg-white/50 p-8 text-center">
          <MessageSquareQuote className="h-10 w-10 text-accent/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {L(locale, {
              ar: 'لسه مفيش تقييمات بعد.',
              en: 'No reviews yet.', de: 'No reviews yet.',
              ru: 'Пока нет отзывов.',
              it: 'Nessuna recensione ancora.',
            })}
          </p>
        </div>
      )}

      {/* Image lightbox */}
      <ImageLightbox
        open={!!lightbox}
        images={lightbox?.images || []}
        startIndex={lightbox?.index || 0}
        onClose={() => setLightbox(null)}
      />
    </div>
  );
}
