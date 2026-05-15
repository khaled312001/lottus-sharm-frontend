export type ApiLocale = 'AR' | 'EN' | 'RU' | 'IT';

export interface MediaDTO {
  id: number;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  thumbnailUrl?: string | null;
  mediumUrl?: string | null;
  width?: number | null;
  height?: number | null;
  altAr?: string | null;
  altEn?: string | null;
}

export interface TripTranslationDTO {
  locale: ApiLocale;
  title: string;
  shortDesc: string;
  longDesc: string;
  metaTitle?: string | null;
  metaDesc?: string | null;
}

export interface TripHighlightDTO {
  id: number;
  order: number;
  translations: Array<{ locale: ApiLocale; text: string }>;
}

export interface TripBulletDTO {
  id: number;
  type: 'INCLUDE' | 'EXCLUDE' | 'BRING';
  order: number;
  translations: Array<{ locale: ApiLocale; text: string }>;
}

export interface TripGalleryItem {
  id: number;
  order: number;
  media: MediaDTO;
}

export interface TripDTO {
  id: number;
  slug: string;
  category: 'SEA' | 'DESERT' | 'CITY' | 'DIVING' | 'EVENTS' | 'SAFARI';
  durationMinutes: number;
  startTime?: string | null;
  scheduleType: 'DAILY' | 'WEEKLY' | 'CUSTOM';
  meetingPoint?: string | null;
  priceLocalEGP: string;
  priceForeignUSD: string;
  childDiscount: number;
  isFeatured: boolean;
  isActive: boolean;
  heroImage?: MediaDTO | null;
  translations: TripTranslationDTO[];
  highlights: TripHighlightDTO[];
  bullets: TripBulletDTO[];
  gallery: TripGalleryItem[];
  tr?: TripTranslationDTO | null;
}

export interface SiteSettingsDTO {
  companyNameAr: string;
  companyNameEn: string;
  companyNameRu: string;
  companyNameIt: string;
  taglineAr: string;
  taglineEn: string;
  taglineRu: string;
  taglineIt: string;
  phone: string;
  whatsapp: string;
  email?: string | null;
  addressAr?: string | null;
  addressEn?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
  bankName?: string | null;
  bankAccount?: string | null;
  vodafoneCash?: string | null;
  instaPay?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor: string;
  accentColor: string;
  yearsExperience: number;
}

export interface BookingDTO {
  id: number;
  reference: string;
  total: string;
  currency: 'EGP' | 'USD';
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';
  trip?: TripDTO;
  customer?: { fullName: string; email: string; phone: string };
}

export interface BlogPostDTO {
  id: number;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string | null;
  readTime: number;
  coverImage?: MediaDTO | null;
  author?: { name: string };
  translations: Array<{ locale: ApiLocale; title: string; excerpt: string; content: string; metaTitle?: string | null; metaDesc?: string | null }>;
  tr?: BlogPostDTO['translations'][number];
}
