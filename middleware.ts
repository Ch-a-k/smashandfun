import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const adminRole = request.cookies.get('admin_role')?.value;
  const protectedPaths = [
    '/admin',
    '/admin/admins',
    '/admin/packages',
    '/admin/promo-codes'
  ];
  const { pathname } = request.nextUrl;
  if (protectedPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    if (adminRole !== 'superadmin') {
      return NextResponse.redirect(new URL('/admin/bookings', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/admins',
    '/admin/packages',
    '/admin/promo-codes',
    // и все вложенные
    '/admin/',
    '/admin/admins/:path*',
    '/admin/packages/:path*',
    '/admin/promo-codes/:path*'
  ]
}; 