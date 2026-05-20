'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { L } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, BadgeCheck, Calendar } from 'lucide-react';

export interface ReviewItem {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  locale: 'AR' | 'EN' | 'RU' | 'IT' | 'DE';
  createdAt: string;
  trip?: { slug: string; translations: { locale: string; title: string }[] } | null;
}

const AUTOPLAY_MS = 7000;

function relativeMonth(iso: string, locale: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : locale, { month: 'long', year: 'numeric' });
}

export function ReviewsCarousel({ reviews, locale }: { reviews: ReviewItem[]; locale: string }) {
  const [idx, setIdx] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [progress, setProgress] = useState(0);
  const isAr = locale === 'ar';
  const startedAt = useRef(Date.now());

  // Autoplay + progress tick
  useEffect(() => {
    if (!autoplay || reviews.length === 0) return;
    startedAt.current = Date.now();
    setProgress(0);
    const tick = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - startedAt.current) / AUTOPLAY_MS) * 100);
      setProgress(pct);
    }, 80);
    const adv = setTimeout(() => setIdx((i) => (i + 1) % reviews.length), AUTOPLAY_MS);
    return () => { clearInterval(tick); clearTimeout(adv); };
  }, [autoplay, idx, reviews.length]);

  // Reset progress on manual navigation
  const go = (n: number) => {
    setIdx(((n % reviews.length) + reviews.length) % reviews.length);
    startedAt.current = Date.now();
    setProgress(0);
  };

  // Build a strip of all reviewer initials for the "trusted by" row
  const trustStrip = useMemo(() => reviews.slice(0, 8), [reviews]);

  if (reviews.length === 0) return null;
  const r = reviews[idx];
  const tripTitle =
    r.trip?.translations.find((t) => t.locale === (L(locale, { ar: 'AR', en: 'EN', ru: 'RU', it: 'IT', de: 'DE' })))?.title ||
    r.trip?.translations[0]?.title;

  return (
    <div
      className="relative max-w-3xl mx-auto"
      onMouseEnter={() => setAutoplay(false)}
      onMouseLeave={() => setAutoplay(true)}
    >
      {/* Decorative gold corner frames */}
      <div aria-hidden className="absolute -top-2 -start-2 w-7 h-7 border-t-2 border-s-2 border-accent/40 rounded-tl-xl pointer-events-none" />
      <div aria-hidden className="absolute -top-2 -end-2 w-7 h-7 border-t-2 border-e-2 border-accent/40 rounded-tr-xl pointer-events-none" />
      <div aria-hidden className="absolute -bottom-2 -start-2 w-7 h-7 border-b-2 border-s-2 border-accent/40 rounded-bl-xl pointer-events-none" />
      <div aria-hidden className="absolute -bottom-2 -end-2 w-7 h-7 border-b-2 border-e-2 border-accent/40 rounded-br-xl pointer-events-none" />

      {/* ===== Main premium card ===== */}
      <div className="relative bg-gradient-to-br from-cream/8 via-cream/[0.04] to-cream/8 backdrop-blur-md border border-accent/25 rounded-2xl px-5 sm:px-8 md:px-12 lg:px-16 py-6 md:py-8 overflow-hidden">
        {/* Background ornaments */}
        <div aria-hidden className="absolute -top-12 -end-12 w-36 h-36 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute -bottom-16 -start-10 w-32 h-32 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        {/* Giant background quote */}
        <Quote
          aria-hidden
          className={`absolute top-3 ${isAr ? 'end-3' : 'start-3'} h-16 w-16 md:h-24 md:w-24 text-accent/10 pointer-events-none ${isAr ? 'scale-x-[-1]' : ''}`}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative text-center"
          >
            {/* Avatar */}
            <div className="relative inline-block mb-3">
              <span className="absolute inset-0 -m-1 rounded-full bg-gradient-to-br from-accent via-accent-400 to-accent-600 blur-sm opacity-50" />
              <span className="relative inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full gradient-gold text-primary font-bold font-serif text-lg md:text-2xl ring-[3px] ring-cream/15 shadow-lg">
                {r.customerName.trim().charAt(0).toUpperCase()}
              </span>
              <span
                className="absolute -bottom-1 -end-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary border-2 border-accent flex items-center justify-center shadow-md"
                title="Verified review"
              >
                <BadgeCheck className="h-3 w-3 md:h-3.5 md:w-3.5 text-accent" />
              </span>
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-0.5 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={
                    'h-4 w-4 md:h-5 md:w-5 transition-colors ' +
                    (i < r.rating
                      ? 'text-accent fill-accent drop-shadow-[0_0_4px_rgba(201,168,106,0.5)]'
                      : 'text-cream/15')
                  }
                />
              ))}
            </div>

            {/* Quote */}
            <p className="font-serif text-base sm:text-lg md:text-xl leading-relaxed mb-4 text-balance text-cream/95 max-w-xl mx-auto line-clamp-4 break-words [overflow-wrap:anywhere]">
              <span className="text-accent me-0.5">&ldquo;</span>
              {r.comment}
              <span className="text-accent ms-0.5">&rdquo;</span>
            </p>

            {/* Gold rule */}
            <span aria-hidden className="block w-10 h-0.5 mx-auto mb-2.5 rounded-full bg-gradient-to-r from-transparent via-accent to-transparent" />

            {/* Name + meta */}
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <span className="font-bold text-accent text-sm md:text-base break-words [overflow-wrap:anywhere]">{r.customerName}</span>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                <BadgeCheck className="h-2.5 w-2.5" />
                {L(locale, { ar: 'موثق', en: 'verified', de: 'verifiziert', ru: 'подтв.', it: 'verificato' })}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-cream/55">
                <Calendar className="h-2.5 w-2.5" />
                {relativeMonth(r.createdAt, locale)}
              </span>
              {tripTitle && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cream/8 border border-cream/15 text-[10px] text-cream/75 font-semibold">
                  <span className="text-accent">·</span>
                  {tripTitle}
                </span>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Desktop arrows (overlap card edges) */}
        {reviews.length > 1 && (
          <>
            <button
              onClick={() => go(idx - 1)}
              className="hidden md:inline-flex absolute start-2 lg:-start-4 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 items-center justify-center rounded-full bg-primary-900/80 backdrop-blur hover:bg-accent hover:text-primary text-cream transition-colors border border-accent/30 shadow-lg"
              aria-label="Previous review"
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </button>
            <button
              onClick={() => go(idx + 1)}
              className="hidden md:inline-flex absolute end-2 lg:-end-4 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 items-center justify-center rounded-full bg-primary-900/80 backdrop-blur hover:bg-accent hover:text-primary text-cream transition-colors border border-accent/30 shadow-lg"
              aria-label="Next review"
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          </>
        )}
      </div>

      {/* ===== Mobile-only nav row: big prev/next flanking dots ===== */}
      {reviews.length > 1 && (
        <div className="md:hidden flex items-center justify-between gap-3 mt-4 px-2">
          <button
            onClick={() => go(idx - 1)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent text-primary shadow-lg shadow-accent/30 active:scale-95 transition-transform"
            aria-label="Previous review"
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </button>

          {/* Dots strip (between arrows) */}
          <div className="flex items-center gap-1.5 flex-1 justify-center">
            {reviews.slice(0, Math.min(reviews.length, 6)).map((_, i) => {
              const active = i === idx;
              return (
                <button
                  key={i}
                  onClick={() => go(i)}
                  className={
                    'relative h-1.5 rounded-full transition-all overflow-hidden ' +
                    (active ? 'w-8 bg-cream/15' : 'w-1.5 bg-cream/25')
                  }
                  aria-label={`Review ${i + 1}`}
                >
                  {active && (
                    <span
                      className="absolute inset-y-0 start-0 bg-accent transition-[width] duration-100 ease-linear rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </button>
              );
            })}
            {reviews.length > 6 && (
              <span className="text-[10px] text-cream/40 ms-0.5">+{reviews.length - 6}</span>
            )}
          </div>

          <button
            onClick={() => go(idx + 1)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent text-primary shadow-lg shadow-accent/30 active:scale-95 transition-transform"
            aria-label="Next review"
          >
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>
        </div>
      )}

      {/* ===== Bottom info row: avatars + dots (desktop) + counter ===== */}
      <div className="flex items-center justify-between gap-3 mt-4 md:mt-5 px-2">
        {/* Avatar trust strip (LEFT) */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 rtl:space-x-reverse rtl:-space-x-reverse">
            {trustStrip.slice(0, 6).map((tr) => (
              <button
                key={tr.id}
                onClick={() => go(reviews.findIndex((rv) => rv.id === tr.id))}
                title={tr.customerName}
                className={
                  'relative w-7 h-7 md:w-8 md:h-8 rounded-full ring-2 ring-primary-800 transition-transform hover:scale-110 hover:z-10 ' +
                  (reviews[idx].id === tr.id ? 'z-10 ring-accent scale-110' : '')
                }
                aria-label={`Jump to ${tr.customerName}'s review`}
              >
                <span className="absolute inset-0 rounded-full gradient-gold flex items-center justify-center text-primary font-bold text-[10px] md:text-xs font-serif">
                  {tr.customerName.trim().charAt(0).toUpperCase()}
                </span>
              </button>
            ))}
          </div>
          <span className="text-[11px] md:text-xs text-cream/65 font-semibold">
            +{reviews.length}
          </span>
        </div>

        {/* Dots with progress (CENTER) — desktop only; mobile has its own row above */}
        <div className="hidden md:flex items-center gap-1.5">
          {reviews.slice(0, Math.min(reviews.length, 8)).map((_, i) => {
            const active = i === idx;
            return (
              <button
                key={i}
                onClick={() => go(i)}
                className={
                  'relative h-1 rounded-full transition-all overflow-hidden ' +
                  (active ? 'w-8 bg-cream/15' : 'w-1 bg-cream/25 hover:bg-cream/45')
                }
                aria-label={`Review ${i + 1}`}
              >
                {active && (
                  <span
                    className="absolute inset-y-0 start-0 bg-accent transition-[width] duration-100 ease-linear rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            );
          })}
          {reviews.length > 8 && (
            <span className="text-[9px] text-cream/40 ms-0.5">+{reviews.length - 8}</span>
          )}
        </div>

        {/* Counter (RIGHT) */}
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cream/55 tabular-nums tracking-wider uppercase">
          <span className="text-accent font-serif text-sm">{String(idx + 1).padStart(2, '0')}</span>
          <span className="text-cream/30">/</span>
          <span>{String(reviews.length).padStart(2, '0')}</span>
        </span>
      </div>
    </div>
  );
}
