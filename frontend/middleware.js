import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect tenant, owner, and admin routes
  if (pathname.startsWith('/tenant') || pathname.startsWith('/owner') || pathname.startsWith('/admin')) {
    // Note: Since JWT is stored in localStorage on the client, our client-side AuthProvider and ProtectedRoute
    // components perform the primary verification and role redirection. 
    // This middleware passes through while setting custom headers if needed.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/tenant/:path*', '/owner/:path*', '/admin/:path*'],
};
