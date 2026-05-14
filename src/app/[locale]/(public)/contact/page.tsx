import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from '@/components/public/contact-form';
import { getSiteSettings } from '@/lib/site-settings';
import { Phone, Mail, MapPin } from 'lucide-react';
import { buildWhatsAppLink } from '@/lib/utils';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const settings = await getSiteSettings();

  return (
    <>
      <section className="gradient-sea text-white py-14">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{t('contact.title')}</h1>
          <p className="opacity-90">{t('contact.subtitle')}</p>
        </div>
      </section>

      <section className="container py-12 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <a href={`tel:+${settings.whatsapp}`} className="flex items-center gap-3 p-4 rounded-xl border bg-white hover:bg-muted transition-colors">
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">{t('contact.phone')}</div>
              <div className="font-bold" dir="ltr">+{settings.whatsapp}</div>
            </div>
          </a>
          {settings.email && (
            <a href={`mailto:${settings.email}`} className="flex items-center gap-3 p-4 rounded-xl border bg-white hover:bg-muted transition-colors">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">{t('contact.email')}</div>
                <div className="font-bold">{settings.email}</div>
              </div>
            </a>
          )}
          <div className="flex items-start gap-3 p-4 rounded-xl border bg-white">
            <MapPin className="h-5 w-5 text-primary mt-1" />
            <div>
              <div className="text-xs text-muted-foreground">{t('contact.address')}</div>
              <div className="font-bold">Sharm El Sheikh, Egypt</div>
            </div>
          </div>
          <a
            href={buildWhatsAppLink(settings.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-[#25D366] text-white text-center font-bold py-4 rounded-xl hover:opacity-90 transition-opacity"
          >
            {t('contact.whatsapp')}
          </a>
        </div>

        <div className="md:col-span-2">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
