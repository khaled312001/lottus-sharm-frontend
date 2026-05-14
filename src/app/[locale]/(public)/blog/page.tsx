import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { api } from '@/lib/api';
import type { BlogPostDTO } from '@/types/api';
import { localeToApiCode } from '@/lib/utils';
import { Calendar, Clock } from 'lucide-react';

export const revalidate = 60;

export default async function BlogIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  let posts: BlogPostDTO[] = [];
  try {
    const res = await api.get<{ items: BlogPostDTO[] }>(
      `/public/blog?locale=${localeToApiCode(locale)}&pageSize=12`,
    );
    posts = res.items;
  } catch {
    /* ignored */
  }

  return (
    <>
      <section className="gradient-sea text-white py-14">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{t('blog.title')}</h1>
          <p className="opacity-90">{t('blog.subtitle')}</p>
        </div>
      </section>

      <section className="container py-10">
        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No posts yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => (
              <Link key={p.id} href={{ pathname: '/blog/[slug]', params: { slug: p.slug } }} className="group">
                <article className="bg-white rounded-2xl overflow-hidden border card-shadow hover:shadow-xl transition-shadow">
                  <div className="aspect-[16/9] relative bg-muted">
                    {p.coverImage?.url && (
                      <Image src={p.coverImage.mediumUrl || p.coverImage.url} alt={p.tr?.title || ''} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary">{p.tr?.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{p.tr?.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {p.publishedAt && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(p.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en')}</span>}
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {t('blog.readTime', { min: p.readTime })}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
