import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Lotus Sharm Tourism',
  description: 'Page not found',
  robots: { index: false, follow: false },
};

/**
 * Root-level 404 fallback. Renders for misses that fall outside any locale
 * segment (and as the ultimate boundary for notFound()). It has no locale
 * context here, so copy is bilingual AR/EN and links point at the default
 * locale. Locale-prefixed misses (e.g. /ar/reviews) are handled by the
 * branded, fully-localized catch-all under [locale]/(public).
 */
export default function RootNotFound() {
  return (
    <main
      dir="rtl"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a2828 0%, #0d3a3a 50%, #0a2828 100%)',
        color: '#f7f1e3',
        fontFamily: 'var(--font-cairo), system-ui, sans-serif',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 560 }}>
        <div
          style={{
            fontSize: 'clamp(96px, 22vw, 180px)',
            fontWeight: 900,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #d9bf86 0%, #c9a86a 50%, #a88a52 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: '0.5rem',
          }}
        >
          404
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 700, margin: '0 0 0.5rem' }}>
          الصفحة غير موجودة
        </h1>
        <p style={{ fontSize: '1rem', opacity: 0.7, margin: '0 0 0.35rem' }} dir="ltr">
          This page could not be found.
        </p>
        <p style={{ fontSize: '0.95rem', opacity: 0.8, margin: '0 0 2rem' }}>
          لكن لسه فيه رحلات كتير في انتظارك — تعالى نوصلك للمكان الصح.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="/ar"
            style={{
              display: 'inline-block',
              padding: '0.8rem 1.6rem',
              borderRadius: 12,
              background: '#c9a86a',
              color: '#0a2828',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            الرئيسية · Home
          </a>
          <a
            href="/ar/trips"
            style={{
              display: 'inline-block',
              padding: '0.8rem 1.6rem',
              borderRadius: 12,
              background: 'rgba(247,241,227,0.1)',
              border: '1px solid rgba(247,241,227,0.25)',
              color: '#f7f1e3',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            الرحلات · Trips
          </a>
          <a
            href="https://wa.me/201090767278"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '0.8rem 1.6rem',
              borderRadius: 12,
              background: '#25D366',
              color: '#fff',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
