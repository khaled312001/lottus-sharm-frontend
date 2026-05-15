'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Menu, X, Phone, MessageCircle, Home, Map, Info, Image as ImageIcon, BookOpen, Mail, Sparkles } from 'lucide-react';
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

  type LinkHref = '/' | '/trips' | '/about' | '/gallery' | '/blog' | '/contact';
  const links: { href: LinkHref; label: string; icon: typeof Home }[] = [
    { href: '/',         label: t('home'),    icon: Home },
    { href: '/trips',    label: t('trips'),   icon: Map },
    { href: '/about',    label: t('about'),   icon: Info },
    { href: '/gallery',  label: t('gallery'), icon: ImageIcon },
    { href: '/blog',     label: t('blog'),    icon: BookOpen },
    { href: '/contact',  label: t('contact'), icon: Mail },
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
              'lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg transition-all',
              open
                ? 'bg-accent text-primary shadow-lg shadow-accent/25'
                : 'bg-cream/10 hover:bg-cream/15 text-cream border border-cream/15',
            )}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 top-16 md:top-20 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-gradient-to-b from-primary-900 to-primary-950 border-t border-accent/20 overflow-hidden relative z-50 shadow-2xl"
            >
              <nav className="container py-5 space-y-1">
                <div className="text-[10px] uppercase tracking-[0.25em] text-accent/80 font-bold px-3 mb-2">
                  ✦ القائمة
                </div>
                {links.map((l, i) => {
                  const active = pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href));
                  const Icon = l.icon;
                  return (
                    <motion.div
                      key={l.href}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-3.5 rounded-xl text-[15px] font-bold transition-all',
                          active
                            ? 'bg-accent text-primary shadow-lg shadow-accent/25'
                            : 'text-cream hover:bg-cream/10 hover:text-accent',
                        )}
                      >
                        <span className={cn(
                          'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
                          active ? 'bg-primary/10 text-primary' : 'bg-accent/15 text-accent',
                        )}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="flex-1">{l.label}</span>
                        {active && <Sparkles className="h-4 w-4 opacity-80" />}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Divider */}
                <div className="my-3 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

                {/* Contact */}
                <a
                  href="tel:+201090767278"
                  className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl bg-cream/5 hover:bg-cream/10 transition-colors group"
                >
                  <span className="flex items-center gap-3 text-cream">
                    <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent/15 text-accent">
                      <Phone className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold">اتصل بنا</span>
                  </span>
                  <span dir="ltr" className="text-accent text-sm font-bold tabular-nums">+20 109 076 7278</span>
                </a>

                <a
                  href="https://wa.me/201090767278"
                  target="_blank"
                  rel="noopener"
                  className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl bg-cream/5 hover:bg-cream/10 transition-colors"
                >
                  <span className="flex items-center gap-3 text-cream">
                    <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#25D366]/20 text-[#25D366]">
                      <MessageCircle className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold">واتساب</span>
                  </span>
                  <span className="text-[#25D366] text-xs font-bold opacity-80">رد فوري</span>
                </a>

                <Button
                  asChild
                  size="lg"
                  className="w-full mt-3 bg-accent text-primary font-extrabold shadow-lg shadow-accent/25 h-12 text-base"
                >
                  <Link href="/trips" onClick={() => setOpen(false)}>
                    <Sparkles className="h-4 w-4 me-1" />
                    {t('book')}
                  </Link>
                </Button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
