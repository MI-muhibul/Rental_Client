'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-base-300 bg-[#121519] text-base-content mt-auto">
      {/* Top Hazard Accent Bar */}
      <div className="h-1 w-full bg-[repeating-linear-gradient(45deg,#ff6600,#ff6600_12px,#121519_12px,#121519_24px)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          {/* Brand Column (2 Spans) */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary flex items-center justify-center font-heading font-black text-white text-lg rounded-xs">
                H
              </div>
              <span className="font-heading font-black text-xl uppercase tracking-wider text-white">
                HEAVY<span className="text-primary">RENT</span>
              </span>
            </Link>

            <p className="text-gray-400 text-sm font-body leading-relaxed max-w-sm mb-6">
              Industrial heavy machinery and commercial equipment marketplace. Providing
              vetted earthmoving, lifting, and compaction fleet units with guaranteed site dispatch.
            </p>

            {/* Social Icons including the NEW X LOGO */}
            <div className="flex items-center gap-3">
              {/* Official New X Logo */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow HEAVYRENT on X"
                className="w-9 h-9 rounded-xs bg-base-200 border border-base-300 flex items-center justify-center text-gray-300 hover:text-white hover:border-primary hover:bg-primary/10 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* LinkedIn Logo */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Connect on LinkedIn"
                className="w-9 h-9 rounded-xs bg-base-200 border border-base-300 flex items-center justify-center text-gray-300 hover:text-white hover:border-primary hover:bg-primary/10 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.68 1.68 0 1 0 0-3.36 1.68 1.68 0 0 0 0 3.36m1.4 9.74V9.94H5.06v8.56h2.8z" />
                </svg>
              </a>

              {/* GitHub Logo */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="w-9 h-9 rounded-xs bg-base-200 border border-base-300 flex items-center justify-center text-gray-300 hover:text-white hover:border-primary hover:bg-primary/10 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </a>

              {/* YouTube Logo */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Channel"
                className="w-9 h-9 rounded-xs bg-base-200 border border-base-300 flex items-center justify-center text-gray-300 hover:text-white hover:border-primary hover:bg-primary/10 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <div className="font-heading font-bold text-xs uppercase tracking-widest text-white mb-4">
              Navigation
            </div>
            <ul className="space-y-2.5 text-xs font-mono text-gray-400">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  &gt; Home Portal
                </Link>
              </li>
              <li>
                <Link href="/equipment" className="hover:text-primary transition-colors">
                  &gt; Fleet Catalog
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-primary transition-colors">
                  &gt; How It Works
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  &gt; About Platform
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  &gt; Job Site Dispatch
                </Link>
              </li>
            </ul>
          </div>

          {/* Machinery Fleet Categories */}
          <div>
            <div className="font-heading font-bold text-xs uppercase tracking-widest text-white mb-4">
              Fleet Categories
            </div>
            <ul className="space-y-2.5 text-xs font-mono text-gray-400">
              <li>
                <Link href="/equipment?category=Earthmoving" className="hover:text-primary transition-colors">
                  Hydraulic Excavators
                </Link>
              </li>
              <li>
                <Link href="/equipment?category=Material+Handling" className="hover:text-primary transition-colors">
                  Wheel Loaders
                </Link>
              </li>
              <li>
                <Link href="/equipment?category=Compaction" className="hover:text-primary transition-colors">
                  Single Drum Rollers
                </Link>
              </li>
              <li>
                <Link href="/equipment?category=Lifting" className="hover:text-primary transition-colors">
                  Rough Terrain Cranes
                </Link>
              </li>
              <li>
                <Link href="/equipment?category=Aerial" className="hover:text-primary transition-colors">
                  Boom & Scissor Lifts
                </Link>
              </li>
            </ul>
          </div>

          {/* Operator Support & Dispatch */}
          <div>
            <div className="font-heading font-bold text-xs uppercase tracking-widest text-white mb-4">
              Emergency Dispatch
            </div>
            <div className="space-y-3 text-xs font-mono text-gray-400">
              <div className="text-white font-bold text-sm text-primary font-heading">
                1-800-HEAVY-RENT
              </div>
              <div>24/7 Field Mechanics & Site Support</div>
              <div className="text-gray-500 text-[11px]">
                Houston • Dallas • Austin • San Antonio
              </div>
              <div className="pt-2">
                <span className="hazard-badge text-[10px]">OSHA CERTIFIED FLEET</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Telemetry & Copyright */}
        <div className="pt-8 border-t border-base-300 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-gray-500">
          <div>
            &copy; {currentYear} HEAVYRENT Industrial Technologies Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-success">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              FLEET TELEMETRY OPERATIONAL
            </span>
            <span className="text-gray-600">|</span>
            <span>ISO 9001:2026 CERTIFIED</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
