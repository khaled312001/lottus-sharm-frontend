'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Menu, X, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './language-switcher';
import { Logo } from './logo';
import { cn } from '@/lib/utils';

export function Header() {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const transparent = isHome && !scrolled;

  const links: { href: '/' | '/trips' | '/about' | '/gallery' | '/blog' | '/contact'; label: string }[] = [
    { href: '/', label: t('home') },
    { href: '/trips', label: t('trips') },
    { href: '/about', label: t('about') },
    { href: '/gallery', label: t('gallery') },
    { href: '/blog', label: t('blog') },
    { href: '/contact', label: t('contact') },
  ];

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-500',
        transparent
          ? 'bg-transparent border-b border-transparent'
          : 'bg-cream/95 backdrop-blur-md border-b border-accent/15 shadow-[0_2px_30px_-12px_rgba(10,40,40,0.15)]',
      )}
    >
      <div className="container flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group">
          <Logo size={56} variant={transparent ? 'light' : 'dark'} />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-semibold transition-colors',
                  transparent ? 'text-cream/90 hover:text-accent' : 'text-primary/80 hover:text-primary',
                  active && (transparent ? 'text-accent' : 'text-primary'),
                )}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-2 right-2 -bottom-0.5 h-0.5 bg-accent rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="tel:+201090767278"
            className={cn(
              'hidden md:flex items-center gap-1.5 text-sm font-semibold transition-colors',
              transparent ? 'text-cream/90 hover:text-accent' : 'text-accent-600 hover:text-accent',
            )}
          >
            <Phone className="h-4 w-4" />
            <span dir="ltr">+20 109 076 7278</span>
          </a>
          <LanguageSwitcher transparent={transparent} />
          <Button
            asChild
            size="sm"
            className={cn(
              'hidden md:inline-flex transition-all',
              transparent
                ? 'bg-accent text-primary hover:bg-accent-400 shadow-lg shadow-accent/30'
                : 'bg-primary text-cream hover:bg-primary-700',
            )}
          >
            <Link href="/trips">{t('book')}</Link>
          </Button>
          <button
            onClick={() => setOpen(!open)}
            className={cn(
              'lg:hidden p-2 rounded-md transition-colors',
              transparent ? 'text-cream hover:bg-white/10' : 'text-primary hover:bg-muted',
            )}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-cream/98 backdrop-blur-md border-t border-accent/15 overflow-hidden"
          >
            <nav className="container flex flex-col py-4 gap-1">
              {links.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2.5 rounded-md text-sm font-semibold text-primary hover:bg-accent/10 hover:text-accent-700"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <Button asChild size="sm" className="mt-3 bg-primary text-cream">
                <Link href="/trips" onClick={() => setOpen(false)}>
                  {t('book')}
                </Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
