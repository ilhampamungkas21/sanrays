"use client";

const TOKEN_KEY = 'sanrays_auth_token';
const USER_KEY = 'sanrays_auth_user';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Get auth token from storage
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

// Get user from storage
export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// Save auth data to storage
export function saveAuthData(user: AuthUser, token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Clear auth data from storage
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Get current auth state
export function getAuthState(): AuthState {
  const token = getAuthToken();
  const user = getStoredUser();
  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
  };
}

// Login function
export async function login(email: string, password: string): Promise<AuthState> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login gagal');
  }

  saveAuthData(data.user, data.token);

  return {
    user: data.user,
    token: data.token,
    isAuthenticated: true,
  };
}

// Register function
export async function register(name: string, email: string, password: string): Promise<AuthState> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Registrasi gagal');
  }

  saveAuthData(data.user, data.token);

  return {
    user: data.user,
    token: data.token,
    isAuthenticated: true,
  };
}

// Logout function
export async function logout(): Promise<void> {
  try {
    // Call logout API
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
  } catch (err) {
    // Ignore API errors, still clear local data
  }

  // Always clear local storage and redirect
  clearAuthData();
  window.location.href = '/login';
}

// Fetch with auth header
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

// Get current user from API
export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const response = await authFetch('/api/auth/me');
    if (!response.ok) return null;

    const data = await response.json();
    return data.user;
  } catch {
    return null;
  }
}
