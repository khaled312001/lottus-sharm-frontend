import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { ContactForm } from '@/components/public/contact-form';
import { Reveal } from '@/components/public/motion';
import { getSiteSettings } from '@/lib/site-settings';
import { Phone, Mail, MapPin, MessageCircle, Clock, Facebook, Instagram, Youtube, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { buildWhatsAppLink, L } from '@/lib/utils';
import { fetchCMSPage } from '@/lib/cms';

export const revalidate = 120;

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const settings = await getSiteSettings();
  const isAr = locale === 'ar';

  const faqs = [
    { q_ar: 'كيف أحجز رحلة؟', q_en: 'How do I book a trip?', q_ru: 'Как забронировать тур?', q_it: 'Come si prenota un tour?',
      a_ar: 'اختر الرحلة من صفحة الرحلات، اضغط "احجز عبر واتساب"، وهتفتحلك محادثة جاهزة بكل تفاصيل حجزك. فريقنا هيؤكد فوراً.',
      a_en: 'Pick a trip, click "Book via WhatsApp" — a pre-filled chat opens with your details. Our team confirms immediately.',
      a_ru: 'Выберите тур, нажмите «Забронировать через WhatsApp» — откроется чат с вашими данными. Команда подтвердит сразу.',
      a_it: 'Scegli un tour, clicca "Prenota via WhatsApp" — si apre una chat con i tuoi dati. Il team conferma subito.' },
    { q_ar: 'ما هي طرق الدفع المتاحة؟', q_en: 'What payment methods are available?', q_ru: 'Какие способы оплаты доступны?', q_it: 'Quali metodi di pagamento accettate?',
      a_ar: 'فودافون كاش، InstaPay، تحويل بنكي (بنك أبو ظبي الإسلامي)، أو الدفع نقداً عند استلام الخدمة.',
      a_en: 'Vodafone Cash, InstaPay, bank transfer (ADIB), or cash on arrival.',
      a_ru: 'Vodafone Cash, InstaPay, банковский перевод (ADIB) или наличные по прибытии.',
      a_it: 'Vodafone Cash, InstaPay, bonifico bancario (ADIB) o contanti all\'arrivo.' },
    { q_ar: 'هل يمكن إلغاء الحجز؟', q_en: 'Can I cancel my booking?', q_ru: 'Можно ли отменить бронирование?', q_it: 'Posso cancellare la prenotazione?',
      a_ar: 'نعم، يمكن الإلغاء قبل 24 ساعة من موعد الرحلة لاسترداد كامل المبلغ بدون رسوم.',
      a_en: 'Yes, free cancellation up to 24 hours before for a full refund.',
      a_ru: 'Да, бесплатная отмена за 24 часа до тура — полный возврат.',
      a_it: 'Sì, cancellazione gratuita fino a 24 ore prima per rimborso totale.' },
    { q_ar: 'هل الرحلات مناسبة للأطفال؟', q_en: 'Are trips kid-friendly?', q_ru: 'Туры подходят для детей?', q_it: 'I tour sono adatti ai bambini?',
      a_ar: 'معظم رحلاتنا تناسب جميع الأعمار مع خصومات للأطفال. بعض المغامرات تتطلب حد أدنى للسن.',
      a_en: 'Most trips welcome all ages with kid discounts. Some have minimum age limits.',
      a_ru: 'Большинство туров подходят всем возрастам со скидками для детей. У некоторых есть ограничения по возрасту.',
      a_it: 'La maggior parte dei tour accoglie tutte le età con sconti per bambini. Alcuni hanno limiti di età.' },
    { q_ar: 'هل تنظمون حفلات ومؤتمرات؟', q_en: 'Do you organize parties and conferences?', q_ru: 'Организуете ли мероприятия и конференции?', q_it: 'Organizzate feste e conferenze?',
      a_ar: 'بالتأكيد. ننظم الحفلات الخاصة، المؤتمرات، أعياد الميلاد، وحفلات الشركات بباقات مخصصة.',
      a_en: 'Absolutely. We handle private parties, conferences, birthdays, and corporate events with custom packages.',
      a_ru: 'Конечно. Мы организуем частные вечеринки, конференции, дни рождения и корпоративы.',
      a_it: 'Certamente. Organizziamo feste private, conferenze, compleanni ed eventi aziendali su misura.' },
    { q_ar: 'هل المرشدون يتحدثون لغات أجنبية؟', q_en: 'Do your guides speak foreign languages?', q_ru: 'Гиды говорят на иностранных языках?', q_it: 'Le guide parlano lingue straniere?',
      a_ar: 'نعم، فريقنا يتحدث العربية، الإنجليزية، الروسية، والإيطالية لخدمة جميع زوارنا.',
      a_en: 'Yes — Arabic, English, Russian, and Italian.',
      a_ru: 'Да — арабский, английский, русский и итальянский.',
      a_it: 'Sì — arabo, inglese, russo e italiano.' },
    { q_ar: 'هل تغطون مدن غير شرم الشيخ؟', q_en: 'Do you cover cities outside Sharm?', q_ru: 'Покрываете ли вы другие города?', q_it: 'Coprite città oltre Sharm?',
      a_ar: 'نعم، نغطي مصر كلها — القاهرة، الأقصر، أسوان، الإسكندرية، دهب، الغردقة، وغيرها — لكن خبرتنا الأعمق في شرم الشيخ.',
      a_en: 'Yes — we cover all Egypt including Cairo, Luxor, Aswan, Alexandria, Dahab and more — with deepest expertise in Sharm El Sheikh.',
      a_ru: 'Да — мы охватываем весь Египет: Каир, Луксор, Асуан, Александрию, Дахаб и другие — с самой глубокой экспертизой в Шарм-эль-Шейхе.',
      a_it: 'Sì — copriamo tutto l\'Egitto: Cairo, Luxor, Aswan, Alessandria, Dahab e altri — con la maggiore esperienza a Sharm El Sheikh.' },
  ];

  const cms = await fetchCMSPage('contact', locale);
  const heroTitle = cms?.tr?.title || t('contact.title');
  const heroSubtitle = cms?.tr?.subtitle || t('contact.subtitle');
  const heroImageUrl = cms?.heroImage?.url || '/hero-slides/hero-12.jpg';

  return (
    <>
      <section className="relative bg-primary-900 text-cream py-16 md:py-24 overflow-hidden">
        <Image src={heroImageUrl} alt="" fill className="object-cover opacity-30 scale-105" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/85 via-primary-900/65 to-primary-900" />
        <div className="absolute top-1/4 -end-32 w-80 h-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -start-20 w-80 h-80 rounded-full bg-accent/8 blur-3xl pointer-events-none" />
        <div className="container relative">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="eyebrow eyebrow-center">{L(locale, { ar: 'اتصل بنا', en: 'Get in touch', de: 'Kontakt aufnehmen', ru: 'Свяжитесь с нами', it: 'Contattaci' })}</span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl font-bold mb-4 leading-tight text-balance">{heroTitle}</h1>
            <span className="rule-gold" />
            <p className="text-base sm:text-lg opacity-90 leading-relaxed">{heroSubtitle}</p>
          </Reveal>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream -mt-12 relative z-10">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { icon: Phone,         ar: 'اتصل بنا',           en: 'Call us',      de: 'Anrufen',       ru: 'Позвоните нам', it: 'Chiamaci',
                value: '+20 109 076 7278', href: 'tel:+201090767278', color: 'bg-primary text-cream' },
              { icon: MessageCircle, ar: 'واتساب',             en: 'WhatsApp',     de: 'WhatsApp',      ru: 'WhatsApp',      it: 'WhatsApp',
                value: '01090767278', href: buildWhatsAppLink('201090767278'), color: 'bg-[#25D366] text-white' },
              { icon: Mail,          ar: 'البريد الإلكتروني',  en: 'Email us',     de: 'E-Mail',        ru: 'Эл. почта',     it: 'Email',
                value: settings.email || 'info@lotussharm.com', href: `mailto:${settings.email || 'info@lotussharm.com'}`, color: 'bg-accent text-primary' },
              { icon: MapPin,        ar: 'موقعنا',             en: 'Our location', de: 'Unser Standort', ru: 'Наш адрес',     it: 'La nostra sede',
                value: L(locale, { ar: 'شرم الشيخ، مصر', en: 'Sharm El Sheikh, Egypt', de: 'Sharm El Sheikh, Ägypten', ru: 'Шарм-эль-Шейх, Египет', it: 'Sharm El Sheikh, Egitto' }), href: 'https://maps.google.com/?q=Sharm+El+Sheikh', color: 'bg-primary-800 text-cream' },
            ].map((c, i) => (
              <Reveal key={c.en} delay={i * 0.08}>
                <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener" className={`group relative block rounded-2xl ${c.color} p-5 md:p-6 hover:-translate-y-2 transition-all duration-500 shadow-lg hover:shadow-2xl h-full overflow-hidden`}>
                  {/* Decorative ring on hover */}
                  <span aria-hidden className="absolute -top-10 -end-10 w-32 h-32 rounded-full border border-current opacity-0 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700" />
                  <span aria-hidden className="absolute -top-16 -end-16 w-40 h-40 rounded-full border border-current opacity-0 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700" style={{ transitionDelay: '0.1s' }} />
                  <c.icon className="relative h-7 w-7 mb-3 opacity-90 group-hover:scale-125 group-hover:rotate-[-6deg] transition-transform duration-300" />
                  <div className="relative text-[10px] uppercase tracking-wider opacity-75 mb-1">{L(locale, { ar: c.ar, en: c.en, ru: c.ru, it: c.it, de: c.de })}</div>
                  <div className="relative font-bold text-sm md:text-base break-words">{c.value}</div>
                  <ArrowRight aria-hidden className="absolute bottom-4 end-4 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all duration-300 rtl:rotate-180" />
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
              <span className="eyebrow">{L(locale, { ar: 'أرسل رسالة', en: 'Send a message', de: 'Nachricht senden', ru: 'Отправить сообщение', it: 'Invia un messaggio' })}</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-3 leading-tight text-balance">
                {L(locale, { ar: 'كلمنا، ورد لك في دقائق', en: 'Message us, hear back in minutes', de: 'Schreiben Sie uns, Antwort in Minuten', ru: 'Напишите — ответим в течение минут', it: 'Scrivici — rispondiamo in pochi minuti' })}
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {L(locale, { ar: 'فريقنا متاح 24/7 للإجابة على استفساراتك واقتراح أفضل الباقات لرحلتك.', en: 'Our team is online 24/7 to answer questions and suggest the best packages.', de: 'Unser Team ist rund um die Uhr online, um Fragen zu beantworten und die besten Pakete vorzuschlagen.', ru: 'Наша команда онлайн 24/7 — ответим на вопросы и подберём лучшие туры.', it: 'Il nostro team è online 24/7 per rispondere e suggerire i migliori pacchetti.' })}
              </p>
              <ContactForm />
            </Reveal>
          </div>

          <aside className="lg:col-span-2 space-y-5">
            <Reveal delay={0.15}>
              <div className="bg-primary text-cream rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-accent/20 blur-2xl" />
                <Sparkles className="h-8 w-8 text-accent mb-3" />
                <h3 className="font-serif text-xl font-bold mb-2">{L(locale, { ar: 'استشارة مجانية', en: 'Free consultation', de: 'Kostenlose Beratung', ru: 'Бесплатная консультация', it: 'Consulenza gratuita' })}</h3>
                <p className="text-sm opacity-90 mb-5">
                  {L(locale, { ar: 'احصل على خطة رحلة مخصصة تناسب اهتماماتك وميزانيتك بدون أي التزام.', en: 'Get a customized trip plan matching your interests and budget — no commitment.', de: 'Erhalten Sie einen individuellen Reiseplan passend zu Ihren Interessen und Ihrem Budget — unverbindlich.', ru: 'Получите индивидуальный план тура под ваши интересы и бюджет — без обязательств.', it: 'Ricevi un piano di viaggio personalizzato per i tuoi interessi e budget — senza impegno.' })}
                </p>
                <a href={buildWhatsAppLink('201090767278', L(locale, { ar: 'مرحبا، أريد استشارة مجانية لرحلة في شرم الشيخ', en: "Hi! I'd like a free trip consultation for Sharm El Sheikh", de: "Hallo! Ich hätte gerne eine kostenlose Reiseberatung für Sharm El Sheikh", ru: 'Здравствуйте! Хочу бесплатную консультацию по туру в Шарм-эль-Шейхе', it: 'Salve! Vorrei una consulenza gratuita per un viaggio a Sharm El Sheikh' }))} target="_blank" rel="noopener" className="inline-flex items-center gap-2 bg-accent text-primary font-bold px-5 py-3 rounded-xl text-sm hover:bg-accent-400 transition-colors">
                  <MessageCircle className="h-4 w-4" /> {L(locale, { ar: 'تواصل واتساب', en: 'WhatsApp Chat', de: 'WhatsApp-Chat', ru: 'WhatsApp чат', it: 'Chat WhatsApp' })}
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="bg-white rounded-2xl p-6 border border-accent/15">
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <Clock className="h-5 w-5 text-accent" />
                  <h3 className="font-serif font-bold text-lg">{L(locale, { ar: 'ساعات العمل', en: 'Working hours', de: 'Öffnungszeiten', ru: 'Часы работы', it: 'Orari di lavoro' })}</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between"><span className="text-muted-foreground">{L(locale, { ar: 'السبت — الخميس', en: 'Sat — Thu', de: 'Sa — Do', ru: 'Сб — Чт', it: 'Sab — Gio' })}</span><span className="font-semibold text-primary">{L(locale, { ar: '8 ص — 11 م', en: '8 AM — 11 PM', de: '8 — 23 Uhr', ru: '8:00 — 23:00', it: '8:00 — 23:00' })}</span></li>
                  <li className="flex justify-between"><span className="text-muted-foreground">{L(locale, { ar: 'الجمعة', en: 'Friday', de: 'Freitag', ru: 'Пятница', it: 'Venerdì' })}</span><span className="font-semibold text-primary">{L(locale, { ar: '10 ص — 11 م', en: '10 AM — 11 PM', de: '10 — 23 Uhr', ru: '10:00 — 23:00', it: '10:00 — 23:00' })}</span></li>
                  <li className="flex justify-between pt-2 border-t border-accent/15"><span className="text-muted-foreground">{L(locale, { ar: 'واتساب', en: 'WhatsApp', de: 'WhatsApp', ru: 'WhatsApp', it: 'WhatsApp' })}</span><span className="font-bold text-accent-700">{L(locale, { ar: '24/7', en: '24/7', de: '24/7', ru: '24/7', it: '24/7' })}</span></li>
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.35}>
              <div className="bg-white rounded-2xl p-6 border border-accent/15">
                <h3 className="font-serif font-bold text-lg text-primary mb-4">{L(locale, { ar: 'تابعنا', en: 'Follow us', de: 'Folgen Sie uns', ru: 'Подписывайтесь', it: 'Seguici' })}</h3>
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
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 mx-auto mb-4">
              <HelpCircle className="h-7 w-7 text-accent" />
            </div>
            <span className="eyebrow eyebrow-center">{L(locale, { ar: 'الأسئلة الشائعة', en: 'FAQ', de: 'FAQ', ru: 'Частые вопросы', it: 'FAQ' })}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary leading-tight text-balance">
              {L(locale, { ar: 'كل ما تريد معرفته', en: 'Everything you need to know', de: 'Alles, was Sie wissen müssen', ru: 'Всё, что нужно знать', it: 'Tutto quello che devi sapere' })}
            </h2>
            <span className="rule-gold" />
          </Reveal>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <Reveal key={f.q_en} delay={i * 0.05}>
                <details className="group bg-white rounded-2xl border border-accent/15 hover:border-accent/40 hover:shadow-md transition-all overflow-hidden">
                  <summary className="flex items-center justify-between gap-4 p-5 md:p-6 cursor-pointer list-none">
                    <span className="font-serif font-bold text-primary text-base md:text-lg leading-snug">{L(locale, { ar: f.q_ar, en: f.q_en, ru: f.q_ru, it: f.q_it, de: f.q_en })}</span>
                    <span className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/25 text-accent-700 font-bold flex items-center justify-center group-open:rotate-45 transition-transform duration-300">+</span>
                  </summary>
                  <div className="px-5 md:px-6 pb-5 md:pb-6 text-sm md:text-base text-foreground/80 leading-relaxed border-t border-accent/10 pt-4">
                    {L(locale, { ar: f.a_ar, en: f.a_en, ru: f.a_ru, it: f.a_it, de: f.a_en })}
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
            <span className="eyebrow eyebrow-center">{L(locale, { ar: 'مكاننا', en: 'Find us', de: 'So finden Sie uns', ru: 'Найти нас', it: 'Trovarci' })}</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary leading-tight text-balance">{L(locale, { ar: 'في قلب شرم الشيخ', en: 'In the heart of Sharm El Sheikh', de: 'Im Herzen von Sharm El Sheikh', ru: 'В самом сердце Шарм-эль-Шейха', it: 'Nel cuore di Sharm El Sheikh' })}</h2>
            <span className="rule-gold" />
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
