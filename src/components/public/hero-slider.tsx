'use client';

import { useEffect, useState, type MouseEvent as RMouseEvent } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Pause, Play } from 'lucide-react';

const SLIDES = Array.from({ length: 17 }, (_, i) => `/hero-slides/hero-${String(i + 1).padStart(2, '0')}.jpg`);

const SLIDE_DURATION = 5500;
const KEN_BURNS_DURATION = SLIDE_DURATION / 1000;

export function HeroSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, SLIDE_DURATION);
    return () => clearInterval(id);
  }, [paused]);

  const scrollNext = (e: RMouseEvent<HTMLButtonElement>) => {
    // Find the hero <section> this button lives in, then scroll to its sibling.
    const section = (e.currentTarget as HTMLElement).closest('section');
    let target = section?.nextElementSibling as HTMLElement | null;
    // Skip empty wrappers / display:none siblings
    while (target && (target.offsetParent === null || target.offsetHeight === 0)) {
      target = target.nextElementSibling as HTMLElement | null;
    }
    if (target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: (section?.offsetHeight || window.innerHeight) - 60, behavior: 'smooth' });
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 1.0 }}
          animate={{ opacity: 1, scale: 1.12 }}
          exit={{ opacity: 0, scale: 1.15 }}
          transition={{
            opacity: { duration: 1.6, ease: 'easeInOut' },
            scale: { duration: KEN_BURNS_DURATION + 1, ease: 'linear' },
          }}
          className="absolute inset-0"
        >
          <Image
            src={SLIDES[active]}
            alt=""
            fill
            priority={active === 0}
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-900/75 via-primary-900/60 to-primary-900/95 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-primary-900/70 via-primary-900/30 to-transparent z-10" />

      {/* Bottom interactive bar — scroll cue + slider dots + play/pause.
          z-30 to sit above any hero content overlay (which sits at z-20). */}
      <div className="absolute bottom-6 inset-x-0 z-30 flex flex-col items-center gap-2.5 pointer-events-none">
        {/* Scroll-down chevron (clickable) */}
        <button
          type="button"
          onClick={scrollNext}
          aria-label="Scroll to content"
          className="pointer-events-auto group inline-flex flex-col items-center gap-0.5 text-cream/70 hover:text-accent transition-colors"
        >
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
            مرر للأسفل
          </span>
          <span className="relative inline-flex items-center justify-center w-8 h-8 rounded-full border border-cream/30 group-hover:border-accent/60 group-hover:bg-cream/5 transition-all">
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </span>
        </button>

        {/* Clickable indicator dots + pause */}
        <div className="pointer-events-auto inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-900/40 backdrop-blur-sm border border-cream/10">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-cream/60 hover:text-accent transition-colors"
          >
            {paused ? <Play className="h-2.5 w-2.5 fill-current" /> : <Pause className="h-2.5 w-2.5 fill-current" />}
          </button>
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === active}
                className={
                  'group relative inline-flex items-center justify-center h-3 rounded-full transition-all duration-500 ' +
                  (i === active ? 'w-8' : 'w-3 hover:w-5')
                }
              >
                <span
                  className={
                    'block h-1 rounded-full transition-all duration-500 ' +
                    (i === active
                      ? 'w-full bg-accent shadow-[0_0_8px_rgba(201,168,106,0.6)]'
                      : 'w-1.5 bg-cream/40 group-hover:bg-cream/70 group-hover:w-3')
                  }
                />
                {/* Active progress bar fill (animates over slide duration) */}
                {i === active && !paused && (
                  <span
                    key={active}
                    aria-hidden
                    className="absolute inset-0 m-auto h-1 rounded-full bg-cream/80 mix-blend-overlay"
                    style={{ animation: `slide-progress ${SLIDE_DURATION}ms linear` }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Keyframes for active dot progress */}
      <style jsx>{`
        @keyframes slide-progress {
          from { transform: scaleX(0); transform-origin: left; }
          to { transform: scaleX(1); transform-origin: left; }
        }
      `}</style>
    </div>
  );
}
