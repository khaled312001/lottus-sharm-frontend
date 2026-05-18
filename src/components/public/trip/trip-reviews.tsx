'use client';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Star, Send, Quote, Camera, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { API_BASE } from '@/lib/api';
import { L, localeToApiCode } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ImageLightbox } from '../image-lightbox';
import { AuthGate } from '../auth-gate';
import { useCustomer } from '@/lib/customer-auth';
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
  const { customer } = useCustomer();
  const [items, setItems] = useState<TripReviewDTO[]>([]);
  const [total, setTotal] = useState(initialCount);
  const [average, setAverage] = useState(initialAverage);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [pending, startTransition] = useTransition();

  // Auto-fill name from Google profile (kept editable as a fallback display)
  useEffect(() => {
    if (customer && !name) {
      // Prefer the Google display name; fall back to the local-part of the email
      const fromEmail = customer.email ? customer.email.split('@')[0].replace(/[._-]+/g, ' ') : '';
      setName(customer.name || fromEmail);
    }
  }, [customer, name]);
  // Image uploads
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    if (images.length + list.length > 6) {
      toast.error(L(locale, { ar: 'الحد الأقصى 6 صور', en: 'Max 6 images', ru: 'Максимум 6 фото', it: 'Massimo 6 foto' }));
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      list.forEach((f) => fd.append('files', f));
      const res = await fetch(`${API_BASE}/public/trips/${slug}/reviews/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Upload failed');
      setImages((prev) => [...prev, ...(data.data.urls as string[])]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (url: string) => setImages((prev) => prev.filter((u) => u !== url));

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
      api.post(`/public/trips/${slug}/reviews`, {
        customerName: name.trim(),
        rating,
        comment: comment.trim(),
        locale: apiLocale,
        images: images.length > 0 ? images : undefined,
      })
        .then(() => {
          toast.success(L(locale, {
            ar: 'شكراً! تقييمك قيد المراجعة',
            en: 'Thanks! Your review is being reviewed',
            ru: 'Спасибо! Отзыв на модерации',
            it: 'Grazie! La recensione è in revisione',
          }));
          setName(''); setComment(''); setRating(5); setImages([]); setShowForm(false);
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

      {/* Form — gated behind sign-in */}
      {showForm && (
        <div className="mt-4">
        <AuthGate reason="reviews">
        <form onSubmit={submit} className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/25 rounded-2xl p-5 md:p-6 space-y-4">
          {/* Signed-in profile chip + rating */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2.5 px-3 py-2 rounded-full bg-white border border-accent/30 shadow-sm">
              {customer?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={customer.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full gradient-gold text-primary font-bold text-xs">
                  {(customer?.name || name || '?').trim().charAt(0).toUpperCase()}
                </span>
              )}
              <div className="leading-tight">
                <div className="text-xs font-bold text-primary">{customer?.name || name}</div>
                {customer?.email && <div className="text-[10px] text-muted-foreground" dir="ltr">{customer.email}</div>}
              </div>
            </div>
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

          {/* Image upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-primary/70 uppercase tracking-wider">
                {L(locale, { ar: 'صور من الرحلة (اختياري)', en: 'Trip photos (optional)', ru: 'Фото поездки (опционально)', it: 'Foto del viaggio (opzionale)' })}
              </label>
              <span className="text-[10px] text-muted-foreground">
                {images.length}/6
              </span>
            </div>

            {/* Thumbnails grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-2">
                {images.map((url) => (
                  <div key={url} className="relative group aspect-square rounded-lg overflow-hidden bg-muted border border-accent/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      aria-label="Remove image"
                      className="absolute top-1 end-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-600 text-white shadow-md opacity-0 group-hover:opacity-100 hover:bg-rose-700 transition-opacity"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            {images.length < 6 && (
              <label className={`relative inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-all ${uploading ? 'border-accent bg-accent/10' : 'border-accent/30 hover:border-accent/60 hover:bg-accent/5'}`}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => e.target.files && uploadFiles(e.target.files)}
                />
                {uploading ? <Loader2 className="h-4 w-4 animate-spin text-accent" /> : <Camera className="h-4 w-4 text-accent-700" />}
                <span className="text-sm font-bold text-primary">
                  {uploading
                    ? L(locale, { ar: 'جاري الرفع...', en: 'Uploading...', ru: 'Загрузка...', it: 'Caricamento...' })
                    : L(locale, { ar: 'أضف صور للرحلة', en: 'Add trip photos', ru: 'Добавить фото', it: 'Aggiungi foto' })}
                </span>
              </label>
            )}
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {L(locale, {
                ar: 'JPG / PNG / WebP، حتى 10 ميجابايت لكل صورة',
                en: 'JPG / PNG / WebP, up to 10 MB each',
                ru: 'JPG / PNG / WebP, до 10 МБ каждое',
                it: 'JPG / PNG / WebP, fino a 10 MB ciascuna',
              })}
            </p>
          </div>

          <Button type="submit" disabled={pending || uploading} className="gradient-gold text-primary font-bold hover:opacity-90">
            <Send className="h-4 w-4 me-1.5 rtl:rotate-180" />
            {pending
              ? L(locale, { ar: 'جاري الإرسال…', en: 'Sending…', ru: 'Отправка…', it: 'Invio…' })
              : L(locale, { ar: 'إرسال التقييم', en: 'Submit review', ru: 'Отправить', it: 'Invia recensione' })}
          </Button>
        </form>
        </AuthGate>
        </div>
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
      ) : (
        <div className="mt-6 text-center text-sm text-muted-foreground py-6 bg-white/60 rounded-xl border border-dashed border-accent/30">
          {L(locale, { ar: 'لا توجد تقييمات بعد — كن أول من يقيّم!', en: 'No reviews yet — be the first to leave one!', ru: 'Пока нет отзывов — оставьте первый!', it: 'Ancora nessuna recensione — lascia la prima!' })}
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
