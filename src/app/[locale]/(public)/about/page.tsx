import { getTranslations, setRequestLocale } from 'next-intl/server';
import { api } from '@/lib/api';
import { localeToApiCode } from '@/lib/utils';
import { Award, Heart, Compass, Users } from 'lucide-react';
import { getLocalizedName, getSiteSettings } from '@/lib/site-settings';

interface PageDTO {
  slug: string;
  tr?: { title: string; content: string };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const settings = await getSiteSettings();
  const brand = getLocalizedName(settings, locale);

  let page: PageDTO | null = null;
  try {
    page = await api.get<PageDTO>(`/public/pages/about?locale=${localeToApiCode(locale)}`);
  } catch {
    /* ignored */
  }

  const values = [
    { icon: Award, ar: 'الجودة والخبرة', en: 'Quality & Experience' },
    { icon: Heart, ar: 'شغف الخدمة', en: 'Passion for Service' },
    { icon: Compass, ar: 'الإبداع والابتكار', en: 'Creativity & Innovation' },
    { icon: Users, ar: 'فريق محترف', en: 'Professional Team' },
  ];

  return (
    <>
      <section className="gradient-sea text-white py-16">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">{t('about.title')}</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            {locale === 'ar' ? `${brand} — ${settings.yearsExperience}+ سنة من الخبرة في السياحة` : `${brand} — ${settings.yearsExperience}+ years of tourism excellence`}
          </p>
        </div>
      </section>

      <section className="container py-12 max-w-4xl">
        <div className="prose max-w-none rtl:prose-rtl" dangerouslySetInnerHTML={{ __html: page?.tr?.content || '' }} />
      </section>

      <section className="container py-12">
        <h2 className="text-3xl font-bold text-center mb-10">{t('about.values')}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => (
            <div key={v.en} className="text-center p-6 rounded-2xl border bg-white">
              <div className="w-14 h-14 mx-auto mb-3 rounded-xl gradient-sea flex items-center justify-center text-white">
                <v.icon className="h-7 w-7" />
              </div>
              <h3 className="font-bold">{locale === 'ar' ? v.ar : v.en}</h3>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
