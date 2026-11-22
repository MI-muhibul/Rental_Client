'use client';

import React from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SectionContainer from '@/components/ui/SectionContainer';
import Heading from '@/components/ui/Heading';
import Card, { CardBody, CardContent, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function OwnerDashboardPage() {
  const { user } = useAuth();

  const ownerStats = [
    { label: 'Listed Machinery', value: '6 Units', sub: '5 Approved // 1 Pending' },
    { label: 'Current Utilization', value: '83%', sub: '5 Units on active rental' },
    { label: 'Gross Earnings', value: '$14,250', sub: 'Past 30 days revenue' },
    { label: 'Fleet Health Index', value: '98/100', sub: 'All regular services logged' },
  ];

  const listedEquipment = [
    {
      id: 'eq-201',
      name: 'Caterpillar 320 Hydraulic Excavator',
      category: 'Earthmoving',
      dailyRate: '$450/day',
      status: 'Rented',
      renter: 'Apex Infrastructure LLC',
      earnings: '$3,600',
    },
    {
      id: 'eq-202',
      name: 'Komatsu WA380 Wheel Loader',
      category: 'Material Handling',
      dailyRate: '$380/day',
      status: 'Available',
      renter: '—',
      earnings: '$2,280',
    },
    {
      id: 'eq-203',
      name: 'Bobcat T770 Compact Track Loader',
      category: 'Compact Earthmoving',
      dailyRate: '$290/day',
      status: 'Rented',
      renter: 'Dallas Paving Contractors',
      earnings: '$1,450',
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['owner', 'admin']}>
      <SectionContainer className="py-8">
        {/* Header Bar */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-base-300 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="hazard-badge">FLEET OWNER TERMINAL</span>
              <span className="text-xs font-mono text-gray-500">
                DISPATCH CLEARANCE LEVEL 2
              </span>
            </div>
            <Heading level={1} size="lg">
              Owner Fleet Management
            </Heading>
            <p className="text-sm text-gray-400 mt-1 font-mono">
              Managing fleet inventory, utilization, and payouts for {user?.name || user?.email}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button size="md">+ List New Machinery</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {ownerStats.map((stat, idx) => (
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

        {/* Fleet Inventory Table */}
        <div className="bg-base-200 border border-base-300 rounded-sm p-6 shadow-xl mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="hazard-badge mb-1">INVENTORY CONTROL</span>
              <Heading level={2} size="md">
                My Listed Equipment
              </Heading>
            </div>
            <span className="text-xs text-gray-400 font-mono">
              AUTOMATIC PAYOUTS THROUGH STRIPE CONNECT
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#121519] text-gray-400 uppercase text-[11px] border-b border-base-300">
                <tr>
                  <th className="py-3 px-4">Equipment ID</th>
                  <th className="py-3 px-4">Machine Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Rental Rate</th>
                  <th className="py-3 px-4">Current Renter</th>
                  <th className="py-3 px-4">Gross Revenue</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-300">
                {listedEquipment.map((item) => (
                  <tr key={item.id} className="hover:bg-base-300/40 transition-colors">
                    <td className="py-3 px-4 text-primary font-bold">{item.id}</td>
                    <td className="py-3 px-4 font-heading font-semibold text-white text-sm">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-gray-300">{item.category}</td>
                    <td className="py-3 px-4 text-gray-400">{item.dailyRate}</td>
                    <td className="py-3 px-4 text-gray-300">{item.renter}</td>
                    <td className="py-3 px-4 font-bold text-primary">{item.earnings}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-xs text-[10px] uppercase font-bold border ${
                          item.status === 'Rented'
                            ? 'bg-primary/20 text-primary border-primary/30'
                            : 'bg-success/20 text-success border-success/30'
                        }`}
                      >
                        {item.status}
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
