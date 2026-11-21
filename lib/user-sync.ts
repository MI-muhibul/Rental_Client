import { API_BASE_URL } from './api';

export interface SyncUserData {
  id?: string;
  email: string;
  name?: string;
  photo?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  role?: string;
}

/**
 * Synchronizes an authenticated user profile to the backend MongoDB users collection
 * via Express POST /users.
 */
export async function syncUserToBackend(userData: SyncUserData) {
  try {
    const payload = {
      email: userData.email,
      name: userData.name || '',
      photo: userData.photo || userData.avatar || '',
      avatar: userData.photo || userData.avatar || '',
      phone: userData.phone || '',
      address: userData.address || '',
      id: userData.id || '',
      role: userData.role || 'customer',
    };

    const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn('[UserSync] Backend sync responded with non-200 status:', response.status);
    } else {
      console.log('[UserSync] User successfully synced with backend database.');
    }

    return await response.json().catch(() => ({}));
  } catch (err: any) {
    // Non-blocking catch to ensure frontend auth flow completes even if backend is offline
    console.error('[UserSync Error] Could not sync user to backend server:', err.message);
    return null;
  }
}
