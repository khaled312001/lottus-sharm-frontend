import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/public/motion';
import { GalleryTabs } from '@/components/public/gallery-tabs';
import type { TripDTO } from '@/types/api';
import { localeToApiCode, L } from '@/lib/utils';
import { Camera, ArrowRight, Video } from 'lucide-react';
import { fetchCMSPage } from '@/lib/cms';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/json-ld';
import { SITE_URL, buildPageMetadata, buildBreadcrumbLd, crumbLabel } from '@/lib/seo';

export const revalidate = 120;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: '/gallery',
    title: {
      ar: 'معرض صور شرم الشيخ — أجمل صور رحلات لوتس شرم',
      en: 'Sharm El Sheikh Photo Gallery — Lotus Sharm Tours',
      ru: 'Фотогалерея Шарм-эль-Шейх — Туры Lotus Sharm',
      it: 'Galleria Fotografica Sharm El Sheikh — Tour Lotus Sharm',
      de: 'Sharm El Sheikh Fotogalerie — Lotus Sharm Touren',
    },
    description: {
      ar: 'استكشف صور وفيديوهات رحلات شرم الشيخ: رأس محمد، الجزيرة البيضاء، سفاري الصحراء، عرض الدلافين، يخت كاتاماران وأكثر.',
      en: 'Explore Sharm El Sheikh tour photos and videos: Ras Mohammed, White Island, desert safari, dolphin show, catamaran cruises and more.',
      ru: 'Фото и видео экскурсий: Рас-Мохаммед, Белый остров, сафари, дельфины, катамаран.',
      it: 'Foto e video delle escursioni: Ras Mohammed, Isola Bianca, safari, delfini, catamarano.',
      de: 'Fotos und Videos der Touren: Ras Mohammed, Weiße Insel, Safari, Delfine, Katamaran.',
    },
  });
}

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const isAr = locale === 'ar';

  type Item = { url: string; thumb?: string; alt: string; tripSlug: string; category: string; folder?: string; type: 'IMAGE' | 'VIDEO' };
  const photos: Item[] = [];
  const videos: Item[] = [];
  let trips: TripDTO[] = [];

  // Map media URL → owning trip (so untagged media inherits a context if we
  // recognise it later).
  const mediaTrip = new Map<string, { slug: string; title: string; category: string }>();

  try {
    const list = await api.get<{ items: TripDTO[] }>(`/public/trips?locale=${localeToApiCode(locale)}&pageSize=50`);
    trips = list.items;
    list.items.forEach((trip) => {
      const ctx = { slug: trip.slug, title: trip.tr?.title || '', category: trip.category };
      if (trip.heroImage?.url) mediaTrip.set(trip.heroImage.url, ctx);
      trip.gallery.forEach((g) => { if (g.media?.url) mediaTrip.set(g.media.url, ctx); });
    });
  } catch { /* ignore */ }

  // Pull EVERY approved media row from the library so the gallery reflects the
  // real number shown in admin (not just trip-linked assets).
  try {
    interface MediaRow {
      id: number; type: 'IMAGE' | 'VIDEO';
      url: string; thumbnailUrl?: string | null; mediumUrl?: string | null;
      altAr?: string | null; altEn?: string | null; category?: string | null;
    }
    const all = await api.get<{ items: MediaRow[]; total: number }>(`/public/media?pageSize=500`);
    for (const m of all.items) {
      const ctx = mediaTrip.get(m.url);
      const alt = (locale === 'ar' ? m.altAr : m.altEn) || ctx?.title || 'Lotus Sharm';
      const category = ctx?.category || 'GENERAL';
      const folder = (m.category || '').trim(); // admin-defined gallery section
      const tripSlug = ctx?.slug || '';
      if (m.type === 'IMAGE') {
        photos.push({
          url: m.url,
          thumb: m.mediumUrl || m.thumbnailUrl || m.url,
          alt, tripSlug, category, folder, type: 'IMAGE',
        });
      } else {
        videos.push({
          url: m.url,
          thumb: m.thumbnailUrl || undefined,
          alt, tripSlug, category, folder, type: 'VIDEO',
        });
      }
    }
  } catch { /* ignore */ }

  // Dedupe by URL (same image may sit in multiple trip galleries)
  const seenP = new Set<string>(); const dedPhotos = photos.filter((m) => seenP.has(m.url) ? false : seenP.add(m.url));
  const seenV = new Set<string>(); const dedVideos = videos.filter((m) => seenV.has(m.url) ? false : seenV.add(m.url));

  const cms = await fetchCMSPage('gallery', locale);
  const heroTitle = cms?.tr?.title || t('gallery.title');
  const heroSubtitle = cms?.tr?.subtitle || t('gallery.subtitle');
  const heroImageUrl = cms?.heroImage?.url || '/hero-slides/hero-10.jpg';

  const breadcrumbLd = buildBreadcrumbLd([
    { name: crumbLabel('home', locale), url: `${SITE_URL}/${locale}` },
    { name: crumbLabel('gallery', locale), url: `${SITE_URL}/${locale}/gallery` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbLd} id="ld-breadcrumb" />
      <section className="relative bg-primary-900 text-cream py-20 md:py-28 overflow-hidden">
        <Image src={heroImageUrl} alt="" fill className="object-cover opacity-30" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 via-primary-900/70 to-primary-900" />
        <div className="container relative">
          <Reveal>
            <Camera className="h-10 w-10 text-accent mb-4" />
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">{L(locale, { ar: 'لحظات لا تُنسى', en: 'Unforgettable moments', de: 'Unvergessliche Momente', ru: 'Незабываемые моменты', it: 'Momenti indimenticabili' })}</div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 max-w-3xl leading-[1.1]">{heroTitle}</h1>
            <p className="text-lg opacity-90 max-w-2xl">{heroSubtitle}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-cream/70">
              <span className="inline-flex items-center gap-1.5"><Camera className="h-4 w-4 text-accent" /> {dedPhotos.length} {L(locale, { ar: 'صورة', en: 'photos', de: 'Fotos', ru: 'фото', it: 'foto' })}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1.5"><Video className="h-4 w-4 text-accent" /> {dedVideos.length} {L(locale, { ar: 'فيديو', en: 'videos', de: 'Videos', ru: 'видео', it: 'video' })}</span>
              <span>·</span>
              <span>{trips.length} {L(locale, { ar: 'رحلة', en: 'experiences', de: 'Erlebnisse', ru: 'туров', it: 'esperienze' })}</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        {(dedPhotos.length + dedVideos.length) === 0 ? (
          <Reveal className="text-center py-20 text-muted-foreground">
            <p className="font-serif text-xl mb-2">{L(locale, { ar: 'لا توجد صور حالياً', en: 'No content yet', de: 'Noch keine Inhalte', ru: 'Контента пока нет', it: 'Nessun contenuto' })}</p>
          </Reveal>
        ) : (
          <Reveal>
            <GalleryTabs photos={dedPhotos} videos={dedVideos} locale={locale} />
          </Reveal>
        )}
      </section>

      <section className="py-16 bg-gradient-to-b from-cream to-muted/30">
        <div className="container">
          <Reveal>
            <div className="relative max-w-4xl mx-auto rounded-2xl bg-primary text-cream p-8 md:p-12 text-center overflow-hidden">
              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/15 blur-3xl" />
              <h3 className="font-serif text-2xl md:text-3xl font-bold mb-3">{L(locale, { ar: 'عاوز تعمل ذكريات زي دي؟', en: 'Want to make memories like these?', de: 'Möchten Sie solche Erinnerungen schaffen?', ru: 'Хотите оставить такие же воспоминания?', it: 'Vuoi creare ricordi così?' })}</h3>
              <p className="opacity-85 mb-6 max-w-xl mx-auto">{L(locale, { ar: 'تصفح رحلاتنا واختر مغامرتك القادمة', en: 'Browse our trips and pick your next adventure', de: 'Entdecken Sie unsere Ausflüge und wählen Sie Ihr nächstes Abenteuer', ru: 'Просмотрите туры и выберите своё следующее приключение', it: 'Sfoglia i tour e scegli la tua prossima avventura' })}</p>
              <Button asChild size="lg" className="bg-accent text-primary hover:bg-accent-400 font-bold">
                <Link href="/trips">{L(locale, { ar: 'تصفح الرحلات', en: 'Browse Trips', de: 'Ausflüge ansehen', ru: 'Просмотреть туры', it: 'Sfoglia i tour' })} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
