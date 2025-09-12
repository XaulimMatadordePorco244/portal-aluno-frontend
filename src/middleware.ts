// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('MIDDLEWARE FOI EXECUTADO NA ROTA:', request.nextUrl.pathname);

  const token = request.cookies.get('auth_token')?.value;
  const isTryingToAccessDashboard = request.nextUrl.pathname.startsWith('/dashboard');

  if (!token && isTryingToAccessDashboard) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};