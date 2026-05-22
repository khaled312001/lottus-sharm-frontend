'use client';

import Script from 'next/script';

// Facebook reviews are managed externally via Elfsight (no DB / admin needed).
// The platform.js loader hydrates any .elfsight-app-* container on the page.
export function FacebookReviewsWidget() {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-[#f0f2f5] via-white to-[#f0f2f5] overflow-x-clip">
      <div className="container overflow-x-clip">
        <Script src="https://elfsightcdn.com/platform.js" strategy="afterInteractive" />
        <div
          className="elfsight-app-4c24bc2a-ba4b-414c-b6bc-b8a73e36a3bc w-full max-w-full overflow-x-clip"
          data-elfsight-app-lazy
        />
      </div>
    </section>
  );
}
