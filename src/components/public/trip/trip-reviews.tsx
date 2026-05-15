'use client';
import { useEffect, useState, useTransition } from 'react';
import { Star, Send, Quote } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { L, localeToApiCode } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { TripReviewDTO, ApiLocale } from '@/types/api';

function relativeTime(iso: string, locale: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return L(locale, { ar: 'اليوم', en: 'Today', ru: 'Сегодня', it: 'Oggi' });
  if (diff < 7 * day) {
    const n = Math.floor(diff / day);
    return L(locale, { ar: `قبل ${n} ${n === 1 ? 'يوم' : 'أيام'}`, en: `${n}d ago`, ru: `${n} дн. назад`, it: `${n}g fa` });
  }
  return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en');
}

function Stars({ value, onChange, size = 'md', interactive = false }: { value: number; onChange?: (v: number) => void; size?: 'sm' | 'md' | 'lg'; interactive?: boolean }) {
  const px = size === 'lg' ? 'h-7 w-7' : size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(n)}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
        >
          <Star className={`${px} ${n <= value ? 'fill-accent text-accent' : 'fill-transparent text-accent/30'}`} />
        </button>
      ))}
    </div>
  );
}

export function TripReviews({
  slug,
  locale,
  initialAverage = 0,
  initialCount = 0,
}: {
  slug: string;
  locale: string;
  initialAverage?: number;
  initialCount?: number;
}) {
  const apiLocale = localeToApiCode(locale) as ApiLocale;
  const [items, setItems] = useState<TripReviewDTO[]>([]);
  const [total, setTotal] = useState(initialCount);
  const [average, setAverage] = useState(initialAverage);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [pending, startTransition] = useTransition();

  const load = () => {
    api.get<{ items: TripReviewDTO[]; total: number; average: number }>(`/public/trips/${slug}/reviews`)
      .then((d) => { setItems(d.items); setTotal(d.total); setAverage(d.average); })
      .catch(() => undefined);
  };

  useEffect(() => { load(); }, [slug]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2 || comment.trim().length < 2) {
      toast.error(L(locale, { ar: 'أكمل الحقول من فضلك', en: 'Please complete the fields', ru: 'Заполните поля', it: 'Compila i campi' }));
      return;
    }
    startTransition(() => {
      api.post(`/public/trips/${slug}/reviews`, { customerName: name.trim(), rating, comment: comment.trim(), locale: apiLocale })
        .then(() => {
          toast.success(L(locale, {
            ar: 'شكراً! تقييمك قيد المراجعة',
            en: 'Thanks! Your review is being reviewed',
            ru: 'Спасибо! Отзыв на модерации',
            it: 'Grazie! La recensione è in revisione',
          }));
          setName(''); setComment(''); setRating(5); setShowForm(false);
        })
        .catch((e) => toast.error(e.message || 'Error'));
    });
  };

  const distribution = [5, 4, 3, 2, 1].map((s) => {
    const c = items.filter((r) => r.rating === s).length;
    return { s, c, pct: items.length ? Math.round((c / items.length) * 100) : 0 };
  });

  return (
    <div>
      <div className="inline-flex items-center gap-2.5 mb-3">
        <span className="block w-7 h-px bg-accent" />
        <span className="text-accent uppercase tracking-[0.25em] text-[10px] sm:text-[11px] font-bold">
          {L(locale, { ar: 'تقييمات المسافرين', en: 'Traveler reviews', ru: 'Отзывы путешественников', it: 'Recensioni dei viaggiatori' })}
        </span>
      </div>
      <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-5 leading-tight text-balance">
        {L(locale, { ar: 'ماذا قال زوارنا', en: 'What our guests are saying', ru: 'Что говорят гости', it: 'Cosa dicono i nostri ospiti' })}
      </h2>

      <div className="grid md:grid-cols-[280px_1fr] gap-4 md:gap-6 bg-white rounded-2xl border border-accent/15 p-5 md:p-6 card-shadow">
        {/* Summary */}
        <div className="md:border-e rtl:md:border-e-0 rtl:md:border-s md:border-accent/15 md:pe-6 rtl:md:pe-0 rtl:md:ps-6 flex flex-col items-center md:items-start text-center md:text-start">
          <div className="font-serif text-5xl md:text-6xl font-bold text-primary leading-none">{(average || 0).toFixed(1)}</div>
          <Stars value={Math.round(average)} size="lg" />
          <div className="text-sm text-muted-foreground mt-2">
            {L(locale, {
              ar: `${total} تقييم`,
              en: `${total} review${total === 1 ? '' : 's'}`,
              ru: `${total} отзыв${total === 1 ? '' : total < 5 ? 'а' : 'ов'}`,
              it: `${total} recensione${total === 1 ? '' : 'i'}`,
            })}
          </div>
          <Button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            className="mt-4 gradient-gold text-primary font-bold hover:opacity-90 w-full md:w-auto"
          >
            {showForm
              ? L(locale, { ar: 'إخفاء', en: 'Hide', ru: 'Скрыть', it: 'Nascondi' })
              : L(locale, { ar: 'اكتب تقييمك', en: 'Write a review', ru: 'Написать отзыв', it: 'Scrivi una recensione' })}
          </Button>
        </div>

        {/* Distribution */}
        <div className="space-y-2">
          {distribution.map((d) => (
            <div key={d.s} className="flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1 text-foreground/70 w-7 tabular-nums">
                {d.s}<Star className="h-3 w-3 fill-accent text-accent" />
              </span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full gradient-gold transition-all" style={{ width: `${d.pct}%` }} />
              </div>
              <span className="w-9 text-end tabular-nums text-foreground/60">{d.c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={submit} className="mt-4 bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/25 rounded-2xl p-5 md:p-6 space-y-4">
          <div className="grid sm:grid-cols-[1fr_auto] gap-3 sm:items-center">
            <input
              type="text"
              placeholder={L(locale, { ar: 'اسمك', en: 'Your name', ru: 'Ваше имя', it: 'Il tuo nome' })}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-accent/30 bg-white focus:outline-none focus:ring-2 focus:ring-accent/40"
              maxLength={120}
              required
            />
            <Stars value={rating} onChange={setRating} interactive size="md" />
          </div>
          <textarea
            placeholder={L(locale, { ar: 'شارك تجربتك...', en: 'Share your experience…', ru: 'Поделитесь впечатлениями…', it: 'Racconta la tua esperienza…' })}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={2000}
            className="w-full px-3 py-2.5 rounded-lg border border-accent/30 bg-white focus:outline-none focus:ring-2 focus:ring-accent/40 resize-y leading-relaxed"
            required
          />
          <Button type="submit" disabled={pending} className="gradient-gold text-primary font-bold hover:opacity-90">
            <Send className="h-4 w-4 me-1.5 rtl:rotate-180" />
            {pending
              ? L(locale, { ar: 'جاري الإرسال…', en: 'Sending…', ru: 'Отправка…', it: 'Invio…' })
              : L(locale, { ar: 'إرسال التقييم', en: 'Submit review', ru: 'Отправить', it: 'Invia recensione' })}
          </Button>
        </form>
      )}

      {/* Reviews list */}
      {items.length > 0 ? (
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {items.map((r) => (
            <article key={r.id} className="relative bg-white rounded-2xl border border-accent/15 p-5 md:p-6 card-shadow hover:card-shadow-gold transition-shadow">
              <Quote className="absolute top-3 end-3 h-7 w-7 text-accent/20" />
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-full gradient-gold text-primary font-bold flex items-center justify-center font-serif">
                  {r.customerName.trim().charAt(0).toUpperCase()}
                </span>
                <div>
                  <div className="font-bold text-primary leading-tight">{r.customerName}</div>
                  <div className="text-xs text-muted-foreground">{relativeTime(r.createdAt, locale)}</div>
                </div>
              </div>
              <Stars value={r.rating} size="sm" />
              <p className="mt-2 text-foreground/85 leading-relaxed text-sm md:text-[15px]">{r.comment}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 text-center text-sm text-muted-foreground py-6 bg-white/60 rounded-xl border border-dashed border-accent/30">
          {L(locale, { ar: 'لا توجد تقييمات بعد — كن أول من يقيّم!', en: 'No reviews yet — be the first to leave one!', ru: 'Пока нет отзывов — оставьте первый!', it: 'Ancora nessuna recensione — lascia la prima!' })}
        </div>
      )}
    </div>
  );
}
