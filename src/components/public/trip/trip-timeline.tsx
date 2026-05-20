import { Bus, Map, Compass, Fish, Utensils, Trees, Camera, Sparkles, Sun, Sunrise, Anchor, Mountain, type LucideIcon } from 'lucide-react';
import { Reveal } from '@/components/public/motion';
import type { TripTimelineStepDTO, ApiLocale } from '@/types/api';
import { L, localeToApiCode } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  bus: Bus,
  map: Map,
  compass: Compass,
  fish: Fish,
  utensils: Utensils,
  food: Utensils,
  tree: Trees,
  trees: Trees,
  camera: Camera,
  sparkles: Sparkles,
  sun: Sun,
  sunrise: Sunrise,
  anchor: Anchor,
  mountain: Mountain,
};

export function TripTimeline({ steps, locale }: { steps: TripTimelineStepDTO[]; locale: string }) {
  if (!steps || steps.length === 0) return null;
  const apiLocale = localeToApiCode(locale) as ApiLocale;
  const getTr = (s: TripTimelineStepDTO) =>
    s.translations.find((t) => t.locale === apiLocale) ||
    s.translations.find((t) => t.locale === 'EN') ||
    s.translations[0];

  return (
    <Reveal>
      <div>
        <div className="inline-flex items-center gap-2.5 mb-3">
          <span className="block w-7 h-px bg-accent" />
          <span className="text-accent uppercase tracking-[0.25em] text-[10px] sm:text-[11px] font-bold">
            {L(locale, { ar: 'سير الرحلة', en: 'Itinerary', de: 'Ablauf', ru: 'Маршрут', it: 'Itinerario' })}
          </span>
        </div>
        <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-6 leading-tight text-balance">
          {L(locale, { ar: 'ساعة بساعة طوال اليوم', en: 'Your day, hour by hour', de: 'Ihr Tag, Stunde für Stunde', ru: 'Ваш день час за часом', it: 'La tua giornata, ora per ora' })}
        </h2>

        <ol className="relative">
          {/* vertical rail */}
          <span aria-hidden className="absolute inset-y-0 start-[19px] sm:start-[23px] w-px bg-gradient-to-b from-accent/60 via-accent/30 to-accent/0" />
          {steps.map((step, i) => {
            const tr = getTr(step);
            const Icon = (step.icon && ICONS[step.icon]) || Sparkles;
            const isLast = i === steps.length - 1;
            return (
              <li key={step.id} className={`relative ps-12 sm:ps-16 ${isLast ? '' : 'pb-6 md:pb-8'}`}>
                <span
                  aria-hidden
                  className="absolute start-0 top-0 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-accent/25 to-accent/10 border border-accent/30 text-accent-700 shadow-sm shadow-accent/10"
                >
                  <Icon className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
                </span>
                <div className="bg-white rounded-2xl border border-accent/15 p-4 sm:p-5 card-shadow hover:card-shadow-gold hover:-translate-y-0.5 hover:border-accent/40 transition-all duration-300 group">
                  <div className="flex items-center justify-between gap-3 mb-1.5 flex-wrap">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-primary leading-tight">{tr?.title}</h3>
                    {step.time && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/15 border border-accent/25 text-accent-700 text-[11px] font-bold tabular-nums shadow-sm">
                        {step.time}
                      </span>
                    )}
                  </div>
                  {tr?.desc && <p className="text-sm sm:text-[15px] text-foreground/75 leading-relaxed">{tr.desc}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Reveal>
  );
}
