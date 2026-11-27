'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, role, signOut } = useAuth();
  const normalizedRole = (role || 'customer').toLowerCase();

  const isCustomerActive = pathname === '/dashboard' || pathname === '/dashboard/customer';
  const isOwnerActive = pathname === '/dashboard/owner';
  const isAdminActive = pathname === '/dashboard/admin';

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-base-100 text-base-content">
        {/* Dashboard Top Header */}
        <header className="border-b border-base-300 bg-base-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary flex items-center justify-center font-heading font-bold text-white text-lg rounded-sm shadow-md shadow-orange-500/20">
                  H
                </div>
                <span className="font-heading font-bold text-xl uppercase tracking-wider text-white hidden sm:inline">
                  HEAVY<span className="text-primary">RENT</span>
                </span>
              </Link>

              {/* Navigation Tabs (scoped to active role) */}
              <nav className="flex items-center gap-1 sm:gap-2">
                {(normalizedRole === 'customer' || normalizedRole === 'renter') && (
                  <Link
                    href="/dashboard"
                    className={`px-3 py-1.5 text-xs font-heading font-bold uppercase tracking-wider rounded-xs transition-colors ${
                      isCustomerActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-base-300'
                    }`}
                  >
                    Customer Portal
                  </Link>
                )}

                {normalizedRole === 'owner' && (
                  <Link
                    href="/dashboard/owner"
                    className={`px-3 py-1.5 text-xs font-heading font-bold uppercase tracking-wider rounded-xs transition-colors ${
                      isOwnerActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-base-300'
                    }`}
                  >
                    Owner Fleet
                  </Link>
                )}

                {normalizedRole === 'admin' && (
                  <Link
                    href="/dashboard/admin"
                    className={`px-3 py-1.5 text-xs font-heading font-bold uppercase tracking-wider rounded-xs transition-colors ${
                      isAdminActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-base-300'
                    }`}
                  >
                    Admin Command
                  </Link>
                )}
              </nav>
            </div>

            {/* Operator Status & Actions */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <div className="text-xs font-heading font-bold text-white truncate max-w-[140px]">
                  {user?.name || user?.email}
                </div>
                <div className="text-[10px] text-primary uppercase font-mono font-bold">
                  {role}
                </div>
              </div>

              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || 'User'}
                  className="w-8 h-8 rounded-full border border-primary object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#121519] border border-base-300 flex items-center justify-center font-mono text-xs text-primary font-bold">
                  {(user?.name || user?.email || 'U')[0].toUpperCase()}
                </div>
              )}

              <ThemeToggle />

              <button
                onClick={() => signOut()}
                className="btn-industrial-outline text-xs px-3 py-1.5"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Main View */}
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
