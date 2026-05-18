'use client';

import { motion, useScroll, useTransform, type MotionProps } from 'framer-motion';
import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * Mobile / reduced-motion detector. Returns true when scroll animations should
 * be skipped — i.e. on small screens, on touch devices, or when the user has
 * `prefers-reduced-motion: reduce` set. Initial value is `true` so SSR renders
 * the unanimated version; we flip to `false` on the client only when we're
 * confident the device can handle the animation.
 */
function useSkipScrollAnimations(): boolean {
  const [skip, setSkip] = useState(true);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 1024px)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    setSkip(reducedMotion || isMobile || isCoarsePointer);
  }, []);
  return skip;
}

export const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

export const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.8 },
};

export const stagger = {
  initial: {},
  whileInView: {},
  viewport: { once: true, margin: '-50px' },
  transition: { staggerChildren: 0.1 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6, ease: 'easeOut' as const },
};

type RevealProps = ComponentProps<'div'> & { delay?: number; as?: 'div' | 'section' | 'article'; y?: number };

export function Reveal({ delay = 0, as = 'div', y = 30, className, children, ...props }: RevealProps) {
  const skip = useSkipScrollAnimations();

  // Mobile / reduced-motion / touch — render plain markup, no framer-motion.
  // This avoids the IntersectionObserver + transform paint cost that was
  // janking scroll on phones.
  if (skip) {
    const Tag = as;
    return <Tag className={className} {...(props as ComponentProps<'div'>)}>{children}</Tag>;
  }

  const MotionTag = (motion as unknown as Record<string, typeof motion.div>)[as] || motion.div;
  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...(props as MotionProps)}
    >
      {children}
    </MotionTag>
  );
}

export function ParallaxImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const skip = useSkipScrollAnimations();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);

  // Parallax is the heaviest scroll effect — disable entirely on mobile.
  if (skip) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div style={{ y }} className="absolute inset-0 -my-[15%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </motion.div>
    </div>
  );
}

export { motion };
