import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const adminRole = request.cookies.get('admin_role')?.value;
  const { pathname } = request.nextUrl;

  if (!adminRole || adminRole === 'superadmin') {
    return NextResponse.next();
  }

  if (pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/bookings', request.url));
  }

  const superadminOnly = [
    '/admin/admins',
    '/admin/packages',
    '/admin/promo-codes',
    '/admin/extra-items',
    '/admin/users',
    '/admin/ads',
  ];
  if (superadminOnly.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.redirect(new URL('/admin/bookings', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/admins/:path*',
    '/admin/packages/:path*',
    '/admin/promo-codes/:path*',
    '/admin/extra-items',
    '/admin/extra-items/:path*',
    '/admin/users',
    '/admin/users/:path*',
    '/admin/ads',
    '/admin/ads/:path*',
  ],
};
