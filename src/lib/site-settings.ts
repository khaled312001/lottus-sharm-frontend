import { api } from './api';
import type { SiteSettingsDTO } from '@/types/api';

export async function getSiteSettings(): Promise<SiteSettingsDTO> {
  try {
    return await api.get<SiteSettingsDTO>('/public/settings');
  } catch {
    return {
      companyNameAr: 'لوتس شرم للسياحة',
      companyNameEn: 'Lotus Sharm Tourism',
      companyNameRu: 'Лотус Шарм',
      companyNameIt: 'Lotus Sharm',
      companyNameDe: 'Lotus Sharm Tourismus',
      taglineAr: 'اكتشف جمال شرم الشيخ مع لوتس شرم',
      taglineEn: 'Discover the Beauty of Sharm El Sheikh',
      taglineRu: 'Откройте для себя красоту Шарм-эль-Шейха',
      taglineIt: 'Scopri la bellezza di Sharm El Sheikh',
      taglineDe: 'Entdecken Sie die Schönheit von Sharm El Sheikh',
      phone: '01090767278',
      whatsapp: '201090767278',
      email: 'info@lotussharm.com',
      addressAr: null,
      facebookUrl: 'https://www.facebook.com/share/1DMY8SUNTT/',
      instagramUrl: 'https://www.instagram.com/lotus_sharm',
      tiktokUrl: 'https://www.tiktok.com/@lotus_sharm',
      youtubeUrl: 'https://youtube.com/@lotussharm',
      bankName: 'بنك أبو ظبي الإسلامي',
      bankAccount: '100001177381',
      vodafoneCash: '01090767278',
      instaPay: 'lotussharm',
      logoUrl: null,
      primaryColor: '#0891b2',
      accentColor: '#f59e0b',
      yearsExperience: 13,
    };
  }
}

export function getLocalizedName(s: SiteSettingsDTO, locale: string): string {
  switch (locale) {
    case 'ar':
      return s.companyNameAr;
    case 'ru':
      return s.companyNameRu;
    case 'it':
      return s.companyNameIt;
    case 'de':
      return s.companyNameDe || s.companyNameEn;
    default:
      return s.companyNameEn;
  }
}

export function getLocalizedTagline(s: SiteSettingsDTO, locale: string): string {
  switch (locale) {
    case 'ar':
      return s.taglineAr;
    case 'ru':
      return s.taglineRu;
    case 'it':
      return s.taglineIt;
    case 'de':
      return s.taglineDe || s.taglineEn;
    default:
      return s.taglineEn;
  }
}
