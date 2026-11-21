'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const { user, role, loading, signOut, isAuthenticated } = useAuth();

  return (
    <header className="border-b border-base-300 bg-base-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary flex items-center justify-center font-heading font-bold text-white text-lg rounded-sm shadow-md shadow-orange-500/20">
            H
          </div>
          <span className="font-heading font-bold text-xl uppercase tracking-wider text-white">
            HEAVY<span className="text-primary">RENT</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-heading text-sm uppercase tracking-wider text-gray-300">
          <Link href="/equipment" className="hover:text-primary transition-colors">
            Fleet Catalog
          </Link>
          <Link href="/dashboard" className="hover:text-primary transition-colors">
            Operations
          </Link>
          <a href="#standards" className="hover:text-primary transition-colors">
            Safety Standards
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-20 h-8 bg-base-300 animate-pulse rounded-xs" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-heading font-bold text-white truncate max-w-[120px]">
                  {user.name || user.email}
                </div>
                <div className="text-[10px] text-primary uppercase font-mono font-bold">
                  {role}
                </div>
              </div>
              {user.image && (
                <img
                  src={user.image}
                  alt={user.name || 'User'}
                  className="w-8 h-8 rounded-full border border-primary object-cover"
                />
              )}
              <button
                onClick={() => signOut()}
                className="btn-industrial-outline text-xs px-3 py-1.5"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <button className="btn-industrial-outline text-xs px-4 py-2">
                  Sign In
                </button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
