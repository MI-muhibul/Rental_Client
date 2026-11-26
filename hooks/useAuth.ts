'use client';

import { useEffect, useRef } from 'react';
import { useSession, signOut, signIn } from '@/lib/auth-client';
import { syncUserToBackend } from '@/lib/user-sync';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  photo?: string | null;
  phone?: string | null;
  address?: string | null;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

export function useAuth() {
  const { data: session, isPending, error } = useSession();
  const syncedUserIdRef = useRef<string | null>(null);

  const user = (session?.user as AuthUser) || null;
  const isSuperAdmin = user?.email?.toLowerCase() === 'admin@heavyrent.com';
  const role = isSuperAdmin ? 'admin' : ((user?.role as string) || 'customer');
  const loading = isPending;

  useEffect(() => {
    if (!user?.id || !user?.email) return;
    if (syncedUserIdRef.current === user.id) return;

    const storageKey = `hr_synced_${user.id}`;
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem(storageKey)) {
        syncedUserIdRef.current = user.id;
        return;
      }
    } catch {
      // ignore storage errors
    }

    syncedUserIdRef.current = user.id;
    syncUserToBackend({
      id: user.id,
      email: user.email,
      name: user.name || '',
      photo: user.image || user.photo || '',
      avatar: user.image || user.photo || '',
      role,
    }).then((res) => {
      if (res) {
        try {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(storageKey, '1');
          }
        } catch {
          // ignore
        }
      }
    });
  }, [user?.id, user?.email, user?.name, user?.image, user?.photo, role]);

  return {
    user: user ? ({ ...user, role: isSuperAdmin ? 'admin' : (user.role || 'customer') } as AuthUser) : null,
    role,
    loading,
    session,
    error,
    signOut,
    signIn,
    isAuthenticated: !!user,
  };
}

export default useAuth;
