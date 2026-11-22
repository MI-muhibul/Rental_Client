'use client';

import React, { useState, useEffect } from 'react';

export interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const [theme, setTheme] = useState<'industrial' | 'industrial-light'>('industrial');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read active theme from documentElement attribute or localStorage
    const currentTheme =
      (document.documentElement.getAttribute('data-theme') as 'industrial' | 'industrial-light') ||
      (localStorage.getItem('theme') as 'industrial' | 'industrial-light') ||
      'industrial';
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'industrial' ? 'industrial-light' : 'industrial';
    setTheme(nextTheme);

    // Apply to DOM immediately
    document.documentElement.setAttribute('data-theme', nextTheme);
    if (nextTheme === 'industrial-light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }

    // Persist to localStorage
    try {
      localStorage.setItem('theme', nextTheme);
    } catch {
      // ignore
    }

    // Dispatch event for any other listening components
    window.dispatchEvent(new Event('themechange'));
  };

  if (!mounted) {
    // Render static placeholder matching dimensions to prevent layout shifts
    return (
      <div
        className={`w-9 h-9 rounded-xs border border-base-300 bg-base-300/40 opacity-50 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === 'industrial';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-xs border transition-colors cursor-pointer ${
        isDark
          ? 'bg-[#181818] border-[#333333] text-amber-400 hover:border-amber-400/60 hover:bg-[#222222]'
          : 'bg-white border-slate-300 text-slate-700 hover:border-[#FF5500] hover:text-[#FF5500] shadow-xs'
      } ${className}`}
    >
      {isDark ? (
        // Sun Icon for Dark Mode (click to switch to Light)
        <svg
          className="w-4 h-4 transition-transform hover:rotate-45"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Moon Icon for Light Mode (click to switch to Dark)
        <svg
          className="w-4 h-4 transition-transform hover:-rotate-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
