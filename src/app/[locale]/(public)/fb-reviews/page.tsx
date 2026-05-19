import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Star, ThumbsUp, Facebook, ArrowRight } from 'lucide-react';
import { L } from '@/lib/utils';
import { Reveal } from '@/components/public/motion';
import fbReviews from '@/data/fb-reviews.json';

interface FbReview {
  id: number;
  slug: string;
  name: string;
  comment: string;
  dateText: string;
  recommends: boolean;
  rating: number;
  profileImage: string | null;
  attachedImages: string[];
}

const REVIEWS = fbReviews as FbReview[];

export const dynamic = 'force-static';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const title = L(locale, {
    ar: 'تقييمات فيسبوك — لوتس شرم للسياحة',
    en: 'Facebook reviews — Lotus Sharm Tourism',
    ru: 'Отзывы Facebook — Lotus Sharm',
    it: 'Recensioni Facebook — Lotus Sharm Tourism',
  });
  const description = L(locale, {
    ar: 'تقييمات حقيقية من زوار لوتس شرم على فيسبوك مع الصور والتعليقات الكاملة.',
    en: 'Verified Facebook reviews from Lotus Sharm guests — full comments and photos.',
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
                  {L(locale, { ar: 'مباشر من فيسبوك', en: 'Direct from Facebook', ru: 'Прямо из Facebook', it: 'Direttamente da Facebook' })}
                </span>
                <h1 className="font-serif text-2xl md:text-4xl font-bold leading-tight mt-1">
                  {L(locale, {
                    ar: 'تقييمات زوارنا على فيسبوك',
                    en: 'What guests say on Facebook',
                    ru: 'Что говорят гости на Facebook',
                    it: 'Cosa dicono gli ospiti su Facebook',
                  })}
                </h1>
              </div>
            </div>
            <p className="text-white/90 max-w-2xl text-sm md:text-base mb-5">
              {L(locale, {
                ar: 'كل تقييمات صفحتنا على فيسبوك من ضيوف حقيقيين بأسمائهم وصورهم — وبدون أي تعديل.',
                en: 'Every review from our Facebook page — real guests, real names, real photos, unedited.',
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
              {L(locale, { ar: 'افتح الصفحة على فيسبوك', en: 'Open page on Facebook', ru: 'Открыть в Facebook', it: 'Apri su Facebook' })}
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </a>
          </Reveal>
        </div>
      </section>

      {/* Reviews grid */}
      <section className="container py-8 md:py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.id} delay={(i % 6) * 0.05}>
              <article className="bg-white rounded-lg border border-[#dadde1] shadow-[0_2px_4px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col h-full">
                {/* Header */}
                <header className="p-4 pb-3 flex items-start gap-3">
                  <div className="shrink-0">
                    {r.profileImage ? (
                      <Image src={r.profileImage} alt={r.name} width={48} height={48} className="rounded-full object-cover border border-[#dadde1]" unoptimized />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1877F2] to-[#0e63d4] flex items-center justify-center text-white font-bold">
                        {r.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-[#050505] text-[15px] leading-tight truncate hover:underline">{r.name}</div>
                    <div className="flex items-center gap-1 text-[12px] text-[#65676B] mt-0.5">
                      <span>{r.dateText}</span>
                      <span aria-hidden>·</span>
                      <Facebook className="h-3 w-3 text-[#1877F2]" />
                    </div>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className={`h-3.5 w-3.5 ${idx < r.rating ? 'fill-[#F7B928] text-[#F7B928]' : 'text-gray-300'}`} />
                      ))}
                      {r.recommends && (
                        <span className="ms-1 inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <ThumbsUp className="h-3 w-3" />
                          {L(locale, { ar: 'يوصي', en: 'recommends', ru: 'реком.', it: 'consiglia' })}
                        </span>
                      )}
                    </div>
                  </div>
                </header>

                {/* Comment — full text, not clamped */}
                <div className="px-4 pb-3 flex-1">
                  <p className="text-[14px] leading-[1.5] text-[#050505] whitespace-pre-wrap" dir="auto">{r.comment}</p>
                </div>

                {/* Attached photos */}
                {r.attachedImages.length > 0 && (
                  <div className={`grid gap-[2px] border-t border-[#dadde1] ${r.attachedImages.length === 1 ? 'grid-cols-1' : r.attachedImages.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {r.attachedImages.map((img, idx) => (
                      <a key={img} href={img} target="_blank" rel="noopener noreferrer" className="relative aspect-square overflow-hidden bg-[#f0f2f5] group" aria-label={`Photo ${idx + 1}`}>
                        <Image src={img} alt="" fill sizes="240px" className="object-cover group-hover:scale-105 transition-transform" unoptimized />
                      </a>
                    ))}
                  </div>
                )}

                <footer className="px-4 py-2 border-t border-[#dadde1] text-[12px] flex items-center justify-end">
                  <a
                    href="https://www.facebook.com/profile.php?id=61550600242507&sk=reviews"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1877F2] font-semibold hover:underline inline-flex items-center gap-1.5"
                  >
                    <Facebook className="h-3.5 w-3.5" />
                    {L(locale, { ar: 'عرض على فيسبوك', en: 'View on Facebook', ru: 'Открыть в Facebook', it: 'Apri su Facebook' })}
                  </a>
                </footer>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
