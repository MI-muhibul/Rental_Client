import { authClient } from './auth-client';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let cachedToken: string | null = null;
let cachedTokenExpiresAt = 0;
let inFlightTokenPromise: Promise<string | null> | null = null;

export function clearAuthTokenCache() {
  cachedToken = null;
  cachedTokenExpiresAt = 0;
  inFlightTokenPromise = null;
}

/**
 * Retrieves the Better Auth JWT via `authClient.token()` (deduplicated and
 * short-cached) and returns an `Authorization: Bearer <token>` header object.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiresAt) {
    return { Authorization: `Bearer ${cachedToken}` };
  }

  if (!inFlightTokenPromise) {
    inFlightTokenPromise = (async () => {
      try {
        const { data, error } = await authClient.token();
        if (!error && data?.token) {
          cachedToken = data.token;
          cachedTokenExpiresAt = Date.now() + 30_000;
          return data.token;
        }
      } catch {
        // Ignore when unauthenticated or outside a browser session
      }
      return null;
    })().finally(() => {
      inFlightTokenPromise = null;
    });
  }

  const token = await inFlightTokenPromise;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  const authHeaders = await getAuthHeaders();

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...authHeaders,
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || errorBody.error || `Request failed with status ${response.status}`
    );
  }

  return response.json();
}
