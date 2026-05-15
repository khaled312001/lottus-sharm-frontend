import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { localeToApiCode } from '@/lib/utils';
import { LegalPage } from '@/components/public/legal-page';

interface Page {
  tr?: { title: string; content: string; metaTitle?: string; metaDesc?: string };
}

async function fetchPage(locale: string): Promise<Page | null> {
  try {
    return await api.get<Page>(`/public/pages/privacy?locale=${localeToApiCode(locale)}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const page = await fetchPage(locale);
  return {
    title: page?.tr?.metaTitle || page?.tr?.title || 'Privacy Policy',
    description: page?.tr?.metaDesc || undefined,
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const page = await fetchPage(locale);
  if (!page?.tr) notFound();
  return (
    <LegalPage
      slug="privacy"
      locale={locale}
      title={page.tr.title}
      content={page.tr.content}
    />
  );
}
