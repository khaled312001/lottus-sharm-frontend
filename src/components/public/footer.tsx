import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin, Code2, Star, ArrowRight, CreditCard } from 'lucide-react';
import { NewsletterForm } from './newsletter-form';
import { Logo } from './logo';
import { getLocalizedTagline } from '@/lib/site-settings';
import { L } from '@/lib/utils';
import type { SiteSettingsDTO } from '@/types/api';

export function Footer({ settings }: { settings: SiteSettingsDTO }) {
  const t = useTranslations();
  const locale = useLocale();
  const tagline = getLocalizedTagline(settings, locale);
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
          <p className="text-sm opacity-80 leading-relaxed mt-6 max-w-xs">{tagline}</p>
        </div>

        <div>
          <h3 className="font-serif text-lg mb-5 text-accent">{t('footer.quickLinks')}</h3>
          <ul className="space-y-2.5 text-sm">
            <li><FooterLink href="/">{t('nav.home')}</FooterLink></li>
            <li><FooterLink href="/trips">{t('nav.trips')}</FooterLink></li>
            <li><FooterLink href="/about">{t('nav.about')}</FooterLink></li>
            <li><FooterLink href="/gallery">{t('nav.gallery')}</FooterLink></li>
            <li><FooterLink href={'/review' as never}>{L(locale, { ar: 'التقييمات', en: 'Reviews', ru: 'Отзывы', it: 'Recensioni', de: 'Bewertungen' }) as string}</FooterLink></li>
            <li><FooterLink href="/blog">{t('nav.blog')}</FooterLink></li>
            <li><FooterLink href={'/qr-codes' as never}>{L(locale, { ar: 'رموز QR', en: 'QR codes', ru: 'QR-коды', it: 'Codici QR', de: 'QR-Codes' }) as string}</FooterLink></li>
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

          {/* Leave a review CTA — gold accent card so it stands out */}
          <Link
            href={'/review' as never}
            className="mt-6 flex items-center gap-3 rounded-2xl p-4 bg-gradient-to-br from-accent via-accent-deep to-accent text-primary font-bold shadow-lg shadow-accent/30 hover:shadow-accent/50 hover:-translate-y-0.5 transition-all group"
          >
            <div className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-accent">
              <Star className="h-5 w-5 fill-current" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-[0.15em] opacity-80">
                {L(locale, { ar: 'سافرت معنا قبل كده؟', en: 'Travelled with us?', de: 'Mit uns gereist?', ru: 'Путешествовали?', it: 'Hai viaggiato con noi?' })}
              </div>
              <div className="text-sm leading-tight font-extrabold">
                {L(locale, { ar: 'اترك تقييمك الآن', en: 'Leave your review', de: 'Hinterlassen Sie Ihre Bewertung', ru: 'Оставьте отзыв', it: 'Lascia una recensione' })}
              </div>
            </div>
            <ArrowRight className="h-4 w-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Payment methods strip — EasyCash installments */}
      <div className="relative border-t border-cream/10">
        <div aria-hidden className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="container py-5">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 sm:gap-4">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-cream/70 font-bold">
              <CreditCard className="h-3.5 w-3.5 text-accent" />
              {L(locale, {
                ar: 'وسائل الدفع المتاحة',
                en: 'Available payment options',
                de: 'Verfügbare Zahlungsoptionen',
                ru: 'Доступные способы оплаты',
                it: 'Opzioni di pagamento disponibili',
              })}
            </div>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-cream/95 border border-accent/30 shadow-md">
              <Image
                src="/logo-easycash.png"
                alt="EasyCash"
                width={48}
                height={48}
                className="h-10 w-10 object-contain"
              />
              <div className="text-start leading-tight">
                <div className="text-[10px] uppercase tracking-wider text-primary/70 font-bold">
                  {L(locale, { ar: 'الآن متاح', en: 'Now available', de: 'Jetzt verfügbar', ru: 'Теперь доступно', it: 'Ora disponibile' })}
                </div>
                <div className="text-sm font-extrabold text-primary">
                  {L(locale, {
                    ar: 'التقسيط عبر EasyCash',
                    en: 'Installments via EasyCash',
                    de: 'Ratenzahlung über EasyCash',
                    ru: 'Рассрочка через EasyCash',
                    it: 'Rate con EasyCash',
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar — copyright + legal links */}
      <div className="relative border-t border-cream/10">
        {/* Decorative gold line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            {/* Copyright */}
            <p className="text-cream/70 text-center md:text-start">
              © {year} <strong className="font-semibold text-accent">Lotus Sharm Travel</strong>
              <span className="hidden md:inline opacity-50"> · </span>
              <span className="block md:inline mt-0.5 md:mt-0 text-xs md:text-sm">{t('footer.rights')}</span>
            </p>

            {/* Legal links */}
            <nav aria-label="Legal" className="flex items-center gap-1 text-xs">
              <Link
                href="/privacy"
                className="px-3 py-1.5 rounded-md text-cream/70 hover:text-accent hover:bg-cream/5 transition-all"
              >
                {L(locale, { ar: 'سياسة الخصوصية', en: 'Privacy Policy', de: 'Datenschutzerklärung', ru: 'Конфиденциальность', it: 'Privacy' })}
              </Link>
              <span className="text-cream/30">•</span>
              <Link
                href="/terms"
                className="px-3 py-1.5 rounded-md text-cream/70 hover:text-accent hover:bg-cream/5 transition-all"
              >
                {L(locale, { ar: 'الشروط والأحكام', en: 'Terms of Service', de: 'Nutzungsbedingungen', ru: 'Условия использования', it: 'Termini' })}
              </Link>
              <span className="text-cream/30">•</span>
              <Link
                href="/cancellation-policy"
                className="px-3 py-1.5 rounded-md text-cream/70 hover:text-accent hover:bg-cream/5 transition-all"
              >
                {L(locale, { ar: 'سياسة الإلغاء', en: 'Cancellation', de: 'Stornierung', ru: 'Отмена', it: 'Cancellazione' })}
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Dedicated developer credit strip — Barmagly */}
      <div className="relative bg-primary-950 border-t border-accent/20">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <a
          href="http://barmagly.tech/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Barmagly — barmagly.tech"
          className="block group hover:bg-primary-950/60 transition-colors"
        >
          <div className="container py-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-cream/65 group-hover:text-cream/90 transition-colors">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-accent/15 border border-accent/30 text-accent group-hover:bg-accent group-hover:text-primary transition-all">
              <Code2 className="h-3.5 w-3.5" />
            </span>
            <span className="text-center">
              {L(locale, {
                ar: 'تم تطوير هذا الموقع بواسطة',
                en: 'This website was crafted by', de: 'Diese Website wurde erstellt von',
                ru: 'Этот сайт разработан компанией',
                it: 'Sito sviluppato da',
              })}
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold text-accent group-hover:text-accent-300 transition-colors">
              <span className="border-b border-accent/40 group-hover:border-accent transition-colors">
                {L(locale, { ar: 'شركة برمجلي', en: 'Barmagly Software', de: 'Barmagly Software', ru: 'Barmagly Software', it: 'Barmagly Software' })}
              </span>
              <span aria-hidden className="text-accent/80">↗</span>
            </span>
          </div>
        </a>
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
