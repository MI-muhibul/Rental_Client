'use client';

import React from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SectionContainer from '@/components/ui/SectionContainer';
import Heading from '@/components/ui/Heading';
import Card, { CardBody, CardContent, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function CustomerDashboardPage() {
  const { user } = useAuth();

  const customerStats = [
    { label: 'Active Rentals', value: '2 Units', sub: 'On site: CAT 320, Dynapac' },
    { label: 'Completed Rentals', value: '6 Projects', sub: '100% on-time returns' },
    { label: 'Saved Favorites', value: '4 Machinery', sub: 'Tracked in wishlist' },
    { label: 'Total Invoiced', value: '$4,850', sub: 'Verified via Stripe' },
  ];

  const activeRentals = [
    {
      id: 'bk-101',
      equipment: 'Caterpillar 320 Hydraulic Excavator',
      period: 'Dec 01, 2026 - Dec 08, 2026',
      status: 'In Progress',
      cost: '$1,800',
      location: 'Site Alpha, Dallas, TX',
    },
    {
      id: 'bk-102',
      equipment: 'Dynapac CA2500 Soil Compactor',
      period: 'Nov 18, 2026 - Nov 24, 2026',
      status: 'Active Dispatch',
      cost: '$720',
      location: 'Highway 183 Expansion, Austin, TX',
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['customer', 'renter', 'admin']}>
      <SectionContainer className="py-8">
        {/* Header Bar */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-base-300 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="hazard-badge">CUSTOMER OPERATIONS TERMINAL</span>
              <span className="text-xs font-mono text-gray-500">OPERATOR ID: {user?.id?.slice(0, 8) || 'ACTIVE'}</span>
            </div>
            <Heading level={1} size="lg">
              Renter Dashboard
            </Heading>
            <p className="text-sm text-gray-400 mt-1 font-mono">
              Welcome back, {user?.name || user?.email}. Real-time job site equipment deployments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/equipment">
              <Button size="md">+ Rent Machinery</Button>
            </Link>
          </div>
        </div>

        {/* Quick Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {customerStats.map((stat, idx) => (
            <Card key={idx}>
              <CardBody>
                <CardContent>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-heading">
                    {stat.label}
                  </span>
                  <div className="text-3xl font-bold font-heading text-white mt-2">
                    {stat.value}
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-primary font-mono pt-3">
                  {stat.sub}
                </CardFooter>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Active Rentals Table */}
        <div className="bg-base-200 border border-base-300 rounded-sm p-6 shadow-xl mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="hazard-badge mb-1">FIELD TELEMETRY</span>
              <Heading level={2} size="md">
                Active Rentals On Site
              </Heading>
            </div>
            <Link href="/equipment" className="text-xs text-primary font-mono hover:underline">
              Browse More Equipment &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#121519] text-gray-400 uppercase text-[11px] border-b border-base-300">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Equipment Unit</th>
                  <th className="py-3 px-4">Rental Window</th>
                  <th className="py-3 px-4">Job Location</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-300">
                {activeRentals.map((rental) => (
                  <tr key={rental.id} className="hover:bg-base-300/40 transition-colors">
                    <td className="py-3 px-4 text-primary font-bold">{rental.id}</td>
                    <td className="py-3 px-4 font-heading font-semibold text-white text-sm">
                      {rental.equipment}
                    </td>
                    <td className="py-3 px-4 text-gray-300">{rental.period}</td>
                    <td className="py-3 px-4 text-gray-400">{rental.location}</td>
                    <td className="py-3 px-4 font-bold text-white">{rental.cost}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-xs text-[10px] uppercase font-bold bg-success/20 text-success border border-success/30">
                        {rental.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionContainer>
    </ProtectedRoute>
  );
}
