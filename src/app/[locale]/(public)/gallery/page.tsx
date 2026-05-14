import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { api } from '@/lib/api';
import type { TripDTO } from '@/types/api';
import { localeToApiCode } from '@/lib/utils';

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  let allMedia: { url: string; thumb: string; alt: string }[] = [];
  try {
    const list = await api.get<{ items: TripDTO[] }>(
      `/public/trips?locale=${localeToApiCode(locale)}&pageSize=50`,
    );
    list.items.forEach((trip) => {
      trip.gallery.forEach((g) => {
        if (g.media.type === 'IMAGE') {
          allMedia.push({
            url: g.media.url,
            thumb: g.media.thumbnailUrl || g.media.mediumUrl || g.media.url,
            alt: trip.tr?.title || '',
          });
        }
      });
    });
  } catch {
    /* ignored */
  }

  return (
    <>
      <section className="gradient-sea text-white py-14">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{t('gallery.title')}</h1>
          <p className="opacity-90">{t('gallery.subtitle')}</p>
        </div>
      </section>

      <section className="container py-10">
        {allMedia.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No media yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {allMedia.map((m, i) => (
              <a key={i} href={m.url} target="_blank" rel="noopener noreferrer" className="relative aspect-square rounded-lg overflow-hidden group">
                <Image src={m.thumb} alt={m.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-110 transition-transform" />
              </a>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
