import Image from 'next/image';
import { Reveal } from './motion';
import { Link } from '@/i18n/routing';
import { Phone, MessageCircle, Mail, ScrollText, Shield, FileText, ArrowLeft } from 'lucide-react';
import { L, buildWhatsAppLink } from '@/lib/utils';
import { stripLeadMeta } from '@/lib/blog-images';

const ICONS = { privacy: Shield, terms: FileText, 'cancellation-policy': ScrollText } as const;
type Slug = keyof typeof ICONS;

export function LegalPage({
  slug, locale, title, content,
}: {
  slug: Slug;
  locale: string;
  title: string;
  content: string;
}) {
  const Icon = ICONS[slug];
  const isAr = locale === 'ar';
  const eyebrow = L(locale, {
    ar:
      slug === 'privacy' ? 'الخصوصية والبيانات' :
      slug === 'terms' ? 'الشروط والأحكام' :
      'سياسة الإلغاء والاسترداد',
    en:
      slug === 'privacy' ? 'Privacy & Data' :
      slug === 'terms' ? 'Terms & Conditions' :
      'Cancellation & Refunds',
    ru:
      slug === 'privacy' ? 'Конфиденциальность' :
      slug === 'terms' ? 'Условия' :
      'Отмена и возвраты',
    it:
      slug === 'privacy' ? 'Privacy e dati' :
      slug === 'terms' ? 'Termini e condizioni' :
      'Cancellazione e rimborsi',
  });

  return (
    <>
      {/* HERO */}
      <section className="relative bg-primary-900 text-cream py-16 md:py-20 overflow-hidden">
        <Image src="/hero-slides/hero-08.jpg" alt="" fill className="object-cover opacity-15" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/85 via-primary-900/80 to-primary-900" />
        <div className="absolute top-1/4 -end-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="container relative">
          <Reveal>
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-accent/15 backdrop-blur border border-accent/30 text-accent text-[11px] font-bold uppercase tracking-[0.25em]">
              <Icon className="h-3.5 w-3.5" />
              {eyebrow}
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold mb-3 max-w-3xl leading-tight">{title}</h1>
            <p className="text-cream/80 text-sm md:text-base max-w-2xl">
              {L(locale, {
                ar: 'هذه الصفحة شفافة وملزمة لكلا الطرفين. اقرأها بعناية قبل استخدام خدماتنا.',
                en: 'This page is transparent and binding for both parties. Please read carefully before using our services.',
                ru: 'Эта страница прозрачна и обязательна для обеих сторон. Внимательно ознакомьтесь перед использованием наших услуг.',
                it: 'Questa pagina è trasparente e vincolante per entrambe le parti. Leggi con attenzione prima di usare i nostri servizi.',
              })}
            </p>
          </Reveal>
        </div>
      </section>

      {/* CONTENT */}
      <section className="container py-12 md:py-16 max-w-4xl">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8 lg:gap-12">
          {/* Main copy */}
          <Reveal>
            <article
              className={
                'prose max-w-none ' +
                (isAr ? 'text-right' : '') +
                ' [&_.lead]:text-sm [&_.lead]:text-muted-foreground [&_.lead]:bg-muted/40 [&_.lead]:px-4 [&_.lead]:py-2 [&_.lead]:rounded-lg [&_.lead]:inline-block [&_.lead]:mb-6 [&_.lead]:border [&_.lead]:border-accent/15'
              }
              dangerouslySetInnerHTML={{ __html: stripLeadMeta(content) }}
            />
          </Reveal>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
            <Reveal delay={0.15}>
              <div className="rounded-2xl bg-primary text-cream p-5 relative overflow-hidden">
                <div className="absolute -top-10 -end-10 w-32 h-32 rounded-full bg-accent/20 blur-2xl pointer-events-none" />
                <div className="relative">
                  <div className="text-accent uppercase tracking-[0.3em] text-[10px] font-bold mb-2">
                    {L(locale, { ar: 'بحاجة لمساعدة؟', en: 'Need help?', ru: 'Нужна помощь?', it: 'Hai bisogno di aiuto?' })}
                  </div>
                  <h3 className="font-serif text-lg font-bold mb-3 leading-tight">
                    {L(locale, {
                      ar: 'فريقنا متاح 24/7 للرد على استفساراتك',
                      en: 'Our team is online 24/7 to answer your questions',
                      ru: 'Команда онлайн 24/7 для ответов на ваши вопросы',
                      it: 'Il nostro team è online 24/7 per rispondere',
                    })}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <a href="tel:+201090767278" className="flex items-center gap-2 hover:text-accent transition-colors">
                      <Phone className="h-4 w-4 text-accent flex-shrink-0" />
                      <span dir="ltr" className="font-medium">+20 109 076 7278</span>
                    </a>
                    <a
                      href={buildWhatsAppLink('201090767278', L(locale, {
                        ar: 'مرحبا، لدي سؤال عن سياستكم',
                        en: 'Hi! I have a question about your policy',
                        ru: 'Здравствуйте! У меня вопрос о вашей политике',
                        it: 'Ciao! Ho una domanda sulla vostra politica',
                      }))}
                      target="_blank" rel="noopener"
                      className="flex items-center gap-2 hover:text-accent transition-colors"
                    >
                      <MessageCircle className="h-4 w-4 text-accent flex-shrink-0" />
                      <span className="font-medium">WhatsApp</span>
                    </a>
                    <a href="mailto:info@lotussharm.com" className="flex items-center gap-2 hover:text-accent transition-colors">
                      <Mail className="h-4 w-4 text-accent flex-shrink-0" />
                      <span dir="ltr" className="font-medium break-all">info@lotussharm.com</span>
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Other legal pages */}
            <Reveal delay={0.25}>
              <div className="rounded-2xl bg-white border border-accent/15 p-5">
                <div className="text-accent uppercase tracking-[0.3em] text-[10px] font-bold mb-3">
                  {L(locale, { ar: 'الصفحات القانونية', en: 'Legal pages', ru: 'Юридические страницы', it: 'Pagine legali' })}
                </div>
                <ul className="space-y-1.5 text-sm">
                  {(['privacy', 'terms', 'cancellation-policy'] as const).map((s) => {
                    const SIcon = ICONS[s];
                    const active = s === slug;
                    const label = L(locale, {
                      ar: s === 'privacy' ? 'سياسة الخصوصية' : s === 'terms' ? 'الشروط والأحكام' : 'سياسة الإلغاء',
                      en: s === 'privacy' ? 'Privacy Policy' : s === 'terms' ? 'Terms of Service' : 'Cancellation Policy',
                      ru: s === 'privacy' ? 'Конфиденциальность' : s === 'terms' ? 'Условия' : 'Политика отмены',
                      it: s === 'privacy' ? 'Politica Privacy' : s === 'terms' ? 'Termini di servizio' : 'Politica di cancellazione',
                    });
                    return (
                      <li key={s}>
                        <Link
                          href={`/${s}` as never}
                          className={
                            'flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors ' +
                            (active
                              ? 'bg-accent/15 text-primary font-bold'
                              : 'text-foreground/75 hover:bg-accent/10 hover:text-primary')
                          }
                        >
                          <SIcon className="h-4 w-4 text-accent flex-shrink-0" />
                          <span className="flex-1">{label}</span>
                          {active && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-3 pt-3 border-t border-accent/15">
                  <Link href="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                    {L(locale, { ar: 'العودة للرئيسية', en: 'Back to home', ru: 'На главную', it: 'Torna alla home' })}
                  </Link>
                </div>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  );
}
