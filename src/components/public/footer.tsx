import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin } from 'lucide-react';
import { NewsletterForm } from './newsletter-form';
import { Logo } from './logo';
import type { SiteSettingsDTO } from '@/types/api';

export function Footer({ settings }: { settings: SiteSettingsDTO }) {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-primary-800 text-cream mt-24 overflow-hidden">
      {/* Decorative gold orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent/8 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      {/* Gold accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="container relative py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <Logo size={80} variant="light" />
          <p className="text-sm opacity-80 leading-relaxed mt-6 max-w-xs">{settings.taglineAr}</p>
        </div>

        <div>
          <h3 className="font-serif text-lg mb-5 text-accent">{t('footer.quickLinks')}</h3>
          <ul className="space-y-2.5 text-sm">
            <li><FooterLink href="/">{t('nav.home')}</FooterLink></li>
            <li><FooterLink href="/trips">{t('nav.trips')}</FooterLink></li>
            <li><FooterLink href="/about">{t('nav.about')}</FooterLink></li>
            <li><FooterLink href="/gallery">{t('nav.gallery')}</FooterLink></li>
            <li><FooterLink href="/blog">{t('nav.blog')}</FooterLink></li>
            <li><FooterLink href="/contact">{t('nav.contact')}</FooterLink></li>
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-lg mb-5 text-accent">{t('footer.contactInfo')}</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <Phone className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />
              <a href={`tel:+${settings.whatsapp}`} dir="ltr" className="hover:text-accent transition-colors">+{settings.whatsapp.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4')}</a>
            </li>
            {settings.email && (
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-accent transition-colors">{settings.email}</a>
              </li>
            )}
            <li className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />
              <span>Sharm El Sheikh, Egypt</span>
            </li>
          </ul>
          <div className="flex gap-2 mt-5">
            {settings.facebookUrl && <SocialIcon href={settings.facebookUrl} label="Facebook"><Facebook className="h-4 w-4" /></SocialIcon>}
            {settings.instagramUrl && <SocialIcon href={settings.instagramUrl} label="Instagram"><Instagram className="h-4 w-4" /></SocialIcon>}
            {settings.youtubeUrl && <SocialIcon href={settings.youtubeUrl} label="YouTube"><Youtube className="h-4 w-4" /></SocialIcon>}
            {settings.tiktokUrl && (
              <SocialIcon href={settings.tiktokUrl} label="TikTok">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </SocialIcon>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-serif text-lg mb-5 text-accent">{t('footer.newsletter')}</h3>
          <p className="text-sm opacity-80 mb-4 leading-relaxed">{t('footer.newsletterDesc')}</p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-cream/10 relative">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-75">
          <p>© {year} <strong className="font-semibold text-accent">Lotus Sharm Travel</strong>. {t('footer.rights')}.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-accent transition-colors">Terms</Link>
            <span>
              Designed by <a href="https://barmagly.tech" target="_blank" rel="noopener" className="font-semibold hover:text-accent transition-colors">Barmagly</a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: '/' | '/trips' | '/about' | '/gallery' | '/blog' | '/contact'; children: React.ReactNode }) {
  return (
    <Link href={href} className="opacity-80 hover:opacity-100 hover:text-accent transition-all">
      {children}
    </Link>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={label}
      className="p-2.5 rounded-full bg-cream/5 border border-cream/10 hover:bg-accent hover:text-primary hover:border-accent transition-all duration-300"
    >
      {children}
    </a>
  );
}
