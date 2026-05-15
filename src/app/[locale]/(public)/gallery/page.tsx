import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/public/motion';
import type { TripDTO } from '@/types/api';
import { localeToApiCode } from '@/lib/utils';
import { Camera, ArrowRight } from 'lucide-react';

export const revalidate = 120;

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const isAr = locale === 'ar';

  let allMedia: { url: string; thumb: string; alt: string; tripSlug: string; category: string }[] = [];
  let trips: TripDTO[] = [];
  try {
    const list = await api.get<{ items: TripDTO[] }>(`/public/trips?locale=${localeToApiCode(locale)}&pageSize=50`);
    trips = list.items;
    list.items.forEach((trip) => {
      trip.gallery.forEach((g) => {
        if (g.media.type === 'IMAGE') {
          allMedia.push({
            url: g.media.url,
            thumb: g.media.mediumUrl || g.media.thumbnailUrl || g.media.url,
            alt: trip.tr?.title || '',
            tripSlug: trip.slug,
            category: trip.category,
          });
        }
      });
    });
    list.items.forEach((trip) => {
      if (trip.heroImage?.type === 'IMAGE') {
        allMedia.unshift({
          url: trip.heroImage.url,
          thumb: trip.heroImage.mediumUrl || trip.heroImage.thumbnailUrl || trip.heroImage.url,
          alt: trip.tr?.title || '',
          tripSlug: trip.slug,
          category: trip.category,
        });
      }
    });
  } catch { /* ignore */ }

  const seen = new Set<string>();
  allMedia = allMedia.filter((m) => seen.has(m.url) ? false : seen.add(m.url));

  return (
    <>
      <section className="relative bg-primary-900 text-cream py-20 md:py-28 overflow-hidden">
        <Image src="/hero-slides/hero-10.jpg" alt="" fill className="object-cover opacity-30" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 via-primary-900/70 to-primary-900" />
        <div className="container relative">
          <Reveal>
            <Camera className="h-10 w-10 text-accent mb-4" />
            <div className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-3">{isAr ? 'لحظات لا تُنسى' : 'Unforgettable moments'}</div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 max-w-3xl leading-[1.1]">{t('gallery.title')}</h1>
            <p className="text-lg opacity-90 max-w-2xl">{t('gallery.subtitle')}</p>
            <div className="mt-6 inline-flex items-center gap-3 text-sm text-cream/70">
              <span className="inline-flex items-center gap-1.5"><Camera className="h-4 w-4 text-accent" /> {allMedia.length} {isAr ? 'صورة' : 'photos'}</span>
              <span>·</span>
              <span>{trips.length} {isAr ? 'رحلة' : 'experiences'}</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        {allMedia.length === 0 ? (
          <Reveal className="text-center py-20 text-muted-foreground">
            <p className="font-serif text-xl mb-2">{isAr ? 'لا توجد صور حالياً' : 'No photos yet'}</p>
          </Reveal>
        ) : (
          <Reveal>
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4 space-y-3 md:space-y-4">
              {allMedia.slice(0, 80).map((m, i) => (
                <Link key={i} href={`/trips/${m.tripSlug}`}
                  className="group block relative overflow-hidden rounded-xl break-inside-avoid card-shadow hover:card-shadow-gold transition-shadow"
                  style={{ aspectRatio: i % 3 === 0 ? '3/4' : i % 5 === 0 ? '4/5' : '1/1' }}
                >
                  <Image src={m.thumb} alt={m.alt} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div className="text-cream">
                      <div className="text-[10px] uppercase tracking-wider text-accent">{m.category}</div>
                      <div className="font-serif font-bold text-sm leading-tight line-clamp-2">{m.alt}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>
        )}
      </section>

      <section className="py-16 bg-gradient-to-b from-cream to-muted/30">
        <div className="container">
          <Reveal>
            <div className="relative max-w-4xl mx-auto rounded-2xl bg-primary text-cream p-8 md:p-12 text-center overflow-hidden">
              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/15 blur-3xl" />
              <h3 className="font-serif text-2xl md:text-3xl font-bold mb-3">{isAr ? 'عاوز تعمل ذكريات زي دي؟' : 'Want to make memories like these?'}</h3>
              <p className="opacity-85 mb-6 max-w-xl mx-auto">{isAr ? 'تصفح رحلاتنا واختر مغامرتك القادمة' : 'Browse our trips and pick your next adventure'}</p>
              <Button asChild size="lg" className="bg-accent text-primary hover:bg-accent-400 font-bold">
                <Link href="/trips">{isAr ? 'تصفح الرحلات' : 'Browse Trips'} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
