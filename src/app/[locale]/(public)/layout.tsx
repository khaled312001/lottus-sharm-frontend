import { Header } from '@/components/public/header';
import { Footer } from '@/components/public/footer';
import { WhatsAppFAB } from '@/components/public/whatsapp-fab';
import { MainWrapper } from '@/components/public/main-wrapper';
import { ScrollProgress } from '@/components/motion-kit';
import { CommandPalette } from '@/components/public/command-palette';
import { BackToTop } from '@/components/public/back-to-top';
import { GlobalDiscountBanner } from '@/components/public/global-discount-banner';
import { EasyCashTopBar } from '@/components/public/easycash-top-bar';
import { getSiteSettings } from '@/lib/site-settings';

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <ScrollProgress />
      <EasyCashTopBar locale={locale} />
      <GlobalDiscountBanner />
      <Header />
      <MainWrapper>{children}</MainWrapper>
      <Footer settings={settings} />
      <WhatsAppFAB phone={settings.whatsapp} />
      <BackToTop />
      <CommandPalette />
    </div>
  );
}
