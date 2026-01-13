import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const adminRole = request.cookies.get('admin_role')?.value;
  const protectedPaths = [
    '/admin/admins',
    '/admin/packages',
    '/admin/promo-codes'
  ];
  const { pathname } = request.nextUrl;
  if (protectedPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    // If cookie is missing, don't hard-block navigation.
    // Client-side pages already verify role via Supabase.
    if (adminRole && adminRole !== 'superadmin') {
      return NextResponse.redirect(new URL('/admin/bookings', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/admins',
    '/admin/packages',
    '/admin/promo-codes',
    // и все вложенные
    '/admin/admins/:path*',
    '/admin/packages/:path*',
    '/admin/promo-codes/:path*'
  ]
}; 