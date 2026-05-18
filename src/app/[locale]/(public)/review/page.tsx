import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { ReviewForm } from '@/components/public/review-form';
import { L } from '@/lib/utils';
import { Star, Quote } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const title = L(locale, {
    ar: 'شاركنا تجربتك — لوتس شرم للسياحة',
    en: 'Share your experience — Lotus Sharm Tourism',
    ru: 'Поделитесь впечатлениями — Lotus Sharm',
    it: 'Condividi la tua esperienza — Lotus Sharm',
  });
  const description = L(locale, {
    ar: 'ساعدنا في تحسين خدمتنا بتقييم تجربتك مع لوتس شرم للسياحة.',
    en: 'Help us improve by sharing your Lotus Sharm experience.',
    ru: 'Помогите нам стать лучше — оставьте отзыв о вашем опыте с Lotus Sharm.',
    it: 'Aiutaci a migliorare — condividi la tua esperienza con Lotus Sharm.',
  });
  return { title, description, robots: { index: false, follow: true } };
}

export default async function ReviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-primary-900 via-primary to-primary-900 text-cream py-12 md:py-20 overflow-hidden">
      {/* Decorative gold accents */}
      <div className="absolute top-1/4 -end-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -start-20 w-80 h-80 rounded-full bg-accent/8 blur-3xl pointer-events-none" />

      <div className="container relative">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-accent/15 border border-accent/40 mb-5 backdrop-blur">
              <Quote className="h-8 w-8 md:h-10 md:w-10 text-accent" />
            </div>
            <div className="inline-flex items-center gap-2.5 mb-3 justify-center">
              <span className="block w-7 h-px bg-accent" />
              <span className="text-accent uppercase tracking-[0.3em] text-[10px] sm:text-xs font-bold">
                {L(locale, { ar: 'تقييم العملاء', en: 'Customer review', ru: 'Отзыв клиента', it: 'Recensione cliente' })}
              </span>
              <span className="block w-7 h-px bg-accent" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance leading-tight">
              {L(locale, {
                ar: 'شاركنا تجربتك مع لوتس شرم',
                en: 'Share your Lotus Sharm experience',
                ru: 'Поделитесь впечатлениями',
                it: 'Condividi la tua esperienza',
              })}
            </h1>
            <p className="text-sm sm:text-base opacity-85 max-w-lg mx-auto leading-relaxed">
              {L(locale, {
                ar: 'رأيك يهمنا. اكتب لنا عن رحلتك معنا في دقيقة واحدة، وسيظهر تقييمك على الصفحة الرئيسية بعد المراجعة.',
                en: 'Your feedback matters. Tell us about your trip in a minute — once approved, your review will appear on our homepage.',
                ru: 'Ваше мнение важно. Поделитесь впечатлениями — после одобрения отзыв появится на главной странице.',
                it: 'Il tuo feedback conta. Raccontaci del tuo viaggio — dopo l\'approvazione, la recensione apparirà in homepage.',
              })}
            </p>

            {/* Stars decoration */}
            <div className="mt-6 inline-flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-accent text-accent" />
              ))}
            </div>
          </div>

          {/* Review form card */}
          <div className="bg-cream/5 backdrop-blur-md border border-accent/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-primary-900/40">
            <ReviewForm locale={locale} />
          </div>

          {/* Trust note */}
          <p className="text-center text-xs text-cream/60 mt-6 leading-relaxed">
            {L(locale, {
              ar: 'تقييمك مجاني ولن نستخدم بياناتك في أي شيء آخر. شكراً لثقتك في لوتس شرم.',
              en: 'Free to leave, your details stay private. Thanks for trusting Lotus Sharm.',
              ru: 'Отзыв бесплатный, ваши данные останутся конфиденциальными. Спасибо за доверие к Lotus Sharm.',
              it: 'Lasciarci una recensione è gratuito e i tuoi dati restano privati. Grazie per la fiducia in Lotus Sharm.',
            })}
          </p>
        </div>
      </div>
    </main>
  );
}
