import { setRequestLocale } from 'next-intl/server';
import { api } from '@/lib/api';
import { localeToApiCode } from '@/lib/utils';

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  let page: { tr?: { title: string; content: string } } | null = null;
  try {
    page = await api.get(`/public/pages/terms?locale=${localeToApiCode(locale)}`);
  } catch {}
  return (
    <section className="container py-12 max-w-3xl">
      <h1 className="text-3xl font-extrabold mb-6">{page?.tr?.title || (locale === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions')}</h1>
      <div className="prose max-w-none rtl:prose-rtl" dangerouslySetInnerHTML={{ __html: page?.tr?.content || '' }} />
    </section>
  );
}
