import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Clock, MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { TripDTO } from '@/types/api';
import { useTranslations } from 'next-intl';

export function TripCard({ trip, locale }: { trip: TripDTO; locale: string }) {
  const t = useTranslations();
  const tr = trip.tr || trip.translations.find((x) => x.locale === 'EN') || trip.translations[0];
  const hours = Math.floor(trip.durationMinutes / 60);
  const price = Number(trip.priceLocalEGP);
  const isAr = locale === 'ar';
  const hero = trip.heroImage?.mediumUrl || trip.heroImage?.url || trip.gallery[0]?.media?.mediumUrl || '/placeholder.jpg';

  return (
    <Link href={`/trips/${trip.slug}`} className="group">
      <article className="overflow-hidden rounded-2xl bg-white border card-shadow hover:shadow-2xl transition-shadow">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={hero}
            alt={tr?.title || ''}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          {trip.isFeatured && (
            <Badge variant="accent" className="absolute top-3 start-3 shadow">
              <Star className="h-3 w-3 me-1 fill-current" /> Featured
            </Badge>
          )}
          <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 start-3 end-3 flex items-center justify-between text-white">
            <Badge className="bg-white/20 backdrop-blur text-white">
              {t(`trips.category.${trip.category}`)}
            </Badge>
            <div className="text-sm font-bold flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {hours} {t('common.hours')}
            </div>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {tr?.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{tr?.shortDesc}</p>
          {trip.meetingPoint && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
              <MapPin className="h-3.5 w-3.5" />
              <span className="line-clamp-1">{trip.meetingPoint}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <div className="text-[11px] text-muted-foreground">{t('common.from')}</div>
              <div className="font-bold text-primary text-lg">
                {isAr ? `${price} ج.م` : `$${Number(trip.priceForeignUSD)}`}
                <span className="text-xs text-muted-foreground font-normal"> {t('common.perPerson')}</span>
              </div>
            </div>
            <Button size="sm" variant="outline">{t('common.bookNow')}</Button>
          </div>
        </div>
      </article>
    </Link>
  );
}
