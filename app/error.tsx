'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception to console or telemetry monitoring
    console.error('[HEAVYRENT Diagnostic Fault]:', error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 bg-base-100">
      <div className="w-full max-w-lg bg-base-200 border-2 border-error/50 rounded-sm p-8 shadow-2xl relative overflow-hidden">
        {/* Top diagonal error hazard stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[repeating-linear-gradient(45deg,#ef4444,#ef4444_10px,#121519_10px,#121519_20px)]" />

        <div className="text-center mb-6 pt-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-error/15 border border-error/40 text-error mb-4">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <span className="hazard-badge bg-error/20 text-error border-error/40">
            SYSTEM ANOMALY // CODE 500
          </span>
          <Heading level={1} size="lg" className="mt-3">
            Operational Fault Detected
          </Heading>
        </div>

        {/* Diagnostic Error Box */}
        <div className="bg-[#121519] border border-base-300 rounded-xs p-4 mb-6 font-mono text-xs text-left space-y-2">
          <div className="text-gray-400">
            FAULT SUMMARY:{' '}
            <span className="text-error font-semibold">
              {error.message || 'An unexpected runtime fault halted execution.'}
            </span>
          </div>
          {error.digest && (
            <div className="text-gray-500 text-[11px] border-t border-base-300/80 pt-2">
              TELEMETRY DIGEST: <span className="text-gray-300">{error.digest}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-400 text-center mb-8 font-body leading-relaxed">
          The machinery dispatch sub-system encountered a fault. You can attempt to reset the
          connection or return to the main fleet portal.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => reset()} fullWidth size="md">
            ↻ Retry Operation
          </Button>
          <Link href="/" className="flex-1">
            <Button variant="outline" fullWidth size="md">
              Home Terminal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
