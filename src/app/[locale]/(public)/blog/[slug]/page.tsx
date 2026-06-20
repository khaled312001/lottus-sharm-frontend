import { permanentRedirect } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { api } from '@/lib/api';
import type { BlogPostDTO } from '@/types/api';
import { localeToApiCode, L } from '@/lib/utils';
import { pickCoverImage, injectSectionImages, stripLeadMeta } from '@/lib/blog-images';
import { Calendar, Clock, ArrowRight, Home, BookOpen } from 'lucide-react';
import { JsonLd } from '@/components/seo/json-ld';
import { SITE_URL, LOCALES, altsFor, buildBreadcrumbLd, crumbLabel } from '@/lib/seo';
import { Link } from '@/i18n/routing';
import { findStaticArticle, STATIC_ARTICLES } from './static-articles';

// ─── Static article or API post ─────────────────────────────────────
async function fetchPost(slug: string, locale: string): Promise<BlogPostDTO | null> {
  const decodedSlug = decodeURIComponent(slug);
  try {
    return await api.get<BlogPostDTO>(`/public/blog/${decodedSlug}?locale=${localeToApiCode(locale)}`);
  } catch {
    return null;
  }
}

function resolveContent(slug: string, locale: string) {
  // 1. Try static articles first (always available, no API dependency)
  const decodedSlug = decodeURIComponent(slug);
  const sa = findStaticArticle(decodedSlug);
  if (sa) {
    const tr = sa.tr[locale] || sa.tr.en || sa.tr.ar;
    return {
      source: 'static' as const,
      title: tr.title,
      excerpt: tr.excerpt,
      metaTitle: tr.metaTitle,
      metaDesc: tr.metaDesc,
      keywords: tr.keywords,
      content: tr.content,
      coverImage: sa.coverImage,
      publishedAt: sa.publishedAt,
      readTime: sa.readTime,
      authorName: 'Lotus Sharm',
      slug: sa.slug,
      tags: sa.tags,
    };
  }
  return null;
}

// ─── Metadata ───────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug, locale } = await params;
  const slug = decodeURIComponent(rawSlug);
  const path = `/blog/${slug}`;
  const url = `${SITE_URL}/${locale}${path}`;

  // Static article
  const sa = resolveContent(slug, locale);
  if (sa) {
    return {
      title: { absolute: sa.metaTitle },
      description: sa.metaDesc,
      keywords: sa.keywords,
      alternates: { canonical: url, languages: altsFor(path) },
      openGraph: {
        type: 'article',
        url,
        title: sa.metaTitle,
        description: sa.metaDesc,
        siteName: 'Lotus Sharm Tourism',
        images: [{ url: `${SITE_URL}${sa.coverImage}`, width: 1200, height: 630 }],
        publishedTime: sa.publishedAt,
      },
      twitter: {
        card: 'summary_large_image',
        title: sa.metaTitle,
        description: sa.metaDesc,
        images: [`${SITE_URL}${sa.coverImage}`],
      },
      robots: { index: true, follow: true },
    };
  }

  // API post
  const post = await fetchPost(slug, locale);
  if (!post) return { title: 'Post not found' };
  return {
    title: post.tr?.metaTitle || post.tr?.title,
    description: post.tr?.metaDesc || post.tr?.excerpt,
    alternates: { canonical: url, languages: altsFor(path) },
    openGraph: {
      type: 'article',
      url,
      title: post.tr?.title,
      description: post.tr?.excerpt,
      images: post.coverImage?.url ? [post.coverImage.url] : [],
    },
    robots: { index: true, follow: true },
  };
}

