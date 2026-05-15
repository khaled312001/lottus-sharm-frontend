'use client';

import { useEffect, useRef, useState } from 'react';
import { L } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

export interface ReviewItem {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  locale: 'AR' | 'EN' | 'RU' | 'IT';
  createdAt: string;
  trip?: { slug: string; translations: { locale: string; title: string }[] } | null;
}

export function ReviewsCarousel({ reviews, locale }: { reviews: ReviewItem[]; locale: string }) {
  const [idx, setIdx] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const isAr = locale === 'ar';
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoplay || reviews.length === 0) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % reviews.length), 6000);
    return () => clearInterval(id);
  }, [autoplay, reviews.length]);

  if (reviews.length === 0) return null;
  const r = reviews[idx];
  const tripTitle = r.trip?.translations.find((t) => t.locale === (L(locale, { ar: 'AR', en: 'EN' })))?.title
    || r.trip?.translations[0]?.title;

  return (
    <div className="relative max-w-4xl mx-auto" ref={containerRef}
      onMouseEnter={() => setAutoplay(false)}
      onMouseLeave={() => setAutoplay(true)}>
      <div className="relative min-h-[280px] md:min-h-[260px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Quote className="h-10 w-10 md:h-12 md:w-12 text-accent mx-auto mb-5 opacity-90" />
            <div className="flex justify-center gap-1 mb-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={'h-5 w-5 ' + (i < r.rating ? 'text-accent fill-accent' : 'text-cream/20')} />
              ))}
            </div>
            <p className="font-serif text-lg md:text-2xl leading-relaxed mb-6 text-balance px-4">
              &ldquo;{r.comment}&rdquo;
            </p>
            <div className="font-bold text-accent text-sm md:text-base">
              — {r.customerName}
            </div>
            {tripTitle && (
              <div className="text-xs text-cream/60 mt-1.5">
                {L(locale, { ar: 'عن رحلة', en: 'about', ru: 'о туре', it: 'su tour' })} <span className="text-accent/80">{tripTitle}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* dots */}
      <div className="flex justify-center gap-1.5 mt-6">
        {reviews.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={
              'h-1.5 rounded-full transition-all ' +
              (i === idx ? 'w-8 bg-accent' : 'w-1.5 bg-cream/30 hover:bg-cream/50')
            }
            aria-label={`Review ${i + 1}`}
          />
        ))}
      </div>

      {/* arrows */}
      {reviews.length > 1 && (
        <>
          <button
            onClick={() => setIdx((i) => (i - 1 + reviews.length) % reviews.length)}
            className="hidden md:flex absolute start-0 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-cream/10 hover:bg-accent hover:text-primary text-cream transition-colors border border-cream/20"
            aria-label="Previous review"
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
          <button
            onClick={() => setIdx((i) => (i + 1) % reviews.length)}
            className="hidden md:flex absolute end-0 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-cream/10 hover:bg-accent hover:text-primary text-cream transition-colors border border-cream/20"
            aria-label="Next review"
          >
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>
        </>
      )}
    </div>
  );
}
