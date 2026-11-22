'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SectionContainer from '@/components/ui/SectionContainer';
import Heading from '@/components/ui/Heading';
import Card, { CardBody, CardContent, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const adminStats = [
    { label: 'Total Platform Users', value: '148', sub: '92 Renters // 56 Owners' },
    { label: 'Total Machinery Fleet', value: '312', sub: '298 Approved // 14 Pending' },
    { label: 'Total Bookings Logged', value: '840', sub: 'Gross $284,500 processed' },
    { label: 'Stripe Escrow Revenue', value: '$34,140', sub: '12% Platform commission' },
  ];

  const pendingApprovals = [
    {
      id: 'eq-901',
      name: 'John Deere 850L Crawler Dozer',
      owner: 'Texas Heavy Equipment LLC',
      submittedDate: '2 hours ago',
      price: '$520/day',
      category: 'Heavy Earthmoving',
    },
    {
      id: 'eq-902',
      name: 'Manitou MT 625 Telehandler',
      owner: 'Lone Star Crane & Lift',
      submittedDate: '5 hours ago',
      price: '$310/day',
      category: 'Lifting & Access',
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <SectionContainer className="py-8">
        {/* Header Bar */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-base-300 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="hazard-badge bg-error/20 text-error border-error/30">
                COMMAND LEVEL CLEARANCE // ADMIN
              </span>
              <span className="text-xs font-mono text-gray-500">
                ROOT PRIVILEGES ACTIVE
              </span>
            </div>
            <Heading level={1} size="lg">
              System Administration Console
            </Heading>
            <p className="text-sm text-gray-400 mt-1 font-mono">
              Global marketplace controls, equipment verification, and user management for {user?.name || user?.email}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button size="md" variant="outline">
              Generate Audit Report
            </Button>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {adminStats.map((stat, idx) => (
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

        {/* Pending Equipment Approval Queue */}
        <div className="bg-base-200 border border-base-300 rounded-sm p-6 shadow-xl mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="hazard-badge mb-1">VERIFICATION QUEUE</span>
              <Heading level={2} size="md">
                Pending Machinery Approvals
              </Heading>
            </div>
            <span className="text-xs text-warning font-mono font-bold">
              2 LISTINGS REQUIRE COMPLIANCE REVIEW
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#121519] text-gray-400 uppercase text-[11px] border-b border-base-300">
                <tr>
                  <th className="py-3 px-4">Item ID</th>
                  <th className="py-3 px-4">Equipment Model</th>
                  <th className="py-3 px-4">Owner Company</th>
                  <th className="py-3 px-4">Daily Rate</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-300">
                {pendingApprovals.map((item) => (
                  <tr key={item.id} className="hover:bg-base-300/40 transition-colors">
                    <td className="py-3 px-4 text-primary font-bold">{item.id}</td>
                    <td className="py-3 px-4 font-heading font-semibold text-white text-sm">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-gray-300">{item.owner}</td>
                    <td className="py-3 px-4 text-primary font-bold">{item.price}</td>
                    <td className="py-3 px-4 text-gray-400">{item.submittedDate}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex gap-2">
                        <button className="px-3 py-1 bg-success/20 text-success border border-success/30 rounded-xs font-bold hover:bg-success hover:text-white transition-colors">
                          Approve
                        </button>
                        <button className="px-3 py-1 bg-error/20 text-error border border-error/30 rounded-xs font-bold hover:bg-error hover:text-white transition-colors">
                          Reject
                        </button>
                      </div>
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
