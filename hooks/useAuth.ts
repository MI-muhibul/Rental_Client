'use client';

import { useSession, signOut, signIn } from '@/lib/auth-client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

export function useAuth() {
  const { data: session, isPending, error } = useSession();

  const user = (session?.user as AuthUser) || null;
  const role = (user?.role as string) || 'customer';
  const loading = isPending;

  return {
    user,
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
