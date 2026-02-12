import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const appVariant =
    process.env.APP_VARIANT || process.env.NEXT_PUBLIC_APP_VARIANT || 'all';

  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  if (appVariant === 'customer' && pathname.startsWith('/owner')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (appVariant === 'owner') {
    const ownerAllowedPublicPaths = ['/owner/login', '/signup-salon'];
    if (ownerAllowedPublicPaths.includes(pathname)) {
      return NextResponse.next();
    }

    if (pathname === '/') {
      return NextResponse.redirect(new URL('/owner/portal', request.url));
    }
    if (!pathname.startsWith('/owner')) {
      return NextResponse.redirect(new URL('/owner/portal', request.url));
    }
  }

  // First-run onboarding: send users to /welcome once.
  if (pathname === '/') {
    const onboarded = request.cookies.get('lumiere_onboarded')?.value;
    if (!onboarded) {
      return NextResponse.redirect(new URL('/welcome', request.url));
    }
  }

  const publicPaths = ['/owner/login'];
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  const protectedPaths = [
    '/dashboard',
    '/appointments',
    '/favorites',
    '/messages',
    '/profile',
    '/owner'
  ];
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    const token = request.cookies.get('lumiere_auth')?.value;
    if (!token) {
      const loginPath = pathname.startsWith('/owner') ? '/owner/login' : '/login';
      const loginUrl = new URL(loginPath, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|icon.svg|.*\\..*).*)']
};
