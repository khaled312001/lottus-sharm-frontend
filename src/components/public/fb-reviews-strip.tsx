'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Star, ThumbsUp, Facebook, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { L, cn } from '@/lib/utils';

export interface FbReview {
  id: number;
  name: string;
  comment: string;
  dateText: string;
  recommends: boolean;
  rating: number;
  profileImage: string | null;
  attachedImages: string[];
}

export function FbReviewsStrip({ locale, reviews }: { locale: string; reviews: FbReview[] }) {
  const REVIEWS = reviews;
  // Duplicate the list 2x for a seamless transform-based loop (wrap by one set).
  const loop = REVIEWS.length > 0 ? [...REVIEWS, ...REVIEWS] : [];
  const trackRef = useRef<HTMLDivElement>(null);
  const [openImg, setOpenImg] = useState<string | null>(null);
  const offsetRef = useRef(0);              // current translateX in px (always <= 0)
  const pausedRef = useRef(false);          // pause while hovering / dragging
  const resumeAtRef = useRef(0);            // timestamp until which autoplay stays paused
  const pauseFor = (delay: number) => { resumeAtRef.current = performance.now() + delay; };

  // Continuous auto-scroll via transform:translateX (NOT scrollLeft — that is
  // unreliable in RTL containers and was why the strip sat still). We always
  // translate visually leftwards and wrap by one copy width for an infinite
  // closed loop. Direction-agnostic, GPU-friendly, works on mobile + laptop.
  useEffect(() => {
    if (REVIEWS.length === 0) return;
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    let last = performance.now();

    const apply = () => { el.style.transform = `translateX(${offsetRef.current}px)`; };

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64); last = now;
      const oneSet = el.scrollWidth / 2; // half = one copy of the list
      const free = !pausedRef.current && now >= resumeAtRef.current;
      if (free && oneSet > 0) {
        offsetRef.current -= (dt / 1000) * 40; // ~40px/s
        if (offsetRef.current <= -oneSet) offsetRef.current += oneSet;
        apply();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [REVIEWS.length]);

  // Wrap the offset back into [-oneSet, 0] so manual nudges loop forever.
  const wrap = () => {
    const el = trackRef.current;
    if (!el) return;
    const oneSet = el.scrollWidth / 2;
    if (oneSet <= 0) return;
    while (offsetRef.current <= -oneSet) offsetRef.current += oneSet;
    while (offsetRef.current > 0) offsetRef.current -= oneSet;
    el.style.transform = `translateX(${offsetRef.current}px)`;
  };

  // Pointer drag (mouse + touch): move the track directly, then resume autoplay.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let dragging = false;
    let startX = 0;
    let startOffset = 0;

    const onDown = (e: PointerEvent) => {
      pausedRef.current = true;
      dragging = true;
      startX = e.clientX;
      startOffset = offsetRef.current;
      el.style.cursor = 'grabbing';
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      offsetRef.current = startOffset + (e.clientX - startX);
      el.style.transform = `translateX(${offsetRef.current}px)`;
      wrap();
    };
    const end = () => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = 'grab';
      pausedRef.current = false;
      pauseFor(1200);
      wrap();
    };

    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', end);
      el.removeEventListener('pointercancel', end);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nudge = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    pauseFor(2500);
    el.style.transition = 'transform 0.4s ease';
    offsetRef.current += dir * -330; // arrow → advance one card in that direction
    el.style.transform = `translateX(${offsetRef.current}px)`;
    window.setTimeout(() => { el.style.transition = ''; wrap(); }, 420);
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
      <div
        className="relative"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; resumeAtRef.current = 0; }}
      >
        {/* Edge fades */}
        <div aria-hidden className="absolute inset-y-0 left-0 w-10 md:w-16 bg-gradient-to-r from-[#f0f2f5] to-transparent z-10 pointer-events-none" />
        <div aria-hidden className="absolute inset-y-0 right-0 w-10 md:w-16 bg-gradient-to-l from-[#f0f2f5] to-transparent z-10 pointer-events-none" />

        {/* Left arrow */}
        <button
          type="button"
          onClick={() => nudge(-1)}
          aria-label="Previous"
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-black/10 hover:bg-accent hover:text-primary hover:border-accent flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        {/* Right arrow */}
        <button
          type="button"
          onClick={() => nudge(1)}
          aria-label="Next"
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-black/10 hover:bg-accent hover:text-primary hover:border-accent flex items-center justify-center transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Viewport (clips) + transform track (moves). dir=ltr keeps the loop
            math identical across locales; card text uses dir=auto internally. */}
        <div className="overflow-hidden px-4 md:px-12 py-2" dir="ltr">
          <div
            ref={trackRef}
            className="flex gap-3 md:gap-4 w-max cursor-grab select-none will-change-transform"
            style={{ touchAction: 'pan-y' }}
          >
            {loop.map((r, idx) => (
              <FbReviewCard key={`${r.id}-${idx}`} review={r} locale={locale} onOpenImage={setOpenImg} />
            ))}
          </div>
        </div>
      </div>

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
