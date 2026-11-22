import React from 'react';
import Link from 'next/link';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 bg-base-100">
      <div className="w-full max-w-lg bg-base-200 border-2 border-base-300 rounded-sm p-8 shadow-2xl relative overflow-hidden text-center">
        {/* Top diagonal caution stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[repeating-linear-gradient(45deg,#ff6600,#ff6600_10px,#121519_10px,#121519_20px)]" />

        <div className="pt-3 mb-6">
          <div className="font-heading font-black text-6xl sm:text-7xl text-primary tracking-tight mb-2">
            404
          </div>
          <span className="hazard-badge">GRID EXCEPTION // ASSET NOT FOUND</span>
          <Heading level={1} size="lg" className="mt-4">
            Terminal Coordinate Missing
          </Heading>
        </div>

        <div className="bg-[#121519] border border-base-300 rounded-xs p-4 mb-6 font-mono text-xs text-gray-400">
          The requested asset, telemetry feed, or dispatch terminal does not exist on this network grid.
        </div>

        <p className="text-sm text-gray-400 mb-8 font-body leading-relaxed max-w-md mx-auto">
          The machinery listing may have been decommissioned or the path URL is invalid. Return to the
          active fleet catalog to continue operations.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/equipment" className="flex-1">
            <Button fullWidth size="md">
              Browse Equipment Fleet
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="outline" fullWidth size="md">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
