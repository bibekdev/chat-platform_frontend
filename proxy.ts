import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8080/api/v1';

// Routes that require authentication
const PROTECTED_ROUTES = ['/conversations', '/settings', '/profile'];

// Routes that should redirect to home if already authenticated
const AUTH_ROUTES = ['/login', '/register'];

interface TokenPayload {
  sub: string;
  email: string;
  type: string;
  exp: number;
  iat: number;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * Decode JWT payload without verification (just to check expiration)
 */
function decodeJwtPayload(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Check if token is expired or about to expire (within 30 seconds)
 */
function isTokenExpired(token: string, bufferSeconds = 30): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now + bufferSeconds;
}

/**
 * Refresh the access token using the refresh token
 */
async function refreshTokens(refreshToken: string): Promise<RefreshTokenResponse | null> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      console.error('[Middleware] Token refresh failed:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[Middleware] Token refresh error:', error);
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('chat_accessToken')?.value;
  const refreshToken = request.cookies.get('chat_refreshToken')?.value;

  // Check if this is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if this is an auth route (login/register)
  const isAuthRoute = AUTH_ROUTES.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If no tokens at all and trying to access protected route, redirect to login
  if (isProtectedRoute && !accessToken && !refreshToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If has valid access token and trying to access auth routes, redirect to home
  if (isAuthRoute && accessToken && !isTokenExpired(accessToken)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check if we need to refresh the token
  if (accessToken && refreshToken && isTokenExpired(accessToken)) {
    console.log('[Middleware] Access token expired, attempting refresh...');

    const newTokens = await refreshTokens(refreshToken);

    if (newTokens) {
      console.log('[Middleware] Token refresh successful');

      // Create response and set new cookies
      const response = NextResponse.next();

      // Set new access token
      response.cookies.set('chat_accessToken', newTokens.accessToken, {
        httpOnly: false, // Needs to be readable by client-side JS
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: newTokens.expiresIn
      });

      // Set new refresh token
      response.cookies.set('chat_refreshToken', newTokens.refreshToken, {
        httpOnly: false, // Needs to be readable by client-side JS
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      });

      return response;
    } else {
      // Refresh failed - if on protected route, redirect to login
      if (isProtectedRoute) {
        // Clear invalid cookies
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('chat_accessToken');
        response.cookies.delete('chat_refreshToken');
        return response;
      }
    }
  }

  // No access token but has refresh token - try to get new tokens
  if (!accessToken && refreshToken && isProtectedRoute) {
    console.log('[Middleware] No access token, attempting refresh...');

    const newTokens = await refreshTokens(refreshToken);

    if (newTokens) {
      console.log('[Middleware] Token refresh successful');

      const response = NextResponse.next();

      response.cookies.set('chat_accessToken', newTokens.accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: newTokens.expiresIn
      });

      response.cookies.set('chat_refreshToken', newTokens.refreshToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60
      });

      return response;
    } else {
      // Refresh failed, redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('chat_accessToken');
      response.cookies.delete('chat_refreshToken');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (if you have any)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
