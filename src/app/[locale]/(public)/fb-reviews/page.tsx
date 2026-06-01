import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Facebook, ArrowRight } from 'lucide-react';
import { L } from '@/lib/utils';
import { Reveal } from '@/components/public/motion';

export const dynamic = 'force-static';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const title = L(locale, {
    ar: 'تقييمات فيسبوك — لوتس شرم للسياحة',
    en: 'Facebook reviews — Lotus Sharm Tourism', de: 'Facebook-Bewertungen — Lotus Sharm Tourism',
    ru: 'Отзывы Facebook — Lotus Sharm',
    it: 'Recensioni Facebook — Lotus Sharm Tourism',
  });
  const description = L(locale, {
    ar: 'تقييمات حقيقية من زوار لوتس شرم على فيسبوك مع الصور والتعليقات الكاملة.',
    en: 'Verified Facebook reviews from Lotus Sharm guests — full comments and photos.', de: 'Verifizierte Facebook-Bewertungen von Lotus-Sharm-Gästen — vollständige Kommentare und Fotos.',
    ru: 'Реальные отзывы из Facebook о Lotus Sharm — полные комментарии и фото.',
    it: 'Recensioni reali da Facebook degli ospiti Lotus Sharm.',
  });
  return { title, description };
}

export default async function FbReviewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-[#f0f2f5]">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1877F2] via-[#0e63d4] to-[#0a4d9e] text-white py-12 md:py-16 overflow-hidden">
        <div aria-hidden className="absolute -top-32 -end-32 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="container relative">
          <Reveal>
            <div className="flex items-center gap-3 mb-4">
              <Facebook className="h-10 w-10 md:h-12 md:w-12" />
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-[0.25em] text-white/80">
                  {L(locale, { ar: 'مباشر من فيسبوك', en: 'Direct from Facebook', de: 'Direkt von Facebook', ru: 'Прямо из Facebook', it: 'Direttamente da Facebook' })}
                </span>
                <h1 className="font-serif text-2xl md:text-4xl font-bold leading-tight mt-1">
                  {L(locale, {
                    ar: 'تقييمات زوارنا على فيسبوك',
                    en: 'What guests say on Facebook', de: 'Was Gäste auf Facebook sagen',
                    ru: 'Что говорят гости на Facebook',
                    it: 'Cosa dicono gli ospiti su Facebook',
                  })}
                </h1>
              </div>
            </div>
            <p className="text-white/90 max-w-2xl text-sm md:text-base mb-5">
              {L(locale, {
                ar: 'كل تقييمات صفحتنا على فيسبوك من ضيوف حقيقيين بأسمائهم وصورهم — وبدون أي تعديل.',
                en: 'Every review from our Facebook page — real guests, real names, real photos, unedited.', de: 'Jede Bewertung von unserer Facebook-Seite — echte Gäste, echte Namen, echte Fotos, unbearbeitet.',
                ru: 'Все отзывы с нашей страницы Facebook — реальные гости и фотографии.',
                it: 'Tutte le recensioni dalla nostra pagina Facebook — ospiti reali, senza modifiche.',
              })}
            </p>
            <a
              href="https://www.facebook.com/profile.php?id=61550600242507&sk=reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#1877F2] font-bold text-sm hover:bg-white/95 transition-colors shadow-lg"
            >
              <Facebook className="h-4 w-4" />
              {L(locale, { ar: 'افتح الصفحة على فيسبوك', en: 'Open page on Facebook', de: 'Seite auf Facebook öffnen', ru: 'Открыть в Facebook', it: 'Apri su Facebook' })}
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </a>
          </Reveal>
        </div>
      </section>

      {/* Body: hand the visitor straight to Facebook with another CTA card */}
      <section className="container py-10 md:py-12 text-center">
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          {L(locale, {
            ar: 'الزر اللي تحت هياخدك على صفحة التقييمات على فيسبوك مباشرة.',
            en: 'The button below opens the Facebook reviews page directly.',
            de: 'Der Button unten öffnet die Facebook-Bewertungen direkt.',
            ru: 'Кнопка ниже откроет страницу отзывов в Facebook.',
            it: 'Il pulsante qui sotto apre direttamente la pagina recensioni su Facebook.',
          })}
        </p>
        <a
          href="https://www.facebook.com/profile.php?id=61550600242507&sk=reviews"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1877F2] hover:bg-[#0e63d4] text-white font-bold shadow-lg transition-all"
        >
          <Facebook className="h-5 w-5" />
          {L(locale, { ar: 'افتح التقييمات على فيسبوك', en: 'Open reviews on Facebook', de: 'Bewertungen auf Facebook ansehen', ru: 'Открыть отзывы в Facebook', it: 'Apri recensioni su Facebook' })}
        </a>
      </section>
    </main>
  );
}
