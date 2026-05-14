'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Menu, X, Phone, MessageCircle } from 'lucide-react';
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

  // Transparent only on Home AND not scrolled AND menu closed
  const transparent = isHome && !scrolled && !open;

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
          : 'bg-primary-900/95 backdrop-blur-md border-b border-accent/15 shadow-[0_4px_30px_-12px_rgba(10,40,40,0.4)]',
      )}
    >
      {/* Announcement bar (desktop only, hidden on home when transparent for cleanliness) */}
      <div
        className={cn(
          'hidden md:block bg-primary-950 text-cream/85 text-xs border-b border-accent/20 transition-all',
          transparent ? 'h-0 opacity-0 overflow-hidden' : 'h-9 opacity-100',
        )}
      >
        <div className="container h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <a href="tel:+201090767278" className="inline-flex items-center gap-1.5 hover:text-accent transition-colors">
              <Phone className="h-3 w-3 text-accent" />
              <span dir="ltr">+20 109 076 7278</span>
            </a>
            <span className="hidden lg:inline opacity-50">|</span>
            <span className="hidden lg:inline text-accent font-medium">
              ✦ سياحة فاخرة منذ 2013
            </span>
          </div>
          <a
            href="https://wa.me/201090767278"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 text-[#25D366] hover:text-[#3df17a] transition-colors"
          >
            <MessageCircle className="h-3 w-3" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Main nav */}
      <div className="container flex h-16 md:h-20 items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <Logo size={48} />
          <div className="hidden sm:block leading-none">
            <div className={cn('font-serif text-base md:text-lg font-bold tracking-wide transition-colors', transparent ? 'text-cream' : 'text-cream')}>
              LOTUS SHARM
            </div>
            <div className={cn('text-[10px] tracking-[0.3em] font-light mt-0.5 transition-colors', transparent ? 'text-cream/80' : 'text-accent')}>
              TRAVEL
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'relative px-3 xl:px-4 py-2 text-sm font-semibold transition-colors',
                  transparent ? 'text-cream/90 hover:text-accent' : 'text-cream/80 hover:text-accent',
                  active && 'text-accent',
                )}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-3 right-3 -bottom-0.5 h-0.5 bg-accent rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher transparent={transparent} compact />
          <Button
            asChild
            size="sm"
            className="hidden md:inline-flex bg-accent text-primary hover:bg-accent-400 font-bold shadow-lg shadow-accent/20"
          >
            <Link href="/trips">{t('book')}</Link>
          </Button>
          <button
            onClick={() => setOpen(!open)}
            className={cn(
              'lg:hidden p-2 rounded-md transition-colors',
              'text-cream hover:bg-cream/10',
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
            className="lg:hidden bg-primary-900 border-t border-accent/15 overflow-hidden"
          >
            <nav className="container flex flex-col py-4 gap-1">
              {links.map((l, i) => {
                const active = pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href));
                return (
                  <motion.div
                    key={l.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'block px-3 py-3 rounded-md text-sm font-semibold transition-colors',
                        active
                          ? 'bg-accent/15 text-accent'
                          : 'text-cream/85 hover:bg-accent/10 hover:text-accent',
                      )}
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                );
              })}
              <a
                href="tel:+201090767278"
                className="flex items-center gap-2 px-3 py-3 mt-2 text-accent border border-accent/30 rounded-md text-sm font-semibold"
              >
                <Phone className="h-4 w-4" />
                <span dir="ltr">+20 109 076 7278</span>
              </a>
              <Button asChild size="lg" className="mt-2 bg-accent text-primary font-bold">
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
