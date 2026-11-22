'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import CustomerDashboardPage from './customer/page';

export default function DashboardIndexPage() {
  const router = useRouter();
  const { role, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const normalized = (role || 'customer').toLowerCase();
      if (normalized === 'admin') {
        router.replace('/dashboard/admin');
      } else if (normalized === 'owner') {
        router.replace('/dashboard/owner');
      }
    }
  }, [role, loading, router]);

  return <CustomerDashboardPage />;
}
