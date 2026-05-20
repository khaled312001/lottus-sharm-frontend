'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Star, ThumbsUp, Facebook, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { L, cn } from '@/lib/utils';
import fbReviews from '@/data/fb-reviews.json';

interface FbReview {
  id: number;
  slug: string;
  name: string;
  comment: string;
  dateText: string;
  recommends: boolean;
  rating: number;
  profileImage: string | null;
  attachedImages: string[];
}

const REVIEWS = fbReviews as FbReview[];

export function FbReviewsStrip({ locale }: { locale: string }) {
  // Duplicate the list 3x for seamless autoplay (lots of room either side)
  const loop = REVIEWS.length > 0 ? [...REVIEWS, ...REVIEWS, ...REVIEWS] : [];
  const trackRef = useRef<HTMLDivElement>(null);
  const [openImg, setOpenImg] = useState<string | null>(null);
  const pausedRef = useRef(false); // pause flag (no effect restart)
  const isAr = locale === 'ar';
  const setAutoplay = (on: boolean) => { pausedRef.current = !on; };

  // Single continuous auto-scroll loop. Uses a ref pause flag so hovering /
  // dragging never tears down the rAF — guarantees it always resumes.
  useEffect(() => {
    if (REVIEWS.length === 0) return;
    const el = trackRef.current;
    if (!el) return;

    // Init at the middle copy once layout is measured
    let initialized = false;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64); last = now;
      const oneSet = el.scrollWidth / 3;
      if (oneSet > 0 && !initialized) {
        el.scrollLeft = oneSet;
        initialized = true;
      }
      if (!pausedRef.current && oneSet > 0) {
        const dir = isAr ? -1 : 1;
        el.scrollLeft += (dt / 28) * dir; // ~36px/s
      }
      // Seamless wrap
      if (oneSet > 0) {
        if (el.scrollLeft >= oneSet * 2) el.scrollLeft -= oneSet;
        else if (el.scrollLeft <= 0) el.scrollLeft += oneSet;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isAr]);

  // Mouse / touch drag — only engages after a 6px movement threshold so
  // simple clicks on images still fire normally (lightbox open).
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let armed = false;
    let dragging = false;
    let pointerId = -1;
    let startX = 0;
    let startScroll = 0;
    const DRAG_THRESHOLD = 6;

    const onDown = (e: PointerEvent) => {
      // Only left mouse button or touch / pen
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      armed = true;
      dragging = false;
      pointerId = e.pointerId;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      setAutoplay(false);
    };
    const onMove = (e: PointerEvent) => {
      if (!armed) return;
      const dx = e.clientX - startX;
      if (!dragging && Math.abs(dx) > DRAG_THRESHOLD) {
        dragging = true;
        try { el.setPointerCapture(pointerId); } catch { /* */ }
        el.style.cursor = 'grabbing';
      }
      if (dragging) {
        el.scrollLeft = startScroll - dx;
        e.preventDefault();
      }
    };
    const onUp = () => {
      if (dragging) {
        try { el.releasePointerCapture(pointerId); } catch { /* */ }
      }
      armed = false; dragging = false; pointerId = -1;
      el.style.cursor = 'grab';
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('pointerleave', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('pointerleave', onUp);
    };
  }, []);

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    setAutoplay(false);
    el.scrollBy({ left: dir * 360, behavior: 'smooth' });
    setTimeout(() => setAutoplay(true), 4000);
  };

  if (REVIEWS.length === 0) return null;

  return (
    <section className="relative py-12 md:py-16 bg-gradient-to-b from-[#f0f2f5] via-white to-[#f0f2f5] overflow-hidden">
      {/* Header */}
      <div className="container relative mb-6 md:mb-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1877F2] mb-1.5">
              <Facebook className="h-4 w-4" />
              {L(locale, { ar: 'تقييمات فيسبوك', en: 'Facebook reviews', ru: 'Отзывы Facebook', it: 'Recensioni Facebook', de: 'Facebook-Bewertungen' })}
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary leading-tight">
              {L(locale, {
                ar: 'آراء حقيقية من زوار فيسبوك',
                en: 'Real Facebook reviews from our guests',
                ru: 'Реальные отзывы из Facebook',
                it: 'Recensioni reali da Facebook',
                de: 'Echte Facebook-Bewertungen unserer Gäste',
              })}
            </h2>
          </div>
          <a
            href="https://www.facebook.com/profile.php?id=61550600242507&sk=reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1877F2] hover:bg-[#0e63d4] text-white font-bold text-sm transition-colors"
          >
            <Facebook className="h-4 w-4" />
            {L(locale, { ar: 'افتح فيسبوك', en: 'Open Facebook', ru: 'Открыть Facebook', it: 'Apri Facebook', de: 'Facebook öffnen' })}
          </a>
        </div>
      </div>

      {/* Scroller with arrows */}
      <div className="relative" onMouseEnter={() => setAutoplay(false)} onMouseLeave={() => setAutoplay(true)}>
        {/* Edge fades */}
        <div aria-hidden className="absolute inset-y-0 left-0 w-10 md:w-16 bg-gradient-to-r from-[#f0f2f5] to-transparent z-10 pointer-events-none" />
        <div aria-hidden className="absolute inset-y-0 right-0 w-10 md:w-16 bg-gradient-to-l from-[#f0f2f5] to-transparent z-10 pointer-events-none" />

        {/* Left arrow (in LTR scrolls back; in RTL scrolls forward) */}
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          aria-label="Previous"
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-black/10 hover:bg-accent hover:text-primary hover:border-accent flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        {/* Right arrow */}
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          aria-label="Next"
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-black/10 hover:bg-accent hover:text-primary hover:border-accent flex items-center justify-center transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={trackRef}
          className="flex gap-3 md:gap-4 overflow-x-auto fb-track px-4 md:px-12 py-2 cursor-grab select-none scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loop.map((r, idx) => (
            <FbReviewCard key={`${r.id}-${idx}`} review={r} locale={locale} onOpenImage={setOpenImg} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .fb-track::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Image lightbox — portaled to body so fixed positioning escapes any transform parent */}
      <FbImageLightbox src={openImg} onClose={() => setOpenImg(null)} />
    </section>
  );
}

