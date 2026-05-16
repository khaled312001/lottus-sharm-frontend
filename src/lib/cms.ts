// Helper to fetch CMS overrides for public pages.
// Returns null if the page doesn't exist or backend is unreachable — pages
// then fall back to their hardcoded copy.

import { api } from './api';
import { localeToApiCode } from './utils';

export interface CMSPage {
  slug: string;
  heroImage?: { id: number; url: string; thumbnailUrl?: string | null; mediumUrl?: string | null; altAr?: string | null; altEn?: string | null } | null;
  tr?: {
    title: string;
    subtitle?: string | null;
    content: string;
    metaTitle?: string | null;
    metaDesc?: string | null;
  };
}

export async function fetchCMSPage(slug: string, locale: string): Promise<CMSPage | null> {
  try {
    const res = await api.get<CMSPage>(`/public/pages/${slug}?locale=${localeToApiCode(locale)}`);
    return res?.tr ? res : null;
  } catch {
    return null;
  }
}
