import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

/**
 * Next.js 16 Proxy Function
 * This replaces the legacy middleware.ts convention.
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip localization for admin, api, and static files
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

// Named export 'middleware' as fallback if proxy is not picked up
export const middleware = proxy;

// Default export is often required by Turbopack
export default proxy;

export const config = {
  matcher: ['/', '/(ar|en)/:path*', '/((?!api|_next|_vercel|admin|.*\\..*).*)'],
};