function FbImageLightbox({ src, onClose }: { src: string | null; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Body scroll lock + ESC to close
  useEffect(() => {
    if (!src) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [src, onClose]);

  if (!src || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 end-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur"
      >
        <X className="h-5 w-5" />
      </button>
      <div
        className="relative w-full max-w-5xl max-h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="max-w-full max-h-[88vh] w-auto h-auto rounded-xl shadow-2xl object-contain"
        />
      </div>
    </div>,
    document.body,
  );
}

function FbReviewCard({ review, locale, onOpenImage }: { review: FbReview; locale: string; onOpenImage: (url: string) => void }) {
  const hasImages = review.attachedImages.length > 0;
  return (
    <article
      className={cn(
        // Uniform fixed height + width across all cards
        'shrink-0 w-[280px] sm:w-[300px] md:w-[320px] h-[400px] bg-white overflow-hidden flex flex-col',
        'rounded-xl border border-[#dadde1] shadow-[0_2px_6px_rgba(0,0,0,0.08)]',
        'hover:shadow-[0_6px_16px_rgba(24,119,242,0.18)] transition-shadow duration-200',
      )}
    >
      {/* Card header — FB style */}
      <header className="p-3 pb-2 flex items-start gap-2.5 shrink-0">
        <div className="shrink-0">
          {review.profileImage ? (
            <Image
              src={review.profileImage}
              alt={review.name}
              width={40}
              height={40}
              className="rounded-full object-cover border border-[#dadde1]"
              unoptimized
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1877F2] to-[#0e63d4] flex items-center justify-center text-white font-bold text-sm">
              {review.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-[#050505] text-[14px] leading-tight truncate hover:underline">{review.name}</div>
          <div className="flex items-center gap-1 text-[11px] text-[#65676B] mt-0.5">
            <span>{review.dateText}</span>
            <span aria-hidden>·</span>
            <Facebook className="h-3 w-3 text-[#1877F2]" />
          </div>
          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn('h-3 w-3', i < review.rating ? 'fill-[#F7B928] text-[#F7B928]' : 'text-gray-300')} />
            ))}
            {review.recommends && (
              <span className="ms-1 inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                <ThumbsUp className="h-2.5 w-2.5" />
                {L(locale, { ar: 'يوصي', en: 'recommends', ru: 'реком.', it: 'consiglia', de: 'empfiehlt' })}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Comment text — flex-1 fills remaining space, clamps gracefully */}
      <div className="px-3 pb-2 flex-1 min-h-0 overflow-hidden">
        <p
          className={cn(
            'text-[13.5px] leading-[1.45] text-[#050505] whitespace-pre-wrap',
            hasImages ? 'line-clamp-3' : 'line-clamp-[11]',
          )}
          dir="auto"
        >
          {review.comment}
        </p>
      </div>

      {/* Attached images — fixed-height row so card height stays uniform */}
      {hasImages && (
        <div className={cn(
          'grid gap-[2px] border-t border-[#dadde1] shrink-0 h-[96px]',
          review.attachedImages.length === 1 && 'grid-cols-1',
          review.attachedImages.length === 2 && 'grid-cols-2',
          review.attachedImages.length >= 3 && 'grid-cols-3',
        )}>
          {review.attachedImages.slice(0, 3).map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenImage(img); }}
              className="relative overflow-hidden bg-[#f0f2f5] group h-full"
              aria-label="Open photo"
            >
              <Image src={img} alt="" fill sizes="120px" className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
              {i === 2 && review.attachedImages.length > 3 && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-white font-bold text-lg">
                  +{review.attachedImages.length - 3}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Footer — only "View on Facebook" */}
      <footer className="px-3 py-2 border-t border-[#dadde1] text-[12px] flex items-center justify-end shrink-0">
        <a
          href="https://www.facebook.com/profile.php?id=61550600242507&sk=reviews"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1877F2] font-semibold hover:underline inline-flex items-center gap-1.5"
        >
          <Facebook className="h-3.5 w-3.5" />
          {L(locale, { ar: 'عرض على فيسبوك', en: 'View on Facebook', ru: 'Открыть в Facebook', it: 'Apri su Facebook', de: 'Auf Facebook ansehen' })}
        </a>
      </footer>
    </article>
  );
}
