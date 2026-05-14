'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

// 17 hero slides served as static assets via LiteSpeed (cached 7 days)
const SLIDES = Array.from({ length: 17 }, (_, i) => `/hero-slides/hero-${String(i + 1).padStart(2, '0')}.jpg`);

const SLIDE_DURATION = 5500; // ms per slide
const KEN_BURNS_DURATION = SLIDE_DURATION / 1000;

export function HeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, SLIDE_DURATION);
    return () => clearInterval(id);
  }, []);

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

      {/* Indicator dots */}
      <div className="absolute bottom-6 inset-x-0 flex justify-center gap-1.5 z-20 pointer-events-none">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={
              'h-1 rounded-full transition-all duration-500 ' +
              (i === active ? 'w-8 bg-accent' : 'w-1.5 bg-cream/40')
            }
          />
        ))}
      </div>
    </div>
  );
}
