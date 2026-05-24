'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { Clock, MapPin, Star, ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { TripDTO } from '@/types/api';
import { L } from '@/lib/utils';
import { Price } from './price';
import { FavoriteButton } from './trip/favorite-button';

export function TripCard({ trip, locale, index = 0 }: { trip: TripDTO; locale: string; index?: number }) {
  const t = useTranslations();
  const tr = trip.tr || trip.translations.find((x) => x.locale === 'EN') || trip.translations[0];
  const hours = Math.floor(trip.durationMinutes / 60);
  const price = Number(trip.priceLocalEGP);
  const isAr = locale === 'ar';
  const hero =
    trip.heroImage?.mediumUrl ||
    trip.heroImage?.url ||
    trip.gallery[0]?.media?.mediumUrl ||
    trip.gallery[0]?.media?.url ||
    '/placeholder.jpg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <Link
        href={`/trips/${trip.slug}`}
        className="block relative overflow-hidden rounded-2xl bg-white card-shadow group-hover:card-shadow-gold transition-shadow duration-500"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-primary-800">
          <Image
            src={hero}
            alt={tr?.title || ''}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-primary-900/30 to-transparent opacity-90" />

          {trip.isFeatured && (
            <div className="absolute top-4 start-4 flex items-center gap-1.5 rounded-full bg-accent/95 backdrop-blur px-3 py-1.5 text-xs font-bold text-primary shadow-lg">
              <Star className="h-3 w-3 fill-current" />
              {L(locale, { ar: 'مميزة', en: 'Featured', de: 'Empfohlen', ru: 'Популярный', it: 'In evidenza' })}
            </div>
          )}

          {/* Hover "open" arrow — only on hover */}
          <div className="absolute top-4 start-4 h-9 w-9 rounded-full bg-cream/90 backdrop-blur flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
            <ArrowUpRight className="h-4 w-4 rtl:rotate-90" />
          </div>

          <div className="absolute inset-x-0 bottom-0 p-6 text-cream">
            <div className="flex items-center gap-2 text-xs mb-2">
              <span className="px-2.5 py-1 rounded-full bg-cream/15 backdrop-blur border border-cream/20 font-semibold uppercase tracking-wider">
                {t(`trips.category.${trip.category}`)}
              </span>
              <span className="inline-flex items-center gap-1 text-cream/80">
                <Clock className="h-3 w-3" /> {hours} {t('common.hours')}
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold leading-tight mb-2 group-hover:text-accent-300 transition-colors duration-300">
              {tr?.title}
            </h3>
            {locale === 'ar' && trip.meetingPoint && (
              <div className="flex items-center gap-1.5 text-xs text-cream/75 mb-3">
                <MapPin className="h-3 w-3" />
                <span className="line-clamp-1">{trip.meetingPoint}</span>
              </div>
            )}
            <div className="flex items-end justify-between pt-3 border-t border-cream/15">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-cream/60">{t('common.from')}</div>
                <div className="font-serif text-2xl font-bold text-accent">
                  <Price amount={price} from="EGP" />
                </div>
                <div className="text-[10px] text-cream/60">{t('common.perPerson')}</div>
                <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-accent/15 border border-accent/30 text-[9px] font-bold uppercase tracking-wider text-accent">
                  <span className="w-1 h-1 rounded-full bg-accent" />
                  {L(locale, {
                    ar: 'تقسيط متاح · EasyCash',
                    en: 'Installments · EasyCash',
                    de: 'Raten · EasyCash',
                    ru: 'Рассрочка · EasyCash',
                    it: 'Rate · EasyCash',
                  })}
                </div>
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1 pb-1">
                {t('common.bookNow')}
                <ArrowUpRight className="h-4 w-4 rtl:rotate-90" />
              </div>
            </div>
          </div>
        </div>
      </Link>
      {/* Favorite (heart) — sibling of the Link so the <button> isn't nested
          inside an <a>. Positioned over the same card via absolute. */}
      <div className="absolute top-4 end-4 z-10">
        <FavoriteButton tripId={trip.id} size="md" />
      </div>
    </motion.div>
  );
}
