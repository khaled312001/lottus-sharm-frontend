/**
 * ISO 3166-1 alpha-2 country codes + flag emoji.
 * Display names are resolved at render time via `Intl.DisplayNames`
 * so we automatically get Arabic / English / Russian / Italian names
 * without storing a 4-translation table for 245 entries.
 */
export interface Country {
  code: string;     // ISO alpha-2
  flag: string;     // emoji flag
  dial?: string;    // optional default dial code (just for the most common ones)
}

export const COUNTRIES: Country[] = [
  { code: 'EG', flag: '🇪🇬', dial: '+20' },
  { code: 'SA', flag: '🇸🇦', dial: '+966' },
  { code: 'AE', flag: '🇦🇪', dial: '+971' },
  { code: 'KW', flag: '🇰🇼', dial: '+965' },
  { code: 'QA', flag: '🇶🇦', dial: '+974' },
  { code: 'BH', flag: '🇧🇭', dial: '+973' },
  { code: 'OM', flag: '🇴🇲', dial: '+968' },
  { code: 'JO', flag: '🇯🇴', dial: '+962' },
  { code: 'LB', flag: '🇱🇧', dial: '+961' },
  { code: 'SY', flag: '🇸🇾', dial: '+963' },
  { code: 'IQ', flag: '🇮🇶', dial: '+964' },
  { code: 'PS', flag: '🇵🇸', dial: '+970' },
  { code: 'YE', flag: '🇾🇪', dial: '+967' },
  { code: 'LY', flag: '🇱🇾', dial: '+218' },
  { code: 'SD', flag: '🇸🇩', dial: '+249' },
  { code: 'TN', flag: '🇹🇳', dial: '+216' },
  { code: 'DZ', flag: '🇩🇿', dial: '+213' },
  { code: 'MA', flag: '🇲🇦', dial: '+212' },
  { code: 'RU', flag: '🇷🇺', dial: '+7' },
  { code: 'UA', flag: '🇺🇦', dial: '+380' },
  { code: 'BY', flag: '🇧🇾', dial: '+375' },
  { code: 'KZ', flag: '🇰🇿', dial: '+7' },
  { code: 'UZ', flag: '🇺🇿', dial: '+998' },
  { code: 'TR', flag: '🇹🇷', dial: '+90' },
  { code: 'IT', flag: '🇮🇹', dial: '+39' },
  { code: 'DE', flag: '🇩🇪', dial: '+49' },
  { code: 'FR', flag: '🇫🇷', dial: '+33' },
  { code: 'ES', flag: '🇪🇸', dial: '+34' },
  { code: 'PT', flag: '🇵🇹', dial: '+351' },
  { code: 'NL', flag: '🇳🇱', dial: '+31' },
  { code: 'BE', flag: '🇧🇪', dial: '+32' },
  { code: 'CH', flag: '🇨🇭', dial: '+41' },
  { code: 'AT', flag: '🇦🇹', dial: '+43' },
  { code: 'GB', flag: '🇬🇧', dial: '+44' },
  { code: 'IE', flag: '🇮🇪', dial: '+353' },
  { code: 'NO', flag: '🇳🇴', dial: '+47' },
  { code: 'SE', flag: '🇸🇪', dial: '+46' },
  { code: 'DK', flag: '🇩🇰', dial: '+45' },
  { code: 'FI', flag: '🇫🇮', dial: '+358' },
  { code: 'IS', flag: '🇮🇸', dial: '+354' },
  { code: 'PL', flag: '🇵🇱', dial: '+48' },
  { code: 'CZ', flag: '🇨🇿', dial: '+420' },
  { code: 'SK', flag: '🇸🇰', dial: '+421' },
  { code: 'HU', flag: '🇭🇺', dial: '+36' },
  { code: 'RO', flag: '🇷🇴', dial: '+40' },
  { code: 'BG', flag: '🇧🇬', dial: '+359' },
  { code: 'GR', flag: '🇬🇷', dial: '+30' },
  { code: 'CY', flag: '🇨🇾', dial: '+357' },
  { code: 'MT', flag: '🇲🇹', dial: '+356' },
  { code: 'HR', flag: '🇭🇷', dial: '+385' },
  { code: 'SI', flag: '🇸🇮', dial: '+386' },
  { code: 'RS', flag: '🇷🇸', dial: '+381' },
  { code: 'BA', flag: '🇧🇦', dial: '+387' },
  { code: 'MK', flag: '🇲🇰', dial: '+389' },
  { code: 'AL', flag: '🇦🇱', dial: '+355' },
  { code: 'MD', flag: '🇲🇩', dial: '+373' },
  { code: 'LV', flag: '🇱🇻', dial: '+371' },
  { code: 'LT', flag: '🇱🇹', dial: '+370' },
  { code: 'EE', flag: '🇪🇪', dial: '+372' },
  { code: 'GE', flag: '🇬🇪', dial: '+995' },
  { code: 'AM', flag: '🇦🇲', dial: '+374' },
  { code: 'AZ', flag: '🇦🇿', dial: '+994' },
  { code: 'US', flag: '🇺🇸', dial: '+1' },
  { code: 'CA', flag: '🇨🇦', dial: '+1' },
  { code: 'MX', flag: '🇲🇽', dial: '+52' },
  { code: 'BR', flag: '🇧🇷', dial: '+55' },
  { code: 'AR', flag: '🇦🇷', dial: '+54' },
  { code: 'CL', flag: '🇨🇱', dial: '+56' },
  { code: 'CO', flag: '🇨🇴', dial: '+57' },
  { code: 'PE', flag: '🇵🇪', dial: '+51' },
  { code: 'VE', flag: '🇻🇪', dial: '+58' },
  { code: 'UY', flag: '🇺🇾', dial: '+598' },
  { code: 'EC', flag: '🇪🇨', dial: '+593' },
  { code: 'CN', flag: '🇨🇳', dial: '+86' },
  { code: 'JP', flag: '🇯🇵', dial: '+81' },
  { code: 'KR', flag: '🇰🇷', dial: '+82' },
  { code: 'HK', flag: '🇭🇰', dial: '+852' },
  { code: 'TW', flag: '🇹🇼', dial: '+886' },
  { code: 'IN', flag: '🇮🇳', dial: '+91' },
  { code: 'PK', flag: '🇵🇰', dial: '+92' },
  { code: 'BD', flag: '🇧🇩', dial: '+880' },
  { code: 'LK', flag: '🇱🇰', dial: '+94' },
  { code: 'NP', flag: '🇳🇵', dial: '+977' },
  { code: 'AF', flag: '🇦🇫', dial: '+93' },
  { code: 'IR', flag: '🇮🇷', dial: '+98' },
  { code: 'TH', flag: '🇹🇭', dial: '+66' },
  { code: 'VN', flag: '🇻🇳', dial: '+84' },
  { code: 'PH', flag: '🇵🇭', dial: '+63' },
  { code: 'ID', flag: '🇮🇩', dial: '+62' },
  { code: 'MY', flag: '🇲🇾', dial: '+60' },
  { code: 'SG', flag: '🇸🇬', dial: '+65' },
  { code: 'MN', flag: '🇲🇳', dial: '+976' },
  { code: 'AU', flag: '🇦🇺', dial: '+61' },
  { code: 'NZ', flag: '🇳🇿', dial: '+64' },
  { code: 'ZA', flag: '🇿🇦', dial: '+27' },
  { code: 'NG', flag: '🇳🇬', dial: '+234' },
  { code: 'KE', flag: '🇰🇪', dial: '+254' },
  { code: 'ET', flag: '🇪🇹', dial: '+251' },
  { code: 'GH', flag: '🇬🇭', dial: '+233' },
  { code: 'TZ', flag: '🇹🇿', dial: '+255' },
  { code: 'UG', flag: '🇺🇬', dial: '+256' },
  { code: 'SN', flag: '🇸🇳', dial: '+221' },
  { code: 'CI', flag: '🇨🇮', dial: '+225' },
  { code: 'CM', flag: '🇨🇲', dial: '+237' },
  { code: 'AO', flag: '🇦🇴', dial: '+244' },
  { code: 'MZ', flag: '🇲🇿', dial: '+258' },
  { code: 'IL', flag: '🇮🇱', dial: '+972' },
  { code: 'BR', flag: '🇧🇷', dial: '+55' },
];

// De-dupe by code (the list above is hand-curated — keep it tidy)
const seen = new Set<string>();
export const ALL_COUNTRIES = COUNTRIES.filter((c) => {
  if (seen.has(c.code)) return false;
  seen.add(c.code);
  return true;
});

const localeMap: Record<string, string> = { ar: 'ar', en: 'en', ru: 'ru', it: 'it' };

/** Localized country name. Falls back gracefully on older engines. */
export function countryName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([localeMap[locale] || 'en'], { type: 'region' }).of(code) || code;
  } catch {
    return code;
  }
}

export function getCountry(code: string): Country | undefined {
  return ALL_COUNTRIES.find((c) => c.code === code);
}
