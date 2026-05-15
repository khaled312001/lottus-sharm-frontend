'use client';

// Shared animation primitives used across the public site AND admin.
import { motion, useInView, useMotionValue, useSpring, useTransform, type Variants } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode, type ComponentProps, type ElementType } from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// 1. CountUp — animates a number from 0 to its target on mount
// ============================================================
export function CountUp({
  value, duration = 1.6, decimals = 0, prefix = '', suffix = '', className,
}: {
  value: number; duration?: number; decimals?: number; prefix?: string; suffix?: string; className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const t = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString('ar-EG');

  return <span ref={ref} className={cn('tabular-nums', className)}>{prefix}{formatted}{suffix}</span>;
}

// ============================================================
// 2. StaggerList — animates children in with a stagger delay
// ============================================================
const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export function StaggerList({
  as = 'div', className, children, once = true, margin = '-60px',
}: {
  as?: ElementType; className?: string; children: ReactNode; once?: boolean; margin?: string;
}) {
  const Tag = motion[as as keyof typeof motion] as typeof motion.div;
  return (
    <Tag
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: margin as never }}
      className={className}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({
  as = 'div', className, children,
}: { as?: ElementType; className?: string; children: ReactNode }) {
  const Tag = motion[as as keyof typeof motion] as typeof motion.div;
  return <Tag variants={staggerItem} className={className}>{children}</Tag>;
}

// ============================================================
// 3. HoverLift — small button/card hover that lifts + glows
// ============================================================
export function HoverLift({
  className, children, scale = 1.02, ...rest
}: ComponentProps<typeof motion.div> & { scale?: number }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// 4. Magnetic — pointer-tracking magnet effect (subtle)
// ============================================================
export function Magnetic({ children, className, strength = 0.25 }: { children: ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });
  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ x: sx, y: sy }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// 5. FadeInWhenVisible — wrapper, simpler than Reveal
// ============================================================
export function FadeInWhenVisible({
  delay = 0, y = 24, className, children,
}: { delay?: number; y?: number; className?: string; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// 6. PageTransition — admin route wrapper
// ============================================================
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// 7. ScrollProgress — top bar showing reading progress
// ============================================================
export function ScrollProgress({ className }: { className?: string }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    function onScroll() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const scaleX = useTransform(useSpring(useMotionValue(progress), { stiffness: 120, damping: 20 }), (p) => p / 100);
  return (
    <motion.div
      style={{ scaleX, transformOrigin: '0 0' }}
      className={cn('fixed top-0 inset-x-0 h-[3px] bg-gradient-to-r from-accent via-accent-400 to-accent z-[80] origin-left', className)}
    />
  );
}

export { motion };
