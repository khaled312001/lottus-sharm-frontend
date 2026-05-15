const HERO_SLIDES = [
  '/hero-slides/hero-01.jpg',
  '/hero-slides/hero-02.jpg',
  '/hero-slides/hero-03.jpg',
  '/hero-slides/hero-04.jpg',
  '/hero-slides/hero-05.jpg',
  '/hero-slides/hero-06.jpg',
  '/hero-slides/hero-07.jpg',
  '/hero-slides/hero-08.jpg',
  '/hero-slides/hero-09.jpg',
  '/hero-slides/hero-10.jpg',
  '/hero-slides/hero-11.jpg',
  '/hero-slides/hero-12.jpg',
  '/hero-slides/hero-13.jpg',
  '/hero-slides/hero-14.jpg',
  '/hero-slides/hero-15.jpg',
  '/hero-slides/hero-16.jpg',
  '/hero-slides/hero-17.jpg',
];

const SLUG_THEME: Record<string, string[]> = {
  'red-sea-diving-guide':           ['/hero-slides/hero-07.jpg', '/hero-slides/hero-13.jpg', '/hero-slides/hero-10.jpg'],
  'sharm-el-sheikh-ultimate-guide': ['/hero-slides/hero-09.jpg', '/hero-slides/hero-01.jpg', '/hero-slides/hero-05.jpg'],
  'ras-mohammed-complete-guide':    ['/hero-slides/hero-13.jpg', '/hero-slides/hero-04.jpg', '/hero-slides/hero-07.jpg'],
  'tiran-island-snorkeling-guide':  ['/hero-slides/hero-07.jpg', '/hero-slides/hero-13.jpg', '/hero-slides/hero-06.jpg'],
  'mount-sinai-sunrise-guide':      ['/hero-slides/hero-11.jpg', '/hero-slides/hero-12.jpg', '/hero-slides/hero-14.jpg'],
  'desert-safari-complete-guide':   ['/hero-slides/hero-02.jpg', '/hero-slides/hero-15.jpg', '/hero-slides/hero-16.jpg'],
  'sharm-el-sheikh-family-guide':   ['/hero-slides/hero-01.jpg', '/hero-slides/hero-04.jpg', '/hero-slides/hero-08.jpg'],
  'sharm-el-sheikh-weather-guide':  ['/hero-slides/hero-09.jpg', '/hero-slides/hero-05.jpg', '/hero-slides/hero-03.jpg'],
};

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = ((h << 5) - h + slug.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function pickCoverImage(slug: string, current?: string | null): string {
  if (current) return current;
  const themed = SLUG_THEME[slug]?.[0];
  if (themed) return themed;
  return HERO_SLIDES[hashSlug(slug) % HERO_SLIDES.length];
}

export function pickThemeImages(slug: string, count = 4): string[] {
  const themed = SLUG_THEME[slug];
  if (themed && themed.length >= count) return themed.slice(0, count);
  const base = themed ? [...themed] : [];
  const seed = hashSlug(slug);
  for (let i = 0; base.length < count; i++) {
    const candidate = HERO_SLIDES[(seed + i * 7) % HERO_SLIDES.length];
    if (!base.includes(candidate)) base.push(candidate);
  }
  return base.slice(0, count);
}

/**
 * Strip the auto-generated "last updated / author" lead paragraph
 * (e.g. <p class="lead">آخر تحديث: ...</p>) from CMS HTML so it
 * doesn't render as a badge at the top of every article.
 */
export function stripLeadMeta(html: string): string {
  if (!html) return html;
  return html
    .replace(/<p[^>]*class=["'][^"']*\blead\b[^"']*["'][^>]*>[\s\S]*?<\/p>\s*/gi, '')
    .replace(/<p[^>]*>\s*(آخر\s*تحديث|Last\s*updated)[\s\S]*?<\/p>\s*/gi, '');
}

/**
 * Inject <figure><img/></figure> blocks between H2 sections so long
 * articles aren't just walls of text. Every `every` H2 boundaries
 * gets an image (skipping the first so the cover isn't duplicated).
 */
export function injectSectionImages(html: string, slug: string, every = 2): string {
  if (!html) return html;
  const images = pickThemeImages(slug, 4);
  if (images.length === 0) return html;

  const parts = html.split(/(?=<h2\b)/i);
  if (parts.length <= 1) return html;

  let imgIdx = 0;
  const out: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    out.push(parts[i]);
    const isH2Boundary = i > 0;
    if (isH2Boundary && i % every === 0 && i < parts.length - 1) {
      const src = images[imgIdx % images.length];
      imgIdx++;
      out.push(
        `<figure class="rt-figure"><img src="${src}" alt="" loading="lazy" /></figure>`
      );
    }
  }
  return out.join('');
}
