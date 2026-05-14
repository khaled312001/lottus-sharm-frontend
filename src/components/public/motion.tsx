'use client';

import { motion, useScroll, useTransform, type MotionProps } from 'framer-motion';
import { useRef, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';

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
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);
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