// ─── Page ───────────────────────────────────────────────────────────
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug: rawSlug, locale } = await params;
  setRequestLocale(locale);
  const slug = decodeURIComponent(rawSlug);

  const isAr = locale === 'ar';
  const sa = resolveContent(slug, locale);

  // Static article
  if (sa) {
    const articleLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: sa.title,
      description: sa.excerpt,
      image: `${SITE_URL}${sa.coverImage}`,
      datePublished: sa.publishedAt,
      dateModified: sa.publishedAt,
      author: {
        '@type': 'Organization',
        name: 'Lotus Sharm Tourism',
        url: SITE_URL,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Lotus Sharm Tourism',
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.jpg` },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/${locale}/blog/${slug}`,
      },
    };

    const breadcrumbLd = buildBreadcrumbLd([
      { name: crumbLabel('home', locale), url: `${SITE_URL}/${locale}` },
      { name: crumbLabel('blog', locale), url: `${SITE_URL}/${locale}/blog` },
      { name: sa.title, url: `${SITE_URL}/${locale}/blog/${slug}` },
    ]);

    // Related articles (other static articles)
    const related = STATIC_ARTICLES.filter((a) => a.slug !== slug);

    return (
      <>
        <JsonLd data={articleLd} id="ld-article" />
        <JsonLd data={breadcrumbLd} id="ld-breadcrumb" />

        {/* Breadcrumb nav */}
        <nav
          className="container pt-6 pb-2 text-sm text-muted-foreground"
          aria-label="Breadcrumb"
        >
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link
                href="/"
                className="inline-flex items-center gap-1 hover:text-accent transition-colors"
              >
                <Home className="h-3.5 w-3.5" />
                {crumbLabel('home', locale)}
              </Link>
            </li>
            <li aria-hidden="true" className="text-accent/50">
              /
            </li>
            <li>
              <Link
                href="/blog"
                className="hover:text-accent transition-colors"
              >
                {crumbLabel('blog', locale)}
              </Link>
            </li>
            <li aria-hidden="true" className="text-accent/50">
              /
            </li>
            <li className="text-primary font-medium truncate max-w-[200px] sm:max-w-none">
              {sa.title}
            </li>
          </ol>
        </nav>

        <article className="container py-6 md:py-10 max-w-4xl">
          {/* Cover */}
          <div className="relative aspect-[16/9] mb-8 rounded-2xl overflow-hidden card-shadow">
            <Image
              src={sa.coverImage}
              alt={sa.title}
              fill
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/50 via-transparent to-transparent" />
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4 leading-tight text-balance">
            {sa.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b border-accent/15">
            <span className="inline-flex items-center gap-1.5 font-medium text-accent">
              <BookOpen className="h-4 w-4" />
              Lotus Sharm
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-accent" />{' '}
              {new Date(sa.publishedAt).toLocaleDateString(
                isAr ? 'ar-EG' : locale === 'de' ? 'de-DE' : locale === 'ru' ? 'ru-RU' : locale === 'it' ? 'it-IT' : 'en',
              )}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-accent" /> {sa.readTime}{' '}
              {L(locale, {
                ar: 'دقائق قراءة',
                en: 'min read',
                de: 'Min. Lesezeit',
                ru: 'мин. чтения',
                it: 'min di lettura',
              })}
            </span>
          </div>

          {/* Content */}
          <div
            className="prose prose-lg max-w-none
              prose-headings:font-serif prose-headings:text-primary prose-headings:font-bold
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:leading-relaxed prose-p:text-foreground/90
              prose-a:text-accent prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
              prose-li:text-foreground/85
              prose-strong:text-primary
              prose-table:border-collapse prose-th:bg-primary/5 prose-th:p-3 prose-td:p-3 prose-td:border prose-td:border-accent/15
              prose-hr:border-accent/20"
            dangerouslySetInnerHTML={{ __html: sa.content }}
          />

          {/* Tags */}
          {sa.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-accent/15">
              <div className="flex flex-wrap gap-2">
                {sa.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent-700 text-xs font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related articles */}
          {related.length > 0 && (
            <section className="mt-12 pt-8 border-t border-accent/15">
              <h2 className="font-serif text-2xl font-bold text-primary mb-6">
                {L(locale, {
                  ar: 'مقالات ذات صلة',
                  en: 'Related Articles',
                  de: 'Verwandte Artikel',
                  ru: 'Похожие статьи',
                  it: 'Articoli correlati',
                })}
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                {related.map((r) => {
                  const rTr = r.tr[locale] || r.tr.en || r.tr.ar;
                  return (
                    <Link
                      key={r.slug}
                      href={`/blog/${r.slug}`}
                      className="group block"
                    >
                      <article className="bg-white rounded-2xl overflow-hidden border border-accent/15 card-shadow hover:card-shadow-gold hover:-translate-y-1 transition-all duration-300">
                        <div className="aspect-[16/9] relative bg-muted overflow-hidden">
                          <Image
                            src={r.coverImage}
                            alt={rTr.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                        <div className="p-5">
                          <h3 className="font-serif font-bold text-lg text-primary group-hover:text-accent transition-colors leading-snug line-clamp-2">
                            {rTr.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {rTr.excerpt}
                          </p>
                          <span className="mt-3 inline-flex items-center gap-1 text-accent text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                            {L(locale, {
                              ar: 'اقرأ المزيد',
                              en: 'Read more',
                              de: 'Weiterlesen',
                              ru: 'Подробнее',
                              it: 'Leggi di più',
                            })}
                            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                          </span>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="mt-12 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-900 text-cream p-8 md:p-10 text-center overflow-hidden relative">
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-accent/15 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-accent/10 blur-3xl" />
            <div className="relative">
              <h3 className="font-serif text-2xl md:text-3xl font-bold mb-3">
                {L(locale, {
                  ar: 'جاهز تحجز رحلتك؟',
                  en: 'Ready to Book?',
                  de: 'Bereit zu buchen?',
                  ru: 'Готовы бронировать?',
                  it: 'Pronto a prenotare?',
                })}
              </h3>
              <p className="opacity-85 mb-6 max-w-lg mx-auto">
                {L(locale, {
                  ar: 'تصفح رحلاتنا واحجز أونلاين أو كلمنا على واتساب. خبرة 13+ سنة وأسعار مميزة.',
                  en: 'Browse our tours and book online or message us on WhatsApp. 13+ years experience and competitive prices.',
                  de: 'Durchsuchen Sie unsere Touren und buchen Sie online oder kontaktieren Sie uns per WhatsApp.',
                  ru: 'Просмотрите наши туры и забронируйте онлайн или напишите нам в WhatsApp.',
                  it: 'Sfoglia i nostri tour e prenota online o contattaci su WhatsApp.',
                })}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/trips"
                  className="inline-flex items-center gap-2 bg-accent text-primary font-bold px-6 py-3 rounded-xl shadow-lg shadow-accent/30 hover:bg-accent-400 hover:-translate-y-0.5 transition-all"
                >
                  {L(locale, {
                    ar: 'تصفح الرحلات',
                    en: 'Browse Tours',
                    de: 'Touren ansehen',
                    ru: 'Все туры',
                    it: 'Vedi tour',
                  })}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border-2 border-cream/40 text-cream font-semibold px-6 py-3 rounded-xl hover:bg-cream hover:text-primary transition-all"
                >
                  {L(locale, {
                    ar: 'تواصل معنا',
                    en: 'Contact Us',
                    de: 'Kontakt',
                    ru: 'Контакты',
                    it: 'Contattaci',
                  })}
                </Link>
              </div>
            </div>
          </section>
        </article>
      </>
    );
  }

  // ─── API blog post ──────────────────────────────────────────────
  const post = await fetchPost(slug, locale);
  if (!post) permanentRedirect(`/${locale}/blog`);

  const coverSrc = post.coverImage?.url || pickCoverImage(post.slug);
  const content = injectSectionImages(stripLeadMeta(post.tr?.content || ''), post.slug);

  const breadcrumbLd = buildBreadcrumbLd([
    { name: crumbLabel('home', locale), url: `${SITE_URL}/${locale}` },
    { name: crumbLabel('blog', locale), url: `${SITE_URL}/${locale}/blog` },
    { name: post.tr?.title || slug, url: `${SITE_URL}/${locale}/blog/${slug}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbLd} id="ld-breadcrumb" />
      <article className="container py-10 max-w-3xl">
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-primary mb-4 leading-tight">
          {post.tr?.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
          {post.author && (
            <span className="font-medium">{post.author.name}</span>
          )}
          {post.publishedAt && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-accent" />{' '}
              {new Date(post.publishedAt).toLocaleDateString(
                locale === 'ar' ? 'ar-EG' : 'en',
              )}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-accent" /> {post.readTime} min
          </span>
        </div>
        <div className="relative aspect-[16/9] mb-8 rounded-2xl overflow-hidden card-shadow">
          <Image
            src={coverSrc}
            alt={post.tr?.title || ''}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>
        <div
          className="prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </article>
    </>
  );
}
