import type { Metadata } from 'next';
import { Cairo, Playfair_Display } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://lotussharm.com'),
  title: { default: 'Lotus Sharm Travel', template: '%s | Lotus Sharm' },
  description: 'Lotus Sharm Travel — Luxury tourism in Sharm El Sheikh. 13+ years curating unforgettable Egyptian journeys.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${cairo.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
