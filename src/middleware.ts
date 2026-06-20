import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intl = createMiddleware(routing);

// Catch malformed root-level paths Google sometimes crawls (corrupted shared
// links like `/&`, `/$`, `/?`) and 301 them to canonical `/`. Returns a real
// 301 instead of a 404, so Google drops them from the index cleanly.
const MALFORMED_ROOT = /^\/[^a-zA-Z0-9]$/;

export default function middleware(req: NextRequest) {
  // ── 1. www → bare domain (301 permanent) ──────────────────────────
  // Runs at the edge BEFORE Next.js route handling, so it's a single hop
  // instead of going through next.config redirects which run later.
  const host = req.headers.get('host') || '';
  if (host.startsWith('www.')) {
    const url = req.nextUrl.clone();
    url.host = host.replace(/^www\./, '');
    url.port = '';
    return NextResponse.redirect(url, 301);
  }

  // ── 2. Malformed root paths → clean root ──────────────────────────
  if (MALFORMED_ROOT.test(req.nextUrl.pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url, 301);
  }

  // ── 3. next-intl locale routing ───────────────────────────────────
  return intl(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
