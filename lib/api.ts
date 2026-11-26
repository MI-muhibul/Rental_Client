import { authClient } from './auth-client';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Retrieves the Better Auth JWT via `authClient.token()` and returns
 * an `Authorization: Bearer <token>` header object when a session exists.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const { data, error } = await authClient.token();
    if (!error && data?.token) {
      return { Authorization: `Bearer ${data.token}` };
    }
  } catch {
    // Ignore when unauthenticated or outside a browser session
  }
  return {};
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
