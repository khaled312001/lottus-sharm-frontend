'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { api, API_BASE } from '@/lib/api';
import { L, localeToApiCode } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Star, Loader2, CheckCircle2, Image as ImageIcon, Video as VideoIcon, X, Plus, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthGate } from './auth-gate';
import { useCustomer } from '@/lib/customer-auth';

interface UploadedMedia {
  url: string;
  type: 'image' | 'video';
}

const MAX_FILES = 6;

export function ReviewForm({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  const { customer } = useCustomer();
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-fill name from Google profile
  useEffect(() => {
    if (customer) {
      const fromEmail = customer.email ? customer.email.split('@')[0].replace(/[._-]+/g, ' ') : '';
      setName(customer.name || fromEmail);
    }
  }, [customer]);

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    if (media.length + list.length > MAX_FILES) {
      return toast.error(L(locale, {
        ar: `الحد الأقصى ${MAX_FILES} ملفات`,
        en: `Max ${MAX_FILES} files`,
        ru: `Максимум ${MAX_FILES} файлов`,
        it: `Massimo ${MAX_FILES} file`,
      }));
    }
    setUploading(true);
    try {
      const fd = new FormData();
      list.forEach((f) => fd.append('files', f));
      const res = await fetch(`${API_BASE}/public/reviews/company/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error?.message || 'Upload failed');
      const uploaded: UploadedMedia[] = (data.data.urls as string[]).map((url, i) => ({
        url,
        type: /\.(mp4|mov|webm|mkv|avi)$/i.test(url) || list[i]?.type?.startsWith('video/') ? 'video' : 'image',
      }));
      setMedia((prev) => [...prev, ...uploaded]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeMedia = (url: string) => setMedia((prev) => prev.filter((m) => m.url !== url));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      return toast.error(L(locale, { ar: 'أدخل اسمك من فضلك', en: 'Please enter your name', ru: 'Введите имя', it: 'Inserisci il nome' }));
    }
    if (comment.trim().length < 5) {
      return toast.error(L(locale, { ar: 'اكتب رأيك من فضلك', en: 'Please write your review', ru: 'Напишите отзыв', it: 'Scrivi la recensione' }));
    }

    setPending(true);
    try {
      await api.post('/public/reviews/company', {
        customerName: name.trim(),
        rating,
        comment: comment.trim(),
        locale: localeToApiCode(locale),
        images: media.length > 0 ? media.map((m) => m.url) : undefined,
      });
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally {
      setPending(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 mb-4">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="font-serif text-2xl font-bold mb-2 text-cream">
          {L(locale, { ar: 'شكراً لتقييمك! ❤', en: 'Thank you for your review! ❤', ru: 'Спасибо за отзыв! ❤', it: 'Grazie per la recensione! ❤' })}
        </h2>
        <p className="text-cream/75 text-sm leading-relaxed max-w-md mx-auto">
          {L(locale, {
            ar: 'تقييمك وصلنا وسيظهر على الموقع بعد المراجعة خلال 24 ساعة كحد أقصى.',
            en: 'Your review reached us and will appear on the site within 24 hours after approval.',
            ru: 'Отзыв получен и появится на сайте после модерации в течение 24 часов.',
            it: 'La recensione è arrivata e apparirà sul sito entro 24 ore dopo l\'approvazione.',
          })}
        </p>
      </div>
    );
  }

  return (
    <AuthGate reason="reviews">
    <form onSubmit={submit} className="space-y-5">
      {/* Star rating */}
      <div>
        <label className="block text-sm font-bold text-cream mb-3 text-center">
          {L(locale, { ar: 'كيف كانت تجربتك؟', en: 'How was your experience?', ru: 'Как ваш опыт?', it: 'Com\'è stata la tua esperienza?' })}
        </label>
        <div className="flex justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="p-1 transition-transform hover:scale-110 active:scale-95"
              aria-label={`${n} stars`}
            >
              <Star
                className={cn(
                  'h-9 w-9 md:h-10 md:w-10 transition-colors',
                  (hover || rating) >= n
                    ? 'fill-accent text-accent drop-shadow-[0_0_8px_rgba(201,168,106,0.5)]'
                    : 'fill-transparent text-cream/30',
                )}
              />
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-cream/55 mt-2 tabular-nums">{rating}/5</p>
      </div>

      {/* Signed-in profile chip (replaces the editable name field) */}
      <div>
        <label className="block text-sm font-bold text-cream mb-1.5">
          {L(locale, { ar: 'باسمك على جوجل', en: 'Posting as', ru: 'Публикуете как', it: 'Pubblichi come' })}
        </label>
        <div className="inline-flex items-center gap-3 px-3 py-2 rounded-xl bg-cream/8 border border-cream/20 backdrop-blur w-full">
          {customer?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={customer.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-accent/40" />
          ) : (
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full gradient-gold text-primary font-bold ring-2 ring-accent/40">
              {(customer?.name || name || '?').trim().charAt(0).toUpperCase()}
            </span>
          )}
          <div className="leading-tight min-w-0 flex-1">
            <div className="text-sm font-bold text-cream truncate">{customer?.name || name}</div>
            {customer?.email && <div className="text-[11px] text-cream/60 truncate" dir="ltr">{customer.email}</div>}
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-1 rounded-full shrink-0">
            <svg className="h-3 w-3" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.2l-3.5-3.5a1 1 0 1 0-1.4 1.4l4.2 4.2c.4.4 1 .4 1.4 0l9-9a1 1 0 1 0-1.4-1.4L9 16.2z"/></svg>
            {L(locale, { ar: 'موثق', en: 'verified', ru: 'подтв.', it: 'verificato' })}
          </span>
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-bold text-cream mb-1.5">
          {L(locale, { ar: 'تقييمك', en: 'Your review', ru: 'Ваш отзыв', it: 'La tua recensione' })}
          <span className="text-accent ms-1">*</span>
        </label>
        <Textarea
          rows={5}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          dir={isAr ? 'rtl' : 'ltr'}
          placeholder={L(locale, {
            ar: 'ما الذي أعجبك في رحلتك معنا؟ التنظيم، الدليل السياحي، الأنشطة...',
            en: 'What did you enjoy most about your trip with us?',
            ru: 'Что вам понравилось в путешествии?',
            it: 'Cosa ti è piaciuto del tuo viaggio?',
          })}
          maxLength={2000}
          className="bg-cream/8 border-cream/20 text-cream placeholder:text-cream/40"
        />
        <p className="text-[11px] text-cream/45 mt-1 text-end tabular-nums">{comment.length}/2000</p>
      </div>

      {/* Media upload */}
      <div>
        <label className="block text-sm font-bold text-cream mb-2">
          {L(locale, { ar: 'صور أو فيديوهات (اختياري)', en: 'Photos or videos (optional)', ru: 'Фото или видео (по желанию)', it: 'Foto o video (opzionale)' })}
          <span className="text-cream/45 ms-2 text-xs font-normal">
            {L(locale, { ar: `حتى ${MAX_FILES} ملفات`, en: `up to ${MAX_FILES} files`, ru: `до ${MAX_FILES}`, it: `fino a ${MAX_FILES}` })}
          </span>
        </label>

        {media.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
            {media.map((m) => (
              <div key={m.url} className="relative aspect-square rounded-lg overflow-hidden border border-cream/20 group">
                {m.type === 'video' ? (
                  <>
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video src={m.url} muted playsInline preload="metadata" className="w-full h-full object-cover bg-black" />
                    <span className="absolute top-1 start-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/70 text-white tracking-wider">VIDEO</span>
                  </>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(m.url)}
                  className="absolute top-1.5 end-1.5 p-1 rounded-full bg-red-600 text-white shadow ring-2 ring-white/70 hover:bg-red-700"
                  aria-label="حذف"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {media.length < MAX_FILES && (
          <label className="flex items-center justify-center gap-2 h-12 rounded-lg border-2 border-dashed border-cream/25 hover:border-accent/60 hover:bg-cream/5 cursor-pointer transition-colors text-cream/80 text-sm">
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => uploadFiles(e.target.files || [])}
              disabled={uploading}
            />
            {uploading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {L(locale, { ar: 'جاري الرفع...', en: 'Uploading...', ru: 'Загрузка...', it: 'Caricamento...' })}</>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <ImageIcon className="h-4 w-4 opacity-60" />
                <VideoIcon className="h-4 w-4 opacity-60" />
                <span>{L(locale, { ar: 'إضافة صور أو فيديوهات', en: 'Add photos or videos', ru: 'Добавить фото или видео', it: 'Aggiungi foto o video' })}</span>
              </>
            )}
          </label>
        )}
      </div>

      <button
        type="submit"
        disabled={pending || uploading}
        className={cn(
          'group relative w-full h-14 rounded-xl overflow-hidden font-bold text-base',
          'bg-gradient-to-br from-amber-300 via-accent to-accent-600',
          'text-primary shadow-2xl shadow-accent/40',
          'hover:shadow-accent/60 hover:-translate-y-0.5 active:translate-y-0',
          'border border-accent-400/60',
          'transition-all duration-200',
          (pending || uploading) && 'opacity-70 cursor-not-allowed hover:translate-y-0',
        )}
      >
        {/* Shimmer sweep */}
        <span aria-hidden className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700">
          <span className="block h-full w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </span>
        <span className="relative inline-flex items-center justify-center gap-2.5">
          {pending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {L(locale, { ar: 'جاري الإرسال...', en: 'Sending...', ru: 'Отправка...', it: 'Invio in corso...' })}
            </>
          ) : (
            <>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/15 group-hover:bg-primary/25 transition-colors">
                <Send className="h-3.5 w-3.5 rtl:rotate-180" />
              </span>
              <span>{L(locale, { ar: 'أرسل تقييمي', en: 'Submit my review', ru: 'Отправить отзыв', it: 'Invia recensione' })}</span>
              <Sparkles className="h-4 w-4 opacity-60 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
            </>
          )}
        </span>
      </button>
    </form>
    </AuthGate>
  );
}
