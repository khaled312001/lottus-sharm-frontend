import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { ContactForm } from '@/components/public/contact-form';
import { Reveal } from '@/components/public/motion';
import { getSiteSettings } from '@/lib/site-settings';
import { Phone, Mail, MapPin, MessageCircle, Clock, Facebook, Instagram, Youtube, Sparkles, HelpCircle } from 'lucide-react';
import { buildWhatsAppLink, L } from '@/lib/utils';

export const revalidate = 120;

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const settings = await getSiteSettings();
  const isAr = locale === 'ar';

  const faqs = [
    { q_ar: 'كيف أحجز رحلة؟', q_en: 'How do I book a trip?', a_ar: 'اختر الرحلة من صفحة الرحلات، اضغط "احجز عبر واتساب"، وهتفتحلك محادثة جاهزة بكل تفاصيل حجزك. فريقنا هيؤكد فوراً.', a_en: 'Pick a trip, click "Book via WhatsApp" — a pre-filled chat opens with your details. Our team confirms immediately.' },
    { q_ar: 'ما هي طرق الدفع المتاحة؟', q_en: 'What payment methods are available?', a_ar: 'فودافون كاش، InstaPay، تحويل بنكي (بنك أبو ظبي الإسلامي)، أو الدفع نقداً عند استلام الخدمة.', a_en: 'Vodafone Cash, InstaPay, bank transfer (ADIB), or cash on arrival.' },
    { q_ar: 'هل يمكن إلغاء الحجز؟', q_en: 'Can I cancel my booking?', a_ar: 'نعم، يمكن الإلغاء قبل 24 ساعة من موعد الرحلة لاسترداد كامل المبلغ بدون رسوم.', a_en: 'Yes, free cancellation up to 24 hours before for a full refund.' },
    { q_ar: 'هل الرحلات مناسبة للأطفال؟', q_en: 'Are trips kid-friendly?', a_ar: 'معظم رحلاتنا تناسب جميع الأعمار مع خصومات للأطفال. بعض المغامرات تتطلب حد أدنى للسن.', a_en: 'Most trips welcome all ages with kid discounts. Some have minimum age limits.' },
    { q_ar: 'هل تنظمون حفلات ومؤتمرات؟', q_en: 'Do you organize parties and conferences?', a_ar: 'بالتأكيد. ننظم الحفلات الخاصة، المؤتمرات، أعياد الميلاد، وحفلات الشركات بباقات مخصصة.', a_en: 'Absolutely. We handle private parties, conferences, birthdays, and corporate events with custom packages.' },
    { q_ar: 'هل المرشدون يتحدثون لغات أجنبية؟', q_en: 'Do your guides speak foreign languages?', a_ar: 'نعم، فريقنا يتحدث العربية، الإنجليزية، الروسية، والإيطالية لخدمة جميع زوارنا.', a_en: 'Yes — Arabic, English, Russian, and Italian.' },
    { q_ar: 'هل تغطون مدن غير شرم الشيخ؟', q_en: 'Do you cover cities outside Sharm?', a_ar: 'نعم، نغطي مصر كلها — القاهرة، الأقصر، أسوان، الإسكندرية، دهب، الغردقة، وغيرها — لكن خبرتنا الأعمق في شرم الشيخ.', a_en: 'Yes — we cover all Egypt including Cairo, Luxor, Aswan, Alexandria, Dahab and more — with deepest expertise in Sharm El Sheikh.' },
  ];

  return (
    <>
      <section className="relative bg-primary-900 text-cream py-16 md:py-24 overflow-hidden">
        <Image src="/hero-slides/hero-12.jpg" alt="" fill className="object-cover opacity-30" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 via-primary-900/70 to-primary-900" />
        <div className="container relative">
          <Reveal className="text-center max-w-2xl mx-auto">
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-4">{L(locale, { ar: 'اتصل بنا', en: 'Get in touch', ru: 'Свяжитесь с нами', it: 'Contattaci' })}</div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4">{t('contact.title')}</h1>
            <p className="text-lg opacity-90">{t('contact.subtitle')}</p>
          </Reveal>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream -mt-12 relative z-10">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { icon: Phone, ar: 'اتصل بنا', en: 'Call us', value: '+20 109 076 7278', href: 'tel:+201090767278', color: 'bg-primary text-cream' },
              { icon: MessageCircle, ar: 'واتساب', en: 'WhatsApp', value: '01090767278', href: buildWhatsAppLink('201090767278'), color: 'bg-[#25D366] text-white' },
              { icon: Mail, ar: 'البريد الإلكتروني', en: 'Email us', value: settings.email || 'info@lotussharm.com', href: `mailto:${settings.email || 'info@lotussharm.com'}`, color: 'bg-accent text-primary' },
              { icon: MapPin, ar: 'موقعنا', en: 'Our location', value: L(locale, { ar: 'شرم الشيخ، مصر', en: 'Sharm El Sheikh, Egypt', ru: 'Шарм-эль-Шейх, Египет', it: 'Sharm El Sheikh, Egitto' }), href: 'https://maps.google.com/?q=Sharm+El+Sheikh', color: 'bg-primary-800 text-cream' },
            ].map((c, i) => (
              <Reveal key={c.en} delay={i * 0.08}>
                <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener" className={`group block rounded-2xl ${c.color} p-5 md:p-6 hover:-translate-y-1.5 transition-all duration-500 shadow-lg hover:shadow-2xl h-full`}>
                  <c.icon className="h-7 w-7 mb-3 opacity-90 group-hover:scale-110 transition-transform" />
                  <div className="text-[10px] uppercase tracking-wider opacity-75 mb-1">{L(locale, { ar: c.ar, en: c.en })}</div>
                  <div className="font-bold text-sm md:text-base break-words">{c.value}</div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-cream">
        <div className="container grid lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-3">
            <Reveal>
              <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">{L(locale, { ar: 'أرسل رسالة', en: 'Send a message', ru: 'Отправить сообщение', it: 'Invia un messaggio' })}</div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-3">
                {L(locale, { ar: 'كلمنا، ورد لك في دقائق', en: 'Message us, hear back in minutes', ru: 'Напишите — ответим в течение минут', it: 'Scrivici — rispondiamo in pochi minuti' })}
              </h2>
              <p className="text-muted-foreground mb-6">
                {L(locale, { ar: 'فريقنا متاح 24/7 للإجابة على استفساراتك واقتراح أفضل الباقات لرحلتك.', en: 'Our team is online 24/7 to answer questions and suggest the best packages.', ru: 'Наша команда онлайн 24/7 — ответим на вопросы и подберём лучшие туры.', it: 'Il nostro team è online 24/7 per rispondere e suggerire i migliori pacchetti.' })}
              </p>
              <ContactForm />
            </Reveal>
          </div>

          <aside className="lg:col-span-2 space-y-5">
            <Reveal delay={0.15}>
              <div className="bg-primary text-cream rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-accent/20 blur-2xl" />
                <Sparkles className="h-8 w-8 text-accent mb-3" />
                <h3 className="font-serif text-xl font-bold mb-2">{L(locale, { ar: 'استشارة مجانية', en: 'Free consultation', ru: 'Бесплатная консультация', it: 'Consulenza gratuita' })}</h3>
                <p className="text-sm opacity-90 mb-5">
                  {L(locale, { ar: 'احصل على خطة رحلة مخصصة تناسب اهتماماتك وميزانيتك بدون أي التزام.', en: 'Get a customized trip plan matching your interests and budget — no commitment.', ru: 'Получите индивидуальный план тура под ваши интересы и бюджет — без обязательств.', it: 'Ricevi un piano di viaggio personalizzato per i tuoi interessi e budget — senza impegno.' })}
                </p>
                <a href={buildWhatsAppLink('201090767278', L(locale, { ar: 'مرحبا، أريد استشارة مجانية لرحلة في شرم الشيخ', en: "Hi! I'd like a free trip consultation for Sharm El Sheikh" }))} target="_blank" rel="noopener" className="inline-flex items-center gap-2 bg-accent text-primary font-bold px-5 py-3 rounded-xl text-sm hover:bg-accent-400 transition-colors">
                  <MessageCircle className="h-4 w-4" /> {L(locale, { ar: 'تواصل واتساب', en: 'WhatsApp Chat', ru: 'WhatsApp чат', it: 'Chat WhatsApp' })}
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="bg-white rounded-2xl p-6 border border-accent/15">
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <Clock className="h-5 w-5 text-accent" />
                  <h3 className="font-serif font-bold text-lg">{L(locale, { ar: 'ساعات العمل', en: 'Working hours', ru: 'Часы работы', it: 'Orari di lavoro' })}</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between"><span className="text-muted-foreground">{L(locale, { ar: 'السبت — الخميس', en: 'Sat — Thu', ru: 'Сб — Чт', it: 'Sab — Gio' })}</span><span className="font-semibold text-primary">{L(locale, { ar: '8 ص — 11 م', en: '8 AM — 11 PM', ru: '8:00 — 23:00', it: '8:00 — 23:00' })}</span></li>
                  <li className="flex justify-between"><span className="text-muted-foreground">{L(locale, { ar: 'الجمعة', en: 'Friday', ru: 'Пятница', it: 'Venerdì' })}</span><span className="font-semibold text-primary">{L(locale, { ar: '10 ص — 11 م', en: '10 AM — 11 PM', ru: '10:00 — 23:00', it: '10:00 — 23:00' })}</span></li>
                  <li className="flex justify-between pt-2 border-t border-accent/15"><span className="text-muted-foreground">{L(locale, { ar: 'واتساب', en: 'WhatsApp', ru: 'WhatsApp', it: 'WhatsApp' })}</span><span className="font-bold text-accent-700">{L(locale, { ar: '24/7', en: '24/7', ru: '24/7', it: '24/7' })}</span></li>
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.35}>
              <div className="bg-white rounded-2xl p-6 border border-accent/15">
                <h3 className="font-serif font-bold text-lg text-primary mb-4">{L(locale, { ar: 'تابعنا', en: 'Follow us' })}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {settings.facebookUrl && (
                    <a href={settings.facebookUrl} target="_blank" rel="noopener" className="flex flex-col items-center gap-1.5 bg-[#1877F2] text-white py-3 rounded-lg hover:opacity-90 transition-opacity">
                      <Facebook className="h-5 w-5" /> <span className="text-[10px] font-semibold">Facebook</span>
                    </a>
                  )}
                  {settings.instagramUrl && (
                    <a href={settings.instagramUrl} target="_blank" rel="noopener" className="flex flex-col items-center gap-1.5 bg-gradient-to-tr from-[#fa7e1e] via-[#d62976] to-[#962fbf] text-white py-3 rounded-lg hover:opacity-90 transition-opacity">
                      <Instagram className="h-5 w-5" /> <span className="text-[10px] font-semibold">Instagram</span>
                    </a>
                  )}
                  {settings.youtubeUrl && (
                    <a href={settings.youtubeUrl} target="_blank" rel="noopener" className="flex flex-col items-center gap-1.5 bg-[#FF0000] text-white py-3 rounded-lg hover:opacity-90 transition-opacity">
                      <Youtube className="h-5 w-5" /> <span className="text-[10px] font-semibold">YouTube</span>
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-b from-cream to-muted/30">
        <div className="container max-w-4xl">
          <Reveal className="text-center mb-12">
            <HelpCircle className="h-10 w-10 text-accent mx-auto mb-4" />
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">{L(locale, { ar: 'الأسئلة الشائعة', en: 'FAQ', ru: 'Частые вопросы', it: 'FAQ' })}</div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary">
              {L(locale, { ar: 'كل ما تريد معرفته', en: 'Everything you need to know', ru: 'Всё, что нужно знать', it: 'Tutto quello che devi sapere' })}
            </h2>
          </Reveal>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <Reveal key={f.q_en} delay={i * 0.05}>
                <details className="group bg-white rounded-xl border border-accent/15 hover:border-accent/40 transition-colors overflow-hidden">
                  <summary className="flex items-center justify-between gap-4 p-5 md:p-6 cursor-pointer list-none">
                    <span className="font-serif font-bold text-primary text-base md:text-lg">{L(locale, { ar: f.q_ar, en: f.q_en })}</span>
                    <span className="shrink-0 w-8 h-8 rounded-full bg-accent/15 text-accent flex items-center justify-center group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-5 md:px-6 pb-5 md:pb-6 text-sm md:text-base text-foreground/75 leading-relaxed">
                    {L(locale, { ar: f.a_ar, en: f.a_en })}
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-cream">
        <div className="container">
          <Reveal className="text-center mb-8">
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">{L(locale, { ar: 'مكاننا', en: 'Find us', ru: 'Найти нас', it: 'Trovarci' })}</div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary">{L(locale, { ar: 'في قلب شرم الشيخ', en: 'In the heart of Sharm El Sheikh', ru: 'В самом сердце Шарм-эль-Шейха', it: 'Nel cuore di Sharm El Sheikh' })}</h2>
          </Reveal>
          <Reveal>
            <div className="rounded-2xl overflow-hidden border border-accent/15 card-shadow aspect-[16/9] md:aspect-[21/9] bg-muted">
              <iframe
                src="https://www.google.com/maps?q=Sharm+El+Sheikh,Egypt&hl=en&z=11&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Sharm El Sheikh map"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
