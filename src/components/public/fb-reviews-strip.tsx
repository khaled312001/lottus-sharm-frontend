'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Star, ThumbsUp, Facebook } from 'lucide-react';
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
  // Duplicate the list so the marquee loops seamlessly
  const items = [...REVIEWS, ...REVIEWS];
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const [openImg, setOpenImg] = useState<string | null>(null);

  if (REVIEWS.length === 0) return null;

  return (
    <section className="relative py-14 md:py-20 bg-gradient-to-b from-[#f0f2f5] via-white to-[#f0f2f5] overflow-hidden">
      {/* Header */}
      <div className="container relative mb-8 md:mb-10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#1877F2] mb-2">
              <Facebook className="h-4 w-4" />
              {L(locale, { ar: 'تقييمات فيسبوك', en: 'Facebook reviews', ru: 'Отзывы Facebook', it: 'Recensioni Facebook' })}
            </span>
            <h2 className="font-serif text-2xl md:text-4xl font-bold text-primary leading-tight">
              {L(locale, {
                ar: 'آراء حقيقية من زوار فيسبوك',
                en: 'Real Facebook reviews from our guests',
                ru: 'Реальные отзывы из Facebook',
                it: 'Recensioni reali da Facebook',
              })}
            </h2>
            <span className="block w-14 h-0.5 gradient-gold rounded-full mt-3" />
          </div>
          <a
            href="https://www.facebook.com/profile.php?id=61550600242507&sk=reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#0e63d4] text-white font-bold text-sm shadow-md shadow-[#1877F2]/30 transition-colors"
          >
            <Facebook className="h-4 w-4" />
            {L(locale, { ar: 'افتح فيسبوك', en: 'Open Facebook', ru: 'Открыть Facebook', it: 'Apri Facebook' })}
          </a>
        </div>
      </div>

      {/* Auto-scrolling marquee */}
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Edge fades */}
        <div aria-hidden className="absolute inset-y-0 left-0 w-12 md:w-24 bg-gradient-to-r from-[#f0f2f5] to-transparent z-10 pointer-events-none" />
        <div aria-hidden className="absolute inset-y-0 right-0 w-12 md:w-24 bg-gradient-to-l from-[#f0f2f5] to-transparent z-10 pointer-events-none" />

        <div
          ref={trackRef}
          className={cn('flex gap-4 md:gap-5 w-max fb-marquee', paused && 'fb-marquee-paused')}
        >
          {items.map((r, idx) => (
            <FbReviewCard key={`${r.id}-${idx}`} review={r} locale={locale} onOpenImage={setOpenImg} />
          ))}
        </div>
      </div>

      {/* Image lightbox */}
      {openImg && (
        <div
          className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setOpenImg(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={openImg} alt="" className="max-w-[95vw] max-h-[90vh] rounded-xl shadow-2xl" />
        </div>
      )}

      <style jsx>{`
        @keyframes fb-marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes fb-marquee-scroll-rtl {
          from { transform: translateX(0); }
          to   { transform: translateX(50%); }
        }
        .fb-marquee {
          animation: fb-marquee-scroll 80s linear infinite;
        }
        :global([dir='rtl']) .fb-marquee {
          animation-name: fb-marquee-scroll-rtl;
        }
        .fb-marquee-paused {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

function FbReviewCard({ review, locale, onOpenImage }: { review: FbReview; locale: string; onOpenImage: (url: string) => void }) {
  const hasImages = review.attachedImages.length > 0;
  return (
    <article className="shrink-0 w-[300px] sm:w-[340px] md:w-[380px] bg-white rounded-xl shadow-md border border-black/5 overflow-hidden flex flex-col">
      {/* Card header — FB style */}
      <header className="p-4 pb-3 flex items-start gap-3">
        <div className="shrink-0">
          {review.profileImage ? (
            <Image
              src={review.profileImage}
              alt={review.name}
              width={48}
              height={48}
              className="rounded-full object-cover border border-black/5"
              unoptimized
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1877F2] to-[#0e63d4] flex items-center justify-center text-white font-bold">
              {review.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-[#050505] text-[15px] leading-tight truncate">{review.name}</div>
          <div className="flex items-center gap-1 text-[12px] text-[#65676B] mt-0.5">
            <span>{review.dateText}</span>
            <span>·</span>
            <Facebook className="h-3 w-3 text-[#1877F2]" />
          </div>
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn('h-3.5 w-3.5', i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300')} />
            ))}
            {review.recommends && (
              <span className="ms-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <ThumbsUp className="h-3 w-3" />
                {L(locale, { ar: 'يوصي بـ', en: 'recommends', ru: 'рекомендует', it: 'consiglia' })}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Comment text */}
      <div className="px-4 pb-3 flex-1">
        <p className="text-[14px] leading-relaxed text-[#050505] whitespace-pre-wrap line-clamp-[10]" dir="auto">
          {review.comment}
        </p>
      </div>

      {/* Attached images grid (FB-style) */}
      {hasImages && (
        <div className={cn(
          'grid gap-0.5 border-t border-black/5',
          review.attachedImages.length === 1 && 'grid-cols-1',
          review.attachedImages.length === 2 && 'grid-cols-2',
          review.attachedImages.length >= 3 && 'grid-cols-3',
        )}>
          {review.attachedImages.slice(0, 6).map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => onOpenImage(img)}
              className="relative aspect-square overflow-hidden bg-muted group"
            >
              <Image src={img} alt="" fill sizes="200px" className="object-cover group-hover:scale-105 transition-transform" unoptimized />
              {i === 5 && review.attachedImages.length > 6 && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-white font-bold text-lg">
                  +{review.attachedImages.length - 6}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Footer with FB-style action row (informational, no real engagement) */}
      <footer className="px-4 py-2 border-t border-black/5 flex items-center justify-between text-[12px] text-[#65676B]">
        <span className="inline-flex items-center gap-1">
          <ThumbsUp className="h-3 w-3 text-[#1877F2] fill-[#1877F2]" />
          <span>{L(locale, { ar: 'إعجاب', en: 'Like', ru: 'Нравится', it: 'Mi piace' })}</span>
        </span>
        <a
          href="https://www.facebook.com/profile.php?id=61550600242507&sk=reviews"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1877F2] font-semibold hover:underline"
        >
          {L(locale, { ar: 'عرض على فيسبوك', en: 'View on Facebook', ru: 'Открыть в Facebook', it: 'Apri su Facebook' })}
        </a>
      </footer>
    </article>
  );
}
