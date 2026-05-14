import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'Lottus Sharm Tourism', template: '%s | Lottus Sharm' },
  description: 'Lottus Sharm Tourism — 13+ years organizing trips in Sharm El Sheikh',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={cairo.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
