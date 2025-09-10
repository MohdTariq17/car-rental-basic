import { verifyToken } from './app/util/jwt';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Allow these routes without authentication
  const publicRoutes = [
    '/login',
    '/register',
    '/api/v1/auth', // This handles login, register, and token verification
    '/_next',
    '/favicon.ico',
    '/',
  ];
  
  // Check if the route is public
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
  
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { message: 'Access denied. No token provided.' },
        { status: 401 }
      );
    }
    
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  try {
    const payload = await verifyToken(token);
    
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId);
    response.headers.set('x-user-email', payload.email);
    
    return response;
  } catch (error) {
    console.error('Token verification failed:', error);
    
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('authToken');
    
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    return response;
  }
}