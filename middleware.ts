import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
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
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/appointments/:path*',
    '/favorites/:path*',
    '/messages/:path*',
    '/profile/:path*',
    '/owner/:path*'
  ]
};
