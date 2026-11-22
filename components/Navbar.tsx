'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();
  const { user, role, loading, signOut, isAuthenticated } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Close drawer upon route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileDrawerOpen]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'All Equipment', href: '/equipment' },
    { label: 'How it works', href: '/how-it-works' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="border-b border-base-300 bg-base-200/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-primary flex items-center justify-center font-heading font-black text-white text-xl rounded-xs shadow-md shadow-orange-500/25 group-hover:bg-[#e65c00] transition-colors">
              H
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-black text-xl tracking-wider text-white uppercase leading-none">
                HEAVY<span className="text-primary">RENT</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-gray-400 uppercase leading-tight">
                Equipment Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 font-heading text-xs font-bold uppercase tracking-wider">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors py-1 relative ${
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Controls & Theme Toggle */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            {loading ? (
              <div className="w-24 h-9 bg-base-300 animate-pulse rounded-xs" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3 bg-[#121519] border border-base-300/80 rounded-xs px-3 py-1.5">
                {/* User Avatar */}
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || 'Operator'}
                    className="w-8 h-8 rounded-full border border-primary object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-base-200 border border-primary flex items-center justify-center font-heading font-bold text-xs text-primary">
                    {(user.name || user.email || 'O')[0].toUpperCase()}
                  </div>
                )}

                {/* Operator Details */}
                <div className="text-left max-w-[120px]">
                  <div className="text-xs font-heading font-bold text-white truncate leading-tight">
                    {user.name || user.email}
                  </div>
                  <div className="text-[10px] text-primary uppercase font-mono font-bold tracking-tight">
                    {role || 'Customer'}
                  </div>
                </div>

                <div className="h-6 w-px bg-base-300 mx-1" />

                {/* Dashboard Shortcut */}
                <Link
                  href={
                    role?.toLowerCase() === 'admin'
                      ? '/dashboard/admin'
                      : role?.toLowerCase() === 'owner'
                      ? '/dashboard/owner'
                      : '/dashboard'
                  }
                >
                  <button className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-xs font-heading font-bold uppercase tracking-wider text-primary rounded-xs border border-primary/40 transition-colors">
                    {role?.toLowerCase() === 'admin'
                      ? 'Admin Command'
                      : role?.toLowerCase() === 'owner'
                      ? 'Owner Fleet'
                      : 'Dashboard'}
                  </button>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={() => signOut()}
                  className="px-2.5 py-1.5 text-xs font-mono text-gray-400 hover:text-error transition-colors"
                  title="Sign Out"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link href="/login">
                  <button className="btn-industrial-outline text-xs px-4 py-2">
                    Login
                  </button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions: Theme Toggle & Hamburger Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open Navigation Menu"
              className="p-2 text-gray-300 hover:text-white bg-base-300/60 rounded-xs border border-base-300 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Slide-out Drawer Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-base-200 border-l border-base-300 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Drawer Top Header with Close Button */}
              <div className="flex items-center justify-between pb-6 border-b border-base-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-primary flex items-center justify-center font-heading font-black text-white text-base rounded-xs">
                    H
                  </div>
                  <span className="font-heading font-bold text-lg uppercase tracking-wider text-white">
                    HEAVY<span className="text-primary">RENT</span>
                  </span>
                </div>

                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Close Navigation Menu"
                  className="p-2 text-gray-400 hover:text-white rounded-xs hover:bg-base-300"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Profile Card (when authenticated) */}
              {isAuthenticated && user && (
                <div className="my-5 p-3.5 bg-[#121519] border border-base-300 rounded-xs flex items-center gap-3">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || 'Operator'}
                      className="w-10 h-10 rounded-full border border-primary object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-base-200 border border-primary flex items-center justify-center font-heading font-bold text-sm text-primary">
                      {(user.name || user.email || 'O')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 truncate">
                    <div className="font-heading font-bold text-sm text-white truncate">
                      {user.name || user.email}
                    </div>
                    <div className="text-xs text-primary font-mono uppercase font-semibold">
                      Clearance: {role || 'Customer'}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links List */}
              <nav className="mt-6 flex flex-col space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 font-heading text-sm font-bold uppercase tracking-wider rounded-xs transition-colors ${
                      isActive(link.href)
                        ? 'bg-primary/10 text-primary border-l-4 border-primary pl-4'
                        : 'text-gray-300 hover:bg-base-300 hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                    <span className="text-xs font-mono text-gray-500">&rarr;</span>
                  </Link>
                ))}

                {/* Dashboard Link for Authenticated Users */}
                {isAuthenticated && (
                  <Link
                    href={
                      role?.toLowerCase() === 'admin'
                        ? '/dashboard/admin'
                        : role?.toLowerCase() === 'owner'
                        ? '/dashboard/owner'
                        : '/dashboard'
                    }
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 font-heading text-sm font-bold uppercase tracking-wider rounded-xs transition-colors ${
                      pathname.startsWith('/dashboard')
                        ? 'bg-primary/10 text-primary border-l-4 border-primary pl-4'
                        : 'text-gray-300 hover:bg-base-300 hover:text-white'
                    }`}
                  >
                    <span>
                      {role?.toLowerCase() === 'admin'
                        ? 'Admin Command Center'
                        : role?.toLowerCase() === 'owner'
                        ? 'Owner Fleet Console'
                        : 'Dashboard Console'}
                    </span>
                    <span className="hazard-badge text-[10px]">
                      {role?.toUpperCase() || 'OPERATIONS'}
                    </span>
                  </Link>
                )}
                {/* Mobile Drawer Theme Mode Switch */}
                <div className="mt-4 pt-4 border-t border-base-300 flex items-center justify-between px-3 py-2 bg-base-300/40 rounded-xs">
                  <span className="font-mono text-xs uppercase text-gray-300 font-bold">Theme Setting</span>
                  <ThemeToggle />
                </div>
              </nav>
            </div>

            {/* Drawer Bottom Auth Actions */}
            <div className="pt-6 border-t border-base-300 mt-6">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    signOut();
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full btn-industrial-outline text-xs py-3 justify-center text-error border-error/40 hover:bg-error/10 hover:border-error hover:text-error"
                >
                  Logout of Terminal
                </button>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <Link href="/login" onClick={() => setMobileDrawerOpen(false)}>
                    <Button variant="outline" fullWidth size="md">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileDrawerOpen(false)}>
                    <Button fullWidth size="md">
                      Register Operator
                    </Button>
                  </Link>
                </div>
              )}

              <div className="mt-4 text-center font-mono text-[10px] text-gray-500">
                HEAVYRENT TELEMETRY // v1.0
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
