import { NextResponse } from 'next/server';
import { getTokenFromCookies } from '@/lib/auth/server';

// Get token from cookie OR Authorization header
export async function getAuthToken(request: Request): Promise<string | null> {
  // Try cookie first
  const cookieToken = await getTokenFromCookies();
  if (cookieToken) return cookieToken;

  // Try Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}
