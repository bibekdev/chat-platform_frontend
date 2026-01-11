import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CookieOptions {
  expires?: Date | number; // Date object or days from now
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Set a cookie
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  if (typeof document === 'undefined') return;

  const {
    expires,
    path = '/',
    domain,
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'lax'
  } = options;

  let expiresStr = '';
  if (expires) {
    if (typeof expires === 'number') {
      const date = new Date();
      date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000);
      expiresStr = `; expires=${date.toUTCString()}`;
    } else {
      expiresStr = `; expires=${expires.toUTCString()}`;
    }
  }

  const domainStr = domain ? `; domain=${domain}` : '';
  const secureStr = secure ? '; secure' : '';
  const sameSiteStr = `; samesite=${sameSite}`;

  document.cookie = `${name}=${encodeURIComponent(
    value
  )}${expiresStr}; path=${path}${domainStr}${secureStr}${sameSiteStr}`;
}

/**
 * Get a cookie value
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
    }
  }

  return null;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string, path = '/'): void {
  if (typeof document === 'undefined') return;
  setCookie(name, '', { expires: new Date(0), path });
}

export function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
