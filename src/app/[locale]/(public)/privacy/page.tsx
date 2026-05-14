import { setRequestLocale } from 'next-intl/server';
import { api } from '@/lib/api';
import { localeToApiCode } from '@/lib/utils';

async function fetchStatic(slug: string, locale: string) {
  try {
    return await api.get<{ tr?: { title: string; content: string } }>(`/public/pages/${slug}?locale=${localeToApiCode(locale)}`);
  } catch {
    return null;
  }
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const page = await fetchStatic('privacy', locale);
  return (
    <section className="container py-12 max-w-3xl">
      <h1 className="text-3xl font-extrabold mb-6">{page?.tr?.title || (locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy')}</h1>
      <div className="prose max-w-none rtl:prose-rtl" dangerouslySetInnerHTML={{ __html: page?.tr?.content || '' }} />
    </section>
  );
}
