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
  const [autoplay, setAutoplay] = useState(true);
  const isAr = locale === 'ar';

  // Auto-scroll (mouse-friendly, pausable)
  useEffect(() => {
    if (!autoplay || REVIEWS.length === 0) return;
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last; last = now;
      const dir = isAr ? -1 : 1; // RTL scrolls right→left, LTR left→right
      el.scrollLeft += (dt / 32) * dir; // ~30px/s
      // Loop seam: when we cross the middle copy boundary, jump back invisibly
      const oneSet = el.scrollWidth / 3;
      if (el.scrollLeft >= oneSet * 2) el.scrollLeft -= oneSet;
      else if (el.scrollLeft <= 0) el.scrollLeft += oneSet;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoplay, isAr]);

  // Initialize scroll position to the middle copy so we can scroll both ways
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const oneSet = el.scrollWidth / 3;
    el.scrollLeft = oneSet;
  }, []);

  // Mouse / touch drag
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    const onDown = (e: PointerEvent) => {
      isDown = true;
      el.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startScroll = el.scrollLeft;
      setAutoplay(false);
      el.style.cursor = 'grabbing';
    };
    const onMove = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      el.scrollLeft = startScroll - dx;
    };
    const onUp = (e: PointerEvent) => {
      if (!isDown) return;
      isDown = false;
      try { el.releasePointerCapture(e.pointerId); } catch { /* */ }
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
              {L(locale, { ar: 'تقييمات فيسبوك', en: 'Facebook reviews', ru: 'Отзывы Facebook', it: 'Recensioni Facebook' })}
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary leading-tight">
              {L(locale, {
                ar: 'آراء حقيقية من زوار فيسبوك',
                en: 'Real Facebook reviews from our guests',
                ru: 'Реальные отзывы из Facebook',
                it: 'Recensioni reali da Facebook',
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
            {L(locale, { ar: 'افتح فيسبوك', en: 'Open Facebook', ru: 'Открыть Facebook', it: 'Apri Facebook' })}
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
        'shrink-0 w-[260px] sm:w-[300px] md:w-[320px] bg-white overflow-hidden flex flex-col h-fit',
        // FB-style: rounded-lg, very light border, layered shadow
        'rounded-lg border border-[#dadde1] shadow-[0_2px_4px_rgba(0,0,0,0.08)]',
        'hover:shadow-[0_4px_12px_rgba(24,119,242,0.15)] transition-shadow duration-200',
      )}
    >
      {/* Card header — FB style */}
      <header className="p-3 pb-2 flex items-start gap-2.5">
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
                {L(locale, { ar: 'يوصي', en: 'recommends', ru: 'реком.', it: 'consiglia' })}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Comment text — clamped FB-style */}
      <div className="px-3 pb-3 flex-1">
        <p className="text-[14px] leading-[1.43] text-[#050505] whitespace-pre-wrap line-clamp-5" dir="auto">
          {review.comment}
        </p>
      </div>

      {/* Attached images grid (compact) */}
      {hasImages && (
        <div className={cn(
          'grid gap-[2px] border-t border-[#dadde1]',
          review.attachedImages.length === 1 && 'grid-cols-1',
          review.attachedImages.length === 2 && 'grid-cols-2',
          review.attachedImages.length >= 3 && 'grid-cols-3',
        )}>
          {review.attachedImages.slice(0, 3).map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenImage(img); }}
              className="relative aspect-square overflow-hidden bg-[#f0f2f5] group"
              aria-label="Open photo"
            >
              <Image src={img} alt="" fill sizes="160px" className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
              {i === 2 && review.attachedImages.length > 3 && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-white font-bold text-lg">
                  +{review.attachedImages.length - 3}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Footer — only "View on Facebook" (Like removed) */}
      <footer className="px-3 py-2 border-t border-[#dadde1] text-[12px] flex items-center justify-end">
        <a
          href="https://www.facebook.com/profile.php?id=61550600242507&sk=reviews"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1877F2] font-semibold hover:underline inline-flex items-center gap-1.5"
        >
          <Facebook className="h-3.5 w-3.5" />
          {L(locale, { ar: 'عرض على فيسبوك', en: 'View on Facebook', ru: 'Открыть в Facebook', it: 'Apri su Facebook' })}
        </a>
      </footer>
    </article>
  );
}
