'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import SectionContainer from '@/components/ui/SectionContainer';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

export interface ForbiddenViewProps {
  requiredRoles?: string[];
  currentRole?: string;
}

export const ForbiddenView: React.FC<ForbiddenViewProps> = ({
  requiredRoles = ['Authorized Operator'],
  currentRole,
}) => {
  const { user, role, signOut } = useAuth();
  const effectiveRole = currentRole || role || 'guest';

  const roleLabels: Record<string, string> = {
    customer: 'Customer / Renter',
    renter: 'Renter',
    owner: 'Equipment Owner / Fleet Manager',
    admin: 'System Administrator',
  };

  const formattedRequired = requiredRoles
    .map((r) => roleLabels[r.toLowerCase()] || r)
    .join(' or ');

  const formattedCurrent = roleLabels[effectiveRole.toLowerCase()] || effectiveRole;

  return (
    <SectionContainer className="min-h-[75vh] flex items-center justify-center py-16">
      <div className="w-full max-w-lg bg-base-200 border-2 border-warning/40 rounded-sm p-8 shadow-2xl relative overflow-hidden">
        {/* Top diagonal caution stripe accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_10px,#121519_10px,#121519_20px)]" />

        <div className="text-center mb-6 pt-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-warning/10 border border-warning/40 text-warning mb-4">
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

          <span className="hazard-badge">RESTRICTED TERMINAL // 403 FORBIDDEN</span>
          <Heading level={1} size="lg" className="mt-3">
            Clearance Required
          </Heading>
        </div>

        <div className="bg-[#121519] border border-base-300 rounded-xs p-4 mb-6 font-mono text-xs space-y-2">
          <div className="flex justify-between items-center text-gray-400">
            <span>OPERATOR:</span>
            <span className="text-white font-bold">{user?.name || user?.email || 'Authenticated User'}</span>
          </div>
          <div className="flex justify-between items-center text-gray-400">
            <span>CURRENT ROLE:</span>
            <span className="text-warning uppercase font-bold">{formattedCurrent}</span>
          </div>
          <div className="flex justify-between items-center text-gray-400 border-t border-base-300/80 pt-2">
            <span>REQUIRED CLEARANCE:</span>
            <span className="text-primary uppercase font-bold">{formattedRequired}</span>
          </div>
        </div>

        <p className="text-sm text-gray-400 text-center mb-8 font-body leading-relaxed">
          You do not have the required operational permissions to view this terminal. If you
          require role reassignment, please contact your fleet administrator.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" fullWidth size="md">
              My Dashboard
            </Button>
          </Link>

          <Link href="/equipment" className="flex-1">
            <Button fullWidth size="md">
              Equipment Fleet
            </Button>
          </Link>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => signOut()}
            className="text-xs text-gray-500 hover:text-primary font-mono transition-colors uppercase tracking-wider"
          >
            [ Switch Account / Sign Out ]
          </button>
        </div>
      </div>
    </SectionContainer>
  );
};

export default ForbiddenView;
