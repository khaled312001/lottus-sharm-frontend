'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface LightboxItem {
  url: string;
  thumb?: string;
  alt?: string;
  type: 'IMAGE' | 'VIDEO';
}

interface LightboxProps {
  items: LightboxItem[];
  startIndex: number | null;
  onClose: () => void;
}

export function Lightbox({ items, startIndex, onClose }: LightboxProps) {
  const [idx, setIdx] = useState<number>(startIndex ?? 0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => { if (startIndex !== null) setIdx(startIndex); }, [startIndex]);

  // Body scroll lock + keyboard nav
  useEffect(() => {
    if (startIndex === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') setIdx((i) => (i - 1 + items.length) % items.length);
      else if (e.key === 'ArrowRight') setIdx((i) => (i + 1) % items.length);
    }
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [startIndex, items.length, onClose]);

  if (!mounted || startIndex === null || items.length === 0) return null;

  const current = items[idx];
  const next = () => setIdx((i) => (i + 1) % items.length);
  const prev = () => setIdx((i) => (i - 1 + items.length) % items.length);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  }
  function onTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.touches[0].clientX;
  }
  function onTouchEnd() {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const delta = touchEndX.current - touchStartX.current;
    const threshold = 50;
    if (Math.abs(delta) > threshold) {
      // RTL: swipe right (positive delta) goes to next (in visual order)
      if (delta > 0) prev();
      else next();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="lightbox"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 touch-pan-y"
        onClick={onClose}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Close */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-4 end-4 md:top-6 md:end-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Prev */}
        {items.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="hidden md:flex absolute start-4 md:start-6 w-12 h-12 rounded-full bg-white/10 hover:bg-accent hover:text-primary text-white items-center justify-center backdrop-blur-sm transition-all z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6 rtl:rotate-180" />
          </button>
        )}

        {/* Next */}
        {items.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="hidden md:flex absolute end-4 md:end-6 w-12 h-12 rounded-full bg-white/10 hover:bg-accent hover:text-primary text-white items-center justify-center backdrop-blur-sm transition-all z-10"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6 rtl:rotate-180" />
          </button>
        )}

        {/* Media */}
        <div className="relative w-full max-w-6xl aspect-[16/10] md:aspect-[3/2]" onClick={(e) => e.stopPropagation()}>
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              {current.type === 'VIDEO' ? (
                <video
                  src={current.url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain bg-black rounded-lg"
                />
              ) : (
                <Image
                  src={current.url}
                  alt={current.alt || ''}
                  fill
                  sizes="90vw"
                  className="object-contain"
                  priority
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Counter */}
        <div className="absolute bottom-4 md:bottom-6 inset-x-0 flex flex-col items-center gap-3 text-white pointer-events-none">
          <div className="text-sm font-medium px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm">
            {idx + 1} <span className="opacity-60">/</span> {items.length}
          </div>
          {/* Mobile arrows */}
          {items.length > 1 && (
            <div className="flex md:hidden items-center gap-3 pointer-events-auto">
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-sm"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
              </button>
              <span className="text-xs text-white/70 px-2">{idx + 1} / {items.length}</span>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-sm"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5 rtl:rotate-180" />
              </button>
            </div>
          )}
        </div>

        {/* Hint icon for videos in counter */}
        {current.type === 'VIDEO' && (
          <div className="hidden md:block absolute top-4 start-4 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs inline-flex items-center gap-1.5">
            <Play className="h-3 w-3 fill-current" /> Video
          </div>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
