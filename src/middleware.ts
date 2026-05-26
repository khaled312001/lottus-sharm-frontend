import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intl = createMiddleware(routing);

// Catch malformed root-level paths Google sometimes crawls (corrupted shared
// links like `/&`, `/$`, `/?`) and 301 them to canonical `/`. Returns a real
// 301 instead of a 404, so Google drops them from the index cleanly.
const MALFORMED_ROOT = /^\/[^a-zA-Z0-9]$/;

export default function middleware(req: NextRequest) {
  if (MALFORMED_ROOT.test(req.nextUrl.pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url, 301);
  }
  return intl(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
