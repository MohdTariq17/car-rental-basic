import { verifyToken } from './app/util/jwt';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Routes that don't require authentication
  const publicRoutes = [
    '/register',
    '/api/v1/auth',
    '/_next',
    '/favicon.ico',
  ];
  
  // Check if the route is public (excluding root for special handling)
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route) || pathname === route
  );
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Get token from multiple sources
  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.replace('Bearer ', '');
  const tokenFromCookie = request.cookies.get('authToken')?.value;
  const token = tokenFromHeader || tokenFromCookie;
  
  // Special handling for root path (login page)
  if (pathname === '/') {
    if (token) {
      try {
        await verifyToken(token);
        // User is authenticated, redirect to correct dashboard path
        return NextResponse.redirect(new URL('/', request.url));
      } catch (error) {
        // Invalid token, allow access to login page
        const response = NextResponse.next();
        response.cookies.delete('authToken');
        return response;
      }
    }
    // No token, allow access to login page
    return NextResponse.next();
  }
  
  // For all other routes, require authentication
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { message: 'Access denied. No token provided.' },
        { status: 401 }
      );
    }
    
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  try {
    const payload = await verifyToken(token);
    
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId);
    response.headers.set('x-user-email', payload.email);
    
    return response;
  } catch (error) {
    console.error('Token verification failed:', error);
    
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('authToken');
    
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}