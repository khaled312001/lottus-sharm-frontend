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

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://lotussharm.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Lotus Sharm Travel', template: '%s | Lotus Sharm' },
  description: 'Lotus Sharm Travel — Luxury tourism in Sharm El Sheikh. 13+ years curating unforgettable Egyptian journeys.',
  applicationName: 'Lotus Sharm Tourism',
  authors: [{ name: 'Lotus Sharm Tourism', url: SITE }],
  creator: 'Lotus Sharm Tourism',
  publisher: 'Lotus Sharm Tourism Investment & Marketing Co.',
  formatDetection: { telephone: true, email: true, address: true },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.jpg', type: 'image/jpeg' },
    ],
    apple: '/logo.jpg',
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  referrer: 'origin-when-cross-origin',
  category: 'travel',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0d3a3a',
  colorScheme: 'light' as const,
};

const ORGANIZATION_LD = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  '@id': `${SITE}/#organization`,
  name: 'Lotus Sharm Tourism',
  alternateName: ['لوتس شرم للسياحة', 'Lottus Sharm'],
  legalName: 'Lottus Sharm Tourism Investment & Marketing Co.',
  url: SITE,
  logo: `${SITE}/logo.jpg`,
  image: `${SITE}/hero-slides/hero-01.jpg`,
  description: '13+ years curating tours, hotel stays, and transfers across Sharm El Sheikh and the Red Sea.',
  foundingDate: '2013',
  email: 'info@lotussharm.com',
  telephone: '+20-109-076-7278',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Sharm El Sheikh',
    addressLocality: 'Sharm El Sheikh',
    addressRegion: 'South Sinai',
    addressCountry: 'EG',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 27.9158,
    longitude: 34.3300,
  },
  areaServed: [
    { '@type': 'City', name: 'Sharm El Sheikh' },
    { '@type': 'City', name: 'Dahab' },
    { '@type': 'City', name: 'Saint Catherine' },
    { '@type': 'AdministrativeArea', name: 'South Sinai' },
  ],
  sameAs: [
    'https://www.facebook.com/profile.php?id=61550600242507',
    'https://www.instagram.com/lotus_sharm',
    'https://www.youtube.com/@lotussharm',
    'https://www.tiktok.com/@lotussharm',
  ],
  contactPoint: [{
    '@type': 'ContactPoint',
    telephone: '+20-109-076-7278',
    contactType: 'customer service',
    availableLanguage: ['Arabic', 'English', 'Russian', 'Italian'],
    areaServed: 'EG',
  }],
  knowsLanguage: ['ar', 'en', 'ru', 'it'],
};

const WEBSITE_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE}/#website`,
  url: SITE,
  name: 'Lotus Sharm Tourism',
  inLanguage: ['ar-EG', 'en', 'ru', 'it', 'de'],
  publisher: { '@id': `${SITE}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE}/ar/trips?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${cairo.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_LD) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
