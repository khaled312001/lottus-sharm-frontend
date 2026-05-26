'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Meta (Facebook) Pixel route-change tracker.
 *
 * The base pixel script (in the root layout `<head>`) fires `PageView` once
 * on hard page load. Next.js App Router uses client-side navigation for
 * in-app links, so we need to refire `PageView` whenever the pathname
 * changes — this component does exactly that. Skips the first mount because
 * the base script already counted that hit.
 */
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq?: (...args: any[]) => void;
  }
}

export function MetaPixelRouteTracker() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [pathname]);

  return null;
}
