'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ForbiddenView from './ForbiddenView';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/login',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only evaluate redirection after session loading has fully finished
    if (!loading && !isAuthenticated) {
      const targetUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname || '/')}`;
      router.replace(targetUrl);
    }
  }, [loading, isAuthenticated, router, pathname, redirectTo]);

  // 1. Loading State (Prevents false redirection on reload)
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-base-100">
        <div className="relative flex items-center justify-center mb-6">
          {/* Outer rotating machined ring */}
          <div className="w-16 h-16 rounded-full border-4 border-base-300 border-t-primary animate-spin" />
          {/* Inner badge */}
          <div className="absolute font-heading font-bold text-xs text-primary uppercase tracking-widest">
            HR
          </div>
        </div>
        <div className="font-heading font-bold uppercase tracking-wider text-sm text-gray-200">
          Authenticating Clearance...
        </div>
        <div className="text-xs text-gray-500 font-mono mt-1">
          Verifying operator credentials & security clearance
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State (Waiting for router to redirect)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-base-100">
        <div className="w-12 h-12 rounded-full border-4 border-base-300 border-t-primary animate-spin mb-4" />
        <div className="text-xs font-mono text-gray-400">
          Redirecting to operator login terminal...
        </div>
      </div>
    );
  }

  // 3. Role-Based Clearance Check
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (role || 'customer').toLowerCase();
    const isAuthorized =
      allowedRoles.map((r) => r.toLowerCase()).includes(userRole) ||
      (userRole === 'admin'); // Admins hold override clearance across all views

    if (!isAuthorized) {
      return (
        <ForbiddenView
          requiredRoles={allowedRoles}
          currentRole={userRole}
        />
      );
    }
  }

  // 4. Authorized Access
  return <>{children}</>;
};

export default ProtectedRoute;
