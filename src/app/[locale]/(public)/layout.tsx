import { Header } from '@/components/public/header';
import { Footer } from '@/components/public/footer';
import { WhatsAppFAB } from '@/components/public/whatsapp-fab';
import { getLocalizedName, getSiteSettings } from '@/lib/site-settings';

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const settings = await getSiteSettings();
  const brand = getLocalizedName(settings, locale);

  return (
    <div className="flex min-h-screen flex-col">
      <Header brand={brand} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} brand={brand} />
      <WhatsAppFAB phone={settings.whatsapp} />
    </div>
  );
}
