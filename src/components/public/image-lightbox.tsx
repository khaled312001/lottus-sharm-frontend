'use client';

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
  images: string[];
  startIndex?: number;
  open: boolean;
  onClose: () => void;
  /** Optional title shown at the top */
  caption?: string;
}

/** Premium image viewer modal: arrow + keyboard nav, counter, zoom, download. */
export function ImageLightbox({ images, startIndex = 0, open, onClose, caption }: ImageLightboxProps) {
  const [index, setIndex] = useState(startIndex);
  const [zoom, setZoom] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [rtl, setRtl] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof document !== 'undefined') {
      setRtl(document.documentElement.dir === 'rtl' || document.documentElement.getAttribute('dir') === 'rtl');
    }
  }, []);
  useEffect(() => { if (open) setIndex(startIndex); }, [open, startIndex]);
  useEffect(() => { setZoom(1); }, [index]);

  const next = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length]);
  const zoomIn = () => setZoom((z) => Math.min(3, z + 0.25));
  const zoomOut = () => setZoom((z) => Math.max(0.5, z - 0.25));

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === '+' || e.key === '=') zoomIn();
      else if (e.key === '-') zoomOut();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open, next, prev, onClose]);

  const download = () => {
    const a = document.createElement('a');
    a.href = images[index];
    a.download = images[index].split('/').pop() || 'image';
    a.target = '_blank';
    a.click();
  };

  if (!mounted || !open || images.length === 0) return null;

  return createPortal(
    <div
      role="dialog"
      aria-label="Image viewer"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-primary-900/95 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-0 inset-x-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 z-10 bg-gradient-to-b from-primary-900/80 to-transparent"
      >
        {/* Counter + optional caption */}
        <div className="flex items-center gap-3 text-cream min-w-0">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-cream/15 border border-cream/20 backdrop-blur text-xs font-bold tabular-nums shrink-0">
            {index + 1} / {images.length}
          </span>
          {caption && (
            <span className="text-sm font-semibold opacity-90 truncate hidden sm:block">{caption}</span>
          )}
        </div>

        {/* Right action buttons */}
        <div className="flex items-center gap-1">
          <ToolBtn onClick={zoomOut} aria-label="Zoom out" disabled={zoom <= 0.5}><ZoomOut className="h-4 w-4" /></ToolBtn>
          <span className="inline-flex items-center px-2 text-[11px] font-mono text-cream/70 tabular-nums w-12 justify-center">
            {Math.round(zoom * 100)}%
          </span>
          <ToolBtn onClick={zoomIn} aria-label="Zoom in" disabled={zoom >= 3}><ZoomIn className="h-4 w-4" /></ToolBtn>
          <span className="w-px h-5 bg-cream/15 mx-1" />
          <ToolBtn onClick={download} aria-label="Download"><Download className="h-4 w-4" /></ToolBtn>
          <ToolBtn onClick={onClose} aria-label="Close" emphasis><X className="h-5 w-5" /></ToolBtn>
        </div>
      </div>

      {/* Prev / next — one arrow per side, matching the visual button position.
          Visually-LEFT button always shows ←, visually-RIGHT always shows →. */}
      {images.length > 1 && (
        <>
          <NavBtn side="start" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous">
            {rtl ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
          </NavBtn>
          <NavBtn side="end" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next">
            {rtl ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
          </NavBtn>
        </>
      )}

      {/* The image — uses the full viewport. Pinch-zoom is enabled via
          touch-action when zoom is at 1× so mobile users can spread to zoom. */}
      <div className="relative w-full h-full flex items-center justify-center overflow-auto" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index]}
          alt=""
          className="max-w-full max-h-full object-contain rounded-xl shadow-2xl select-none"
          style={{
            transform: `scale(${zoom})`,
            transition: 'transform 0.2s ease-out',
            touchAction: zoom === 1 ? 'pinch-zoom' : 'auto',
            cursor: zoom > 1 ? 'grab' : 'default',
            maxWidth: '95vw',
            maxHeight: '88vh',
          }}
          draggable={false}
        />
      </div>

      {/* Bottom thumbnail strip (only when 2+) */}
      {images.length > 1 && images.length <= 12 && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-3 sm:bottom-5 inset-x-0 px-4 z-10"
        >
          <div className="mx-auto inline-flex items-center gap-1.5 px-2 py-1.5 rounded-2xl bg-primary-900/80 backdrop-blur border border-cream/15 max-w-full overflow-x-auto">
            {images.map((url, i) => (
              <button
                key={url + i}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  'shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all',
                  i === index ? 'border-accent scale-110 shadow-md shadow-accent/40' : 'border-cream/15 opacity-60 hover:opacity-100',
                )}
                aria-label={`Go to image ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard hint */}
      <div className="absolute bottom-3 end-4 z-10 text-[10px] text-cream/45 hidden sm:flex items-center gap-2">
        <kbd className="px-1.5 py-0.5 rounded border border-cream/20 font-mono">←→</kbd>
        <kbd className="px-1.5 py-0.5 rounded border border-cream/20 font-mono">ESC</kbd>
      </div>
    </div>,
    document.body,
  );
}

function ToolBtn({
  children, onClick, disabled, emphasis,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  emphasis?: boolean;
  'aria-label'?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
        emphasis ? 'bg-cream/15 text-cream hover:bg-cream/25' : 'text-cream/80 hover:text-cream hover:bg-cream/10',
        disabled && 'opacity-30 cursor-not-allowed hover:bg-transparent',
      )}
    >
      {children}
    </button>
  );
}

function NavBtn({
  children, onClick, side,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  side: 'start' | 'end';
  'aria-label'?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'absolute top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-cream/10 hover:bg-cream/20 border border-cream/20 backdrop-blur text-cream transition-all hover:scale-110',
        side === 'start' ? 'start-3 sm:start-6' : 'end-3 sm:end-6',
      )}
    >
      {children}
    </button>
  );
}
