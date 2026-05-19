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
  locale: 'AR' | 'EN' | 'RU' | 'IT';
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
    r.trip?.translations.find((t) => t.locale === (L(locale, { ar: 'AR', en: 'EN', ru: 'RU', it: 'IT' })))?.title ||
    r.trip?.translations[0]?.title;

  return (
    <div
      className="relative max-w-4xl mx-auto"
      onMouseEnter={() => setAutoplay(false)}
      onMouseLeave={() => setAutoplay(true)}
    >
      {/* Decorative gold corner frames */}
      <div aria-hidden className="absolute -top-3 -start-3 w-10 h-10 border-t-2 border-s-2 border-accent/40 rounded-tl-2xl pointer-events-none" />
      <div aria-hidden className="absolute -top-3 -end-3 w-10 h-10 border-t-2 border-e-2 border-accent/40 rounded-tr-2xl pointer-events-none" />
      <div aria-hidden className="absolute -bottom-3 -start-3 w-10 h-10 border-b-2 border-s-2 border-accent/40 rounded-bl-2xl pointer-events-none" />
      <div aria-hidden className="absolute -bottom-3 -end-3 w-10 h-10 border-b-2 border-e-2 border-accent/40 rounded-br-2xl pointer-events-none" />

      {/* ===== Main premium card ===== */}
      <div className="relative bg-gradient-to-br from-cream/8 via-cream/[0.04] to-cream/8 backdrop-blur-md border border-accent/25 rounded-2xl md:rounded-3xl px-6 sm:px-10 md:px-14 lg:px-20 py-8 md:py-12 overflow-hidden">
        {/* Background ornaments */}
        <div aria-hidden className="absolute -top-16 -end-16 w-48 h-48 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute -bottom-20 -start-12 w-44 h-44 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        {/* Giant background quote */}
        <Quote
          aria-hidden
          className={`absolute top-4 ${isAr ? 'end-4' : 'start-4'} h-24 w-24 md:h-32 md:w-32 text-accent/10 pointer-events-none ${isAr ? 'scale-x-[-1]' : ''}`}
        />

        {/* Mobile arrow row (above card body) */}
        <div className="md:hidden flex justify-between mb-2">
          <button
            onClick={() => go(idx - 1)}
            className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-cream/10 hover:bg-accent hover:text-primary text-cream transition-colors border border-cream/20"
            aria-label="Previous review"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </button>
          <button
            onClick={() => go(idx + 1)}
            className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-cream/10 hover:bg-accent hover:text-primary text-cream transition-colors border border-cream/20"
            aria-label="Next review"
          >
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative text-center"
          >
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <span className="absolute inset-0 -m-1 rounded-full bg-gradient-to-br from-accent via-accent-400 to-accent-600 blur-sm opacity-50" />
              <span className="relative inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full gradient-gold text-primary font-bold font-serif text-2xl md:text-3xl ring-4 ring-cream/15 shadow-xl">
                {r.customerName.trim().charAt(0).toUpperCase()}
              </span>
              {/* Verified badge */}
              <span
                className="absolute -bottom-1 -end-1 w-7 h-7 rounded-full bg-primary border-2 border-accent flex items-center justify-center shadow-lg"
                title="Verified review"
              >
                <BadgeCheck className="h-4 w-4 text-accent" />
              </span>
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-1 mb-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={
                    'h-5 w-5 md:h-6 md:w-6 transition-colors ' +
                    (i < r.rating
                      ? 'text-accent fill-accent drop-shadow-[0_0_6px_rgba(201,168,106,0.5)]'
                      : 'text-cream/15')
                  }
                />
              ))}
            </div>

            {/* Quote */}
            <p className="font-serif text-lg sm:text-xl md:text-2xl lg:text-[26px] leading-relaxed md:leading-[1.55] mb-6 text-balance text-cream/95 max-w-2xl mx-auto">
              <span className="text-accent text-2xl me-0.5">&ldquo;</span>
              {r.comment}
              <span className="text-accent text-2xl ms-0.5">&rdquo;</span>
            </p>

            {/* Gold rule */}
            <span aria-hidden className="block w-12 h-0.5 mx-auto mb-4 rounded-full bg-gradient-to-r from-transparent via-accent to-transparent" />

            {/* Name + meta */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
              <span className="font-bold text-accent text-base md:text-lg">{r.customerName}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                <BadgeCheck className="h-3 w-3" />
                {L(locale, { ar: 'موثق', en: 'verified', ru: 'подтв.', it: 'verificato' })}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-cream/55">
                <Calendar className="h-3 w-3" />
                {relativeMonth(r.createdAt, locale)}
              </span>
              {tripTitle && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cream/8 border border-cream/15 text-[11px] text-cream/75 font-semibold">
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
              className="hidden md:inline-flex absolute start-3 lg:-start-5 top-1/2 -translate-y-1/2 w-11 h-11 lg:w-12 lg:h-12 items-center justify-center rounded-full bg-primary-900/80 backdrop-blur hover:bg-accent hover:text-primary text-cream transition-colors border border-accent/30 shadow-xl"
              aria-label="Previous review"
            >
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
            </button>
            <button
              onClick={() => go(idx + 1)}
              className="hidden md:inline-flex absolute end-3 lg:-end-5 top-1/2 -translate-y-1/2 w-11 h-11 lg:w-12 lg:h-12 items-center justify-center rounded-full bg-primary-900/80 backdrop-blur hover:bg-accent hover:text-primary text-cream transition-colors border border-accent/30 shadow-xl"
              aria-label="Next review"
            >
              <ChevronRight className="h-5 w-5 rtl:rotate-180" />
            </button>
          </>
        )}
      </div>

      {/* ===== Controls below card ===== */}
      <div className="flex items-center justify-center gap-3 md:gap-5 mt-6 md:mt-8">
        {/* Counter */}
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-cream/55 tabular-nums tracking-wider uppercase">
          <span className="text-accent font-serif text-base">{String(idx + 1).padStart(2, '0')}</span>
          <span className="text-cream/30">/</span>
          <span>{String(reviews.length).padStart(2, '0')}</span>
        </span>

        {/* Dots (active one has progress bar) */}
        <div className="flex items-center gap-1.5">
          {reviews.slice(0, Math.min(reviews.length, 10)).map((_, i) => {
            const active = i === idx;
            return (
              <button
                key={i}
                onClick={() => go(i)}
                className={
                  'relative h-1.5 rounded-full transition-all overflow-hidden ' +
                  (active ? 'w-10 bg-cream/15' : 'w-1.5 bg-cream/25 hover:bg-cream/45')
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
          {reviews.length > 10 && (
            <span className="text-[10px] text-cream/40 ms-1">+{reviews.length - 10}</span>
          )}
        </div>

        {/* Autoplay indicator */}
        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-cream/45 font-bold">
          <span className={'h-1.5 w-1.5 rounded-full ' + (autoplay ? 'bg-emerald-400 animate-pulse' : 'bg-cream/30')} />
          {autoplay
            ? L(locale, { ar: 'تشغيل تلقائي', en: 'auto', ru: 'авто', it: 'auto' })
            : L(locale, { ar: 'متوقف', en: 'paused', ru: 'пауза', it: 'pausa' })}
        </span>
      </div>

      {/* ===== Trust strip — reviewer avatars ===== */}
      <div className="flex items-center justify-center gap-3 mt-7 md:mt-9">
        <div className="flex -space-x-2 rtl:space-x-reverse rtl:-space-x-reverse">
          {trustStrip.map((tr, i) => (
            <button
              key={tr.id}
              onClick={() => go(reviews.findIndex((rv) => rv.id === tr.id))}
              title={tr.customerName}
              className={
                'relative w-8 h-8 md:w-9 md:h-9 rounded-full ring-2 ring-primary-800 transition-transform hover:scale-110 hover:z-10 ' +
                (reviews[idx].id === tr.id ? 'z-10 ring-accent' : '')
              }
              aria-label={`Jump to ${tr.customerName}'s review`}
            >
              <span className="absolute inset-0 rounded-full gradient-gold flex items-center justify-center text-primary font-bold text-xs md:text-sm font-serif">
                {tr.customerName.trim().charAt(0).toUpperCase()}
              </span>
            </button>
          ))}
        </div>
        <span className="text-xs md:text-sm text-cream/70 font-semibold">
          {L(locale, {
            ar: `+ ${reviews.length} مسافر`,
            en: `+ ${reviews.length} travelers`,
            ru: `+ ${reviews.length} путешественников`,
            it: `+ ${reviews.length} viaggiatori`,
          })}
        </span>
      </div>
    </div>
  );
}
