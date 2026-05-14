import { Header } from '@/components/public/header';
import { Footer } from '@/components/public/footer';
import { WhatsAppFAB } from '@/components/public/whatsapp-fab';
import { MainWrapper } from '@/components/public/main-wrapper';
import { getSiteSettings } from '@/lib/site-settings';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Header />
      <MainWrapper>{children}</MainWrapper>
      <Footer settings={settings} />
      <WhatsAppFAB phone={settings.whatsapp} />
    </div>
  );
}
