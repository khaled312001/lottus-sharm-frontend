'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Play, ZoomIn, ZoomOut } from 'lucide-react';
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
  const [zoom, setZoom] = useState(1);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const lastTap = useRef<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => { if (startIndex !== null) setIdx(startIndex); }, [startIndex]);

  // Reset zoom whenever the active slide changes
  useEffect(() => { setZoom(1); }, [idx]);

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
    // Only track single-finger swipes for navigation. Two-finger pinch is
    // handled natively by the browser since the image has touch-action: manipulation.
    if (e.touches.length !== 1 || zoom !== 1) {
      touchStartX.current = null;
      touchEndX.current = null;
      return;
    }
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (e.touches.length !== 1) {
      touchStartX.current = null;
      return;
    }
    touchEndX.current = e.touches[0].clientX;
  }
  function onTouchEnd() {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const delta = touchEndX.current - touchStartX.current;
    const threshold = 50;
    if (Math.abs(delta) > threshold && zoom === 1) {
      if (delta > 0) prev();
      else next();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  }

  function onImageTap() {
    const now = Date.now();
    if (now - lastTap.current < 320) {
      // Double tap → toggle zoom 1 ↔ 2.2
      setZoom((z) => (z > 1 ? 1 : 2.2));
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
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

        {/* Media — fills the viewport. Image uses its natural aspect ratio
            with object-contain and `touch-action: pinch-zoom` so users can
            pinch to zoom on mobile (and double-tap to toggle 2.2× zoom). */}
        <div
          className="absolute inset-0 flex items-center justify-center px-2 sm:px-6 pt-14 pb-24 sm:pb-20"
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.2 }}
              className="relative w-full h-full flex items-center justify-center overflow-auto"
            >
              {current.type === 'VIDEO' ? (
                <video
                  src={current.url}
                  controls
                  autoPlay
                  playsInline
                  className="max-w-full max-h-full object-contain bg-black"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={current.url}
                  alt={current.alt || ''}
                  onClick={onImageTap}
                  draggable={false}
                  style={{
                    transform: `scale(${zoom})`,
                    transition: 'transform 0.25s ease-out',
                    touchAction: zoom === 1 ? 'pinch-zoom' : 'auto',
                    cursor: zoom === 1 ? 'zoom-in' : 'zoom-out',
                    maxWidth: '100%',
                    maxHeight: '100%',
                  }}
                  className="object-contain select-none"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Zoom controls (images only) — fixed top-center so they don't fight the counter */}
        {current.type === 'IMAGE' && (
          <div className="absolute top-4 inset-x-0 flex justify-center pointer-events-none z-10">
            <div className="inline-flex items-center gap-1 px-1 py-1 rounded-full bg-white/10 backdrop-blur-sm pointer-events-auto">
              <button
                onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.max(1, +(z - 0.4).toFixed(2))); }}
                disabled={zoom <= 1}
                className="w-9 h-9 rounded-full hover:bg-white/15 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-[11px] text-white/80 px-2 tabular-nums min-w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.min(4, +(z + 0.4).toFixed(2))); }}
                disabled={zoom >= 4}
                className="w-9 h-9 rounded-full hover:bg-white/15 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Counter + mobile arrows */}
        <div className="absolute bottom-4 md:bottom-6 inset-x-0 flex flex-col items-center gap-3 text-white pointer-events-none">
          <div className="text-sm font-medium px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm">
            {idx + 1} <span className="opacity-60">/</span> {items.length}
          </div>
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
