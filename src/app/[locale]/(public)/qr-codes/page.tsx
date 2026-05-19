import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Star, Map, Globe, Download, ArrowRight } from 'lucide-react';
import { L } from '@/lib/utils';
import { Reveal } from '@/components/public/motion';

export const dynamic = 'force-static';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const title = L(locale, {
    ar: 'رموز QR — لوتس شرم للسياحة',
    en: 'QR Codes — Lotus Sharm Tourism',
    ru: 'QR-коды — Lotus Sharm',
    it: 'Codici QR — Lotus Sharm Tourism',
  });
  const description = L(locale, {
    ar: 'حمّل رموز QR للموقع وصفحة الرحلات وصفحة التقييم.',
    en: 'Download QR codes for the website, trips page, and review page.',
    ru: 'Скачайте QR-коды для сайта, страницы туров и отзывов.',
    it: 'Scarica i codici QR per il sito, i tour e le recensioni.',
  });
  return { title, description };
}

export default async function QrCodesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const qrs: Array<{
    file: string;
    href: string;
    icon: typeof Star;
    accent: string;
    title: { ar: string; en: string; ru: string; it: string };
    desc: { ar: string; en: string; ru: string; it: string };
  }> = [
    {
      file: '/site-qr.png',
      href: 'https://lotussharm.com',
      icon: Globe,
      accent: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
      title: { ar: 'الموقع الرئيسي', en: 'Main website', ru: 'Главный сайт', it: 'Sito principale' },
      desc: {
        ar: 'يفتح صفحة لوتس شرم الرئيسية. مناسب للكروت والإعلانات.',
        en: 'Opens the Lotus Sharm homepage. Great for cards and print.',
        ru: 'Открывает главную страницу Lotus Sharm. Подходит для визиток.',
        it: 'Apre la home di Lotus Sharm. Ideale per biglietti e stampa.',
      },
    },
    {
      file: '/trips-qr.png',
      href: 'https://lotussharm.com/ar/trips',
      icon: Map,
      accent: 'from-blue-500/20 via-blue-500/10 to-transparent',
      title: { ar: 'قائمة الرحلات', en: 'Trips listing', ru: 'Список туров', it: 'Lista tour' },
      desc: {
        ar: 'يفتح صفحة كل الرحلات المتاحة. ممتاز لاستخدامه في الفنادق.',
        en: 'Opens the full trips listing. Great for hotel counters.',
        ru: 'Открывает список всех туров. Идеально для стоек отелей.',
        it: 'Apre la lista completa dei tour. Ottimo per i banchi hotel.',
      },
    },
    {
      file: '/review-qr.png',
      href: 'https://lotussharm.com/ar/review',
      icon: Star,
      accent: 'from-amber-500/20 via-amber-500/10 to-transparent',
      title: { ar: 'صفحة التقييم', en: 'Review page', ru: 'Страница отзыва', it: 'Pagina recensione' },
      desc: {
        ar: 'ابعته للضيوف بعد الرحلة عشان يدخلوا ويتركوا تقييم.',
        en: 'Send to guests after their trip to leave a review.',
        ru: 'Отправьте гостям после поездки для отзыва.',
        it: 'Inviate agli ospiti dopo il viaggio per una recensione.',
      },
    },
  ];

  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary to-primary-900 text-cream py-14 md:py-20 overflow-hidden">
        <div aria-hidden className="absolute -top-32 -end-32 w-96 h-96 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div className="container relative">
          <Reveal>
            <span className="eyebrow">
              {L(locale, { ar: 'رموز QR', en: 'QR Codes', ru: 'QR-коды', it: 'Codici QR' })}
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-bold mb-3 leading-tight">
              {L(locale, {
                ar: 'امسح وافتح صفحات لوتس شرم فوراً',
                en: 'Scan to open Lotus Sharm in seconds',
                ru: 'Сканируйте и открывайте Lotus Sharm',
                it: 'Scansiona e apri Lotus Sharm',
              })}
            </h1>
            <div className="w-16 h-0.5 gradient-gold rounded-full mb-4" />
            <p className="text-cream/80 max-w-2xl text-sm md:text-base">
              {L(locale, {
                ar: 'حمّل أي رمز واطبعه على كروت العمل، بنرات الفنادق، أو شيرها مباشرة مع الضيوف.',
                en: 'Download any code and print on business cards, hotel banners, or share with guests directly.',
                ru: 'Скачайте любой код для печати на визитках, баннерах в отелях или для отправки гостям.',
                it: 'Scarica qualsiasi codice per stamparlo su biglietti, banner hotel o condividerlo con gli ospiti.',
              })}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {qrs.map((q, i) => {
            const Icon = q.icon;
            return (
              <Reveal key={q.file} delay={i * 0.08}>
                <div className="relative bg-white rounded-2xl border border-accent/15 overflow-hidden hover:border-accent/40 hover:shadow-xl transition-all flex flex-col group">
                  <div className={`absolute -top-20 -end-20 w-44 h-44 rounded-full bg-gradient-to-br ${q.accent} blur-3xl pointer-events-none`} />
                  <div className="relative p-5 pb-3 flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-accent/15 text-accent-700 border border-accent/25">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-serif text-lg font-bold text-primary leading-tight">{L(locale, q.title)}</h2>
                      <a href={q.href} target="_blank" rel="noopener noreferrer" className="text-[11px] text-muted-foreground hover:text-accent-700 truncate inline-block max-w-full" dir="ltr">
                        {q.href.replace('https://', '')}
                      </a>
                    </div>
                  </div>
                  <div className="relative p-5 pt-2 flex items-center justify-center bg-cream/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <Image
                      src={`${q.file}?v=2`}
                      alt={L(locale, q.title) as string}
                      width={260}
                      height={260}
                      className="rounded-xl border border-accent/15 bg-white p-2 group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </div>
                  <div className="relative p-5 pt-3 flex-1 flex flex-col">
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">{L(locale, q.desc)}</p>
                    <div className="flex gap-2">
                      <a
                        href={q.file}
                        download
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-cream font-bold text-xs hover:bg-primary-900 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {L(locale, { ar: 'تحميل', en: 'Download', ru: 'Скачать', it: 'Scarica' })}
                      </a>
                      <a
                        href={q.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-accent/30 text-primary font-bold text-xs hover:bg-accent/5 hover:border-accent/60 transition-colors"
                      >
                        {L(locale, { ar: 'فتح الرابط', en: 'Open link', ru: 'Открыть', it: 'Apri' })}
                        <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            {L(locale, {
              ar: 'تحب تطبع نسخ مطبوعة احترافية؟',
              en: 'Want professional printed copies?',
              ru: 'Хотите профессионально напечатанные копии?',
              it: 'Vuoi copie stampate professionali?',
            })}
          </p>
          <Link href={'/contact' as never} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-primary font-bold hover:bg-accent-400 transition-colors">
            {L(locale, { ar: 'تواصل معنا', en: 'Contact us', ru: 'Связаться', it: 'Contattaci' })}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </main>
  );
}
