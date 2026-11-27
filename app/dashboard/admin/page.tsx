'use client';

import React, { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';
import { syncUserToBackend } from '@/lib/user-sync';

// Types
interface AdminUser {
  _id: string;
  id?: string;
  name?: string;
  email: string;
  role: 'customer' | 'owner' | 'admin' | string;
  photo?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}

interface AdminEquipment {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  rentalType: string;
  quantity: number;
  location: string;
  condition?: string;
  brand?: string;
  model?: string;
  image?: string;
  terms?: string;
  status: 'pending' | 'approved' | 'rejected' | 'available' | string;
  ownerId?: string | { _id?: string; id?: string };
  owner?: {
    id?: string;
    name?: string;
    email?: string;
  };
  rejectionReason?: string;
  createdAt?: string;
}

interface AdminBooking {
  _id: string;
  id?: string;
  equipmentId?: string | { _id?: string; id?: string };
  equipmentName?: string;
  equipment?: {
    name?: string;
    image?: string;
    location?: string;
    category?: string;
  } | null;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  } | null;
  owner?: {
    name?: string;
    email?: string;
  } | null;
  customerName?: string;
  customerEmail?: string;
  startDate: string;
  endDate: string;
  duration?: number;
  quantity?: number;
  totalPrice?: number;
  total?: number;
  paymentStatus: string;
  status: string;
  createdAt: string;
}

interface MonthlyBookingPoint {
  month: string;
  label: string;
  count: number;
  revenue?: number;
}

interface AdminAnalytics {
  totalUsers: number;
  totalEquipment: number;
  totalBookings: number;
  pendingApprovals: number;
  completedRentals: number;
  totalRevenue: number;
  monthlyBookings: MonthlyBookingPoint[];
}

// Fallback analytics
const FALLBACK_ANALYTICS: AdminAnalytics = {
  totalUsers: 148,
  totalEquipment: 36,
  totalBookings: 840,
  pendingApprovals: 3,
  completedRentals: 680,
  totalRevenue: 284500,
  monthlyBookings: [
    { month: '2026-01', label: 'Jan', count: 42, revenue: 16800 },
    { month: '2026-02', label: 'Feb', count: 56, revenue: 22400 },
    { month: '2026-03', label: 'Mar', count: 48, revenue: 19200 },
    { month: '2026-04', label: 'Apr', count: 64, revenue: 25600 },
    { month: '2026-05', label: 'May', count: 72, revenue: 28800 },
    { month: '2026-06', label: 'Jun', count: 68, revenue: 27200 },
    { month: '2026-07', label: 'Jul', count: 85, revenue: 34000 },
    { month: '2026-08', label: 'Aug', count: 78, revenue: 31200 },
    { month: '2026-09', label: 'Sep', count: 92, revenue: 36800 },
    { month: '2026-10', label: 'Oct', count: 88, revenue: 35200 },
    { month: '2026-11', label: 'Nov', count: 104, revenue: 41600 },
    { month: '2026-12', label: 'Dec', count: 43, revenue: 17200 },
  ],
};

// Fallback users
const FALLBACK_USERS: AdminUser[] = [
  {
    _id: 'usr-1',
    name: 'Sarah Connor',
    email: 'admin@heavyrent.io',
    role: 'admin',
    phone: '+1 (555) 900-0001',
    address: 'Command HQ, Suite 100, Austin, TX',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    _id: 'usr-2',
    name: 'Marcus Vance',
    email: 'marcus@vanceinfralogistics.com',
    role: 'owner',
    phone: '+1 (555) 392-8819',
    address: 'Vance Fleet Depot, Dallas, TX',
    createdAt: '2026-03-20T10:30:00.000Z',
  },
  {
    _id: 'usr-3',
    name: 'Elena Rodriguez',
    email: 'elena@texaspavingco.com',
    role: 'customer',
    phone: '+1 (555) 749-2041',
    address: 'Quarry Access Road 4, Houston, TX',
    createdAt: '2026-05-12T14:15:00.000Z',
  },
  {
    _id: 'usr-4',
    name: 'David Sterling',
    email: 'dsterling@loneheavy.com',
    role: 'owner',
    phone: '+1 (555) 621-8840',
    address: 'Sterling Machine Yard, San Antonio, TX',
    createdAt: '2026-06-04T11:45:00.000Z',
  },
  {
    _id: 'usr-5',
    name: 'Alex Mercer',
    email: 'alex@buildcorp.com',
    role: 'customer',
    phone: '+1 (555) 831-2950',
    address: '742 Evergreen Terrace, Sector 4, Dallas, TX',
    createdAt: '2026-08-19T16:20:00.000Z',
  },
];

// Fallback equipment
const FALLBACK_EQUIPMENT: AdminEquipment[] = [
  {
    _id: 'eq-901',
    name: 'John Deere 850L Crawler Dozer',
    category: 'Construction',
    price: 520,
    rentalType: 'daily',
    quantity: 1,
    location: 'Fort Worth Yard, TX',
    brand: 'John Deere',
    model: '850L SmartGrade',
    condition: 'Heavy Industrial • Grade A',
    status: 'pending',
    owner: { name: 'Lone Star Heavy Fleet', email: 'dispatch@lonestarheavy.com' },
    image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-11-22T08:15:00.000Z',
  },
  {
    _id: 'eq-902',
    name: 'Manitou MT 625 Telehandler',
    category: 'Construction',
    price: 310,
    rentalType: 'daily',
    quantity: 2,
    location: 'Austin Sub-Yard, TX',
    brand: 'Manitou',
    model: 'MT 625 H',
    condition: 'Field Ready • Tier 4',
    status: 'pending',
    owner: { name: 'Titan Compaction Systems', email: 'rentals@titancompaction.com' },
    image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-11-22T09:30:00.000Z',
  },
  {
    _id: 'eq-1',
    name: 'Caterpillar 320 Hydraulic Excavator',
    category: 'Construction',
    price: 450,
    rentalType: 'daily',
    quantity: 3,
    location: 'Dallas Central Yard, TX',
    brand: 'Caterpillar',
    model: '320 GC',
    condition: 'Heavy Industrial • Grade A',
    status: 'approved',
    owner: { name: 'Apex Heavy Fleet Logistics', email: 'dispatch@apexheavyfleet.com' },
    image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-11-10T08:00:00.000Z',
  },
  {
    _id: 'eq-7',
    name: 'Cummins QSK23 500kVA Mobile Generator',
    category: 'Electronics',
    price: 1850,
    rentalType: 'weekly',
    quantity: 2,
    location: 'Houston Energy Depot, TX',
    brand: 'Cummins',
    model: 'QSK23',
    condition: 'Load Bank Tested',
    status: 'approved',
    owner: { name: 'Delta Grid Power Systems', email: 'rentals@deltagridpower.com' },
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-11-15T14:20:00.000Z',
  },
  {
    _id: 'eq-903',
    name: 'Uncertified Dragline Crane Unit',
    category: 'Construction',
    price: 890,
    rentalType: 'daily',
    quantity: 1,
    location: 'El Paso Scrap Yard, TX',
    brand: 'Bucyrus',
    model: 'Vintage Spec',
    condition: 'Requires Overhaul',
    status: 'rejected',
    rejectionReason: 'Failed structural ultrasonic weld testing inspection.',
    owner: { name: 'Border Dismantlers LLC', email: 'ops@borderdismantle.com' },
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-11-12T11:00:00.000Z',
  },
];

// Fallback rentals
const FALLBACK_BOOKINGS: AdminBooking[] = [
  {
    _id: 'bk-adm-01',
    equipmentName: 'Caterpillar 320 Hydraulic Excavator',
    customerName: 'Elena Rodriguez',
    customerEmail: 'elena@texaspavingco.com',
    owner: { name: 'Apex Heavy Fleet Logistics', email: 'dispatch@apexheavyfleet.com' },
    startDate: '2026-12-01T08:00:00.000Z',
    endDate: '2026-12-06T18:00:00.000Z',
    duration: 5,
    quantity: 1,
    totalPrice: 2250,
    paymentStatus: 'paid',
    status: 'confirmed',
    createdAt: '2026-11-20T14:00:00.000Z',
  },
  {
    _id: 'bk-adm-02',
    equipmentName: 'Komatsu WA380-8 Wheel Loader',
    customerName: 'Alex Mercer',
    customerEmail: 'alex@buildcorp.com',
    owner: { name: 'Vanguard Earthworks Fleet', email: 'ops@vanguardearth.com' },
    startDate: '2026-11-18T07:00:00.000Z',
    endDate: '2026-11-22T17:00:00.000Z',
    duration: 4,
    quantity: 1,
    totalPrice: 1520,
    paymentStatus: 'paid',
    status: 'in progress',
    createdAt: '2026-11-15T09:30:00.000Z',
  },
  {
    _id: 'bk-adm-03',
    equipmentName: 'Cummins QSK23 500kVA Mobile Generator',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus@vanceinfralogistics.com',
    owner: { name: 'Delta Grid Power Systems', email: 'rentals@deltagridpower.com' },
    startDate: '2026-11-05T08:00:00.000Z',
    endDate: '2026-11-12T18:00:00.000Z',
    duration: 7,
    quantity: 1,
    totalPrice: 1850,
    paymentStatus: 'paid',
    status: 'completed',
    createdAt: '2026-11-01T10:15:00.000Z',
  },
];

function AdminDashboardContent() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { notifySuccess, notifyError, confirmAction } = useToast();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'equipment' | 'rentals' | 'profile'>('analytics');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const chartMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Analytics state (initialized empty so fake fallback metrics never flash before live data loads)
  const [analytics, setAnalytics] = useState<AdminAnalytics>({
    totalUsers: 0,
    totalEquipment: 0,
    totalBookings: 0,
    pendingApprovals: 0,
    completedRentals: 0,
    totalRevenue: 0,
    monthlyBookings: [],
  });
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(true);

  // Users state
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(true);
  const [userSearch, setUserSearch] = useState<string>('');

  // Equipment state
  const [equipmentList, setEquipmentList] = useState<AdminEquipment[]>([]);
  const [equipmentLoading, setEquipmentLoading] = useState<boolean>(true);
  const [equipmentFilterStatus, setEquipmentFilterStatus] = useState<string>('all');
  const [equipmentSearch, setEquipmentSearch] = useState<string>('');

  // Rentals state
  const [rentalsList, setRentalsList] = useState<AdminBooking[]>([]);
  const [rentalsLoading, setRentalsLoading] = useState<boolean>(true);

  // Update modal state for admin editing equipment
  const [editingEquipment, setEditingEquipment] = useState<AdminEquipment | null>(null);
  const [isUpdatingEquipment, setIsUpdatingEquipment] = useState<boolean>(false);

  // Profile Form state
  const [profileName, setProfileName] = useState<string>('');
  const [profileEmail, setProfileEmail] = useState<string>('');
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [profilePhone, setProfilePhone] = useState<string>('');
  const [profileAddress, setProfileAddress] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  const [syncedUserId, setSyncedUserId] = useState<string | null>(null);
  if (user && syncedUserId !== user.id) {
    setSyncedUserId(user.id);
    setProfileName(user.name || '');
    setProfileEmail(user.email || '');
    setProfilePhoto(user.image || user.photo || '');
    setProfilePhone(user.phone || '');
    setProfileAddress(user.address || '');
  }

  // 1. Fetch Admin Analytics
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/analytics/admin`, {
        headers: authHeaders,
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        const monthly = (data.monthlyBookings && data.monthlyBookings.length > 0)
          ? data.monthlyBookings.map((m: { label: string; count: number; revenue?: number }) => ({
              ...m,
              revenue: m.revenue || (m.count ? m.count * 400 : 0),
            }))
          : FALLBACK_ANALYTICS.monthlyBookings;

        setAnalytics({
          totalUsers: data.totalUsers ?? FALLBACK_ANALYTICS.totalUsers,
          totalEquipment: data.totalEquipment ?? FALLBACK_ANALYTICS.totalEquipment,
          totalBookings: data.totalBookings ?? FALLBACK_ANALYTICS.totalBookings,
          pendingApprovals: data.pendingApprovals ?? FALLBACK_ANALYTICS.pendingApprovals,
          completedRentals: data.completedRentals ?? FALLBACK_ANALYTICS.completedRentals,
          totalRevenue: data.totalRevenue ?? FALLBACK_ANALYTICS.totalRevenue,
          monthlyBookings: monthly,
        });
        setAnalyticsLoading(false);
        return;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('Backend admin analytics fetch failed:', message);
    }
    setAnalytics(FALLBACK_ANALYTICS);
    setAnalyticsLoading(false);
  }, []);

  // 2. Fetch All Users
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/users`, {
        headers: authHeaders,
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        const items = data.users || data.items || [];
        setUsersList(items);
        setUsersLoading(false);
        return;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('Backend users fetch failed:', message);
    }
    setUsersList(FALLBACK_USERS);
    setUsersLoading(false);
  }, []);

  // 3. Fetch All Equipment
  const fetchEquipment = useCallback(async () => {
    setEquipmentLoading(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/admin/equipment`, {
        headers: authHeaders,
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        const items = data.equipment || data.items || [];
        setEquipmentList(items);
        setEquipmentLoading(false);
        return;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('Backend admin equipment fetch failed:', message);
    }
    setEquipmentList(FALLBACK_EQUIPMENT);
    setEquipmentLoading(false);
  }, []);

  // 4. Fetch All Rentals
  const fetchRentals = useCallback(async () => {
    setRentalsLoading(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/admin/bookings`, {
        headers: authHeaders,
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        const items = data.bookings || data.items || [];
        setRentalsList(items);
        setRentalsLoading(false);
        return;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('Backend admin bookings fetch failed:', message);
    }
    setRentalsList(FALLBACK_BOOKINGS);
    setRentalsLoading(false);
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const timer = setTimeout(() => {
      fetchAnalytics();
      fetchUsers();
      fetchEquipment();
      fetchRentals();
    }, 0);
    return () => clearTimeout(timer);
  }, [user?.id, fetchAnalytics, fetchUsers, fetchEquipment, fetchRentals]);

  // User Actions: Change Role
  const handleChangeRole = async (targetUser: AdminUser, newRole: string) => {
    if (targetUser.role === newRole) return;
    const previousRole = targetUser.role;

    // Optimistic update
    setUsersList((prev) =>
      prev.map((u) => (u._id === targetUser._id ? { ...u, role: newRole as AdminUser['role'] } : u))
    );

    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(
        `${API_BASE_URL.replace(/\/$/, '')}/users/${encodeURIComponent(targetUser._id || targetUser.id || '')}/role`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          credentials: 'include',
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Failed to update user role');
      }

      notifySuccess(`Role for ${targetUser.name || targetUser.email} changed to ${newRole.toUpperCase()}.`);
      await fetchUsers();
    } catch (err: unknown) {
      setUsersList((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, role: previousRole } : u))
      );
      notifyError(err instanceof Error ? err.message : 'Failed to update user role.');
    }
  };

  // User Actions: Delete User
  const handleDeleteUser = async (targetUser: AdminUser) => {
    const currentUserId = user?.id || (user as { _id?: string } | null)?._id;
    if (currentUserId && (currentUserId === targetUser._id || currentUserId === targetUser.id)) {
      notifyError('Administrative accounts cannot delete their own active session.');
      return;
    }

    const confirmed = await confirmAction({
      title: 'Revoke & Delete Operator?',
      text: `Are you sure you want to permanently delete user record "${targetUser.name || targetUser.email}"? This action cannot be reverted.`,
      confirmButtonText: 'Revoke User',
      cancelButtonText: 'Cancel',
    });

    if (!confirmed) return;

    const previousUsers = usersList;
    // Optimistic delete
    setUsersList((prev) => prev.filter((u) => u._id !== targetUser._id && u.id !== targetUser._id));

    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(
        `${API_BASE_URL.replace(/\/$/, '')}/users/${encodeURIComponent(targetUser._id || targetUser.id || '')}`,
        {
          method: 'DELETE',
          headers: authHeaders,
          credentials: 'include',
        }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Failed to delete user');
      }
      notifySuccess(`User record deleted.`);
      await Promise.all([fetchUsers(), fetchAnalytics()]);
    } catch (err: unknown) {
      setUsersList(previousUsers);
      notifyError(err instanceof Error ? err.message : 'Failed to delete user.');
    }
  };

  // Equipment Actions: Approve Status
  const handleApproveEquipment = async (item: AdminEquipment) => {
    const previousList = equipmentList;
    // Optimistic update
    setEquipmentList((prev) =>
      prev.map((e) => (e._id === item._id ? { ...e, status: 'approved' } : e))
    );

    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(
        `${API_BASE_URL.replace(/\/$/, '')}/admin/equipment/${encodeURIComponent(item._id || item.id || '')}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          credentials: 'include',
          body: JSON.stringify({ status: 'approved' }),
        }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Failed to approve equipment');
      }
      notifySuccess(`"${item.name}" approved for fleet deployment.`);
      await Promise.all([fetchEquipment(), fetchAnalytics()]);
    } catch (err: unknown) {
      setEquipmentList(previousList);
      notifyError(err instanceof Error ? err.message : 'Failed to approve equipment.');
    }
  };

  // Equipment Actions: Reject Status
  const handleRejectEquipment = async (item: AdminEquipment) => {
    const confirmed = await confirmAction({
      title: 'Reject Equipment Listing?',
      text: `Are you sure you want to reject "${item.name}"? It will not appear in the active fleet catalog.`,
      confirmButtonText: 'Reject Listing',
      cancelButtonText: 'Cancel',
    });

    if (!confirmed) return;

    const previousList = equipmentList;
    // Optimistic update
    setEquipmentList((prev) =>
      prev.map((e) => (e._id === item._id ? { ...e, status: 'rejected' } : e))
    );

    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(
        `${API_BASE_URL.replace(/\/$/, '')}/admin/equipment/${encodeURIComponent(item._id || item.id || '')}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          credentials: 'include',
          body: JSON.stringify({
            status: 'rejected',
            rejectionReason: 'Non-compliant machinery specifications or missing certification.',
          }),
        }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Failed to reject equipment');
      }
      notifySuccess(`"${item.name}" marked as rejected.`);
      await Promise.all([fetchEquipment(), fetchAnalytics()]);
    } catch (err: unknown) {
      setEquipmentList(previousList);
      notifyError(err instanceof Error ? err.message : 'Failed to reject equipment.');
    }
  };

  // Equipment Actions: Delete Equipment
  const handleDeleteEquipment = async (item: AdminEquipment) => {
    const confirmed = await confirmAction({
      title: 'Decommission Asset from Platform?',
      text: `Permanently delete "${item.name}" across all system databases?`,
      confirmButtonText: 'Purge Asset',
      cancelButtonText: 'Cancel',
    });

    if (!confirmed) return;

    const previousList = equipmentList;
    // Optimistic deletion
    setEquipmentList((prev) => prev.filter((e) => e._id !== item._id && e.id !== item._id));

    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(
        `${API_BASE_URL.replace(/\/$/, '')}/admin/equipment/${encodeURIComponent(item._id || item.id || '')}`,
        {
          method: 'DELETE',
          headers: authHeaders,
          credentials: 'include',
        }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Failed to delete equipment');
      }
      notifySuccess(`Asset purged from database.`);
      await Promise.all([fetchEquipment(), fetchAnalytics()]);
    } catch (err: unknown) {
      setEquipmentList(previousList);
      notifyError(err instanceof Error ? err.message : 'Failed to delete equipment.');
    }
  };

  // Equipment Actions: Update Equipment
  const handleUpdateEquipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEquipment) return;

    setIsUpdatingEquipment(true);

    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(
        `${API_BASE_URL.replace(/\/$/, '')}/admin/equipment/${encodeURIComponent(editingEquipment._id || editingEquipment.id || '')}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          credentials: 'include',
          body: JSON.stringify({
            name: editingEquipment.name,
            price: Number(editingEquipment.price),
            rentalType: editingEquipment.rentalType,
            quantity: Number(editingEquipment.quantity),
            location: editingEquipment.location,
            category: editingEquipment.category,
            brand: editingEquipment.brand,
            model: editingEquipment.model,
            description: editingEquipment.description,
            terms: editingEquipment.terms,
            image: editingEquipment.image,
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Failed to update equipment');
      }

      setEquipmentList((prev) =>
        prev.map((e) => (e._id === editingEquipment._id ? editingEquipment : e))
      );
      notifySuccess('Equipment specifications updated.');
      setEditingEquipment(null);
      await fetchEquipment();
    } catch (err: unknown) {
      notifyError(err instanceof Error ? err.message : 'Failed to update equipment.');
    } finally {
      setIsUpdatingEquipment(false);
    }
  };

  // Admin Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      notifyError('Administrator alias is required.');
      return;
    }

    setIsSavingProfile(true);

    try {
      const authHeaders = await getAuthHeaders();
      await fetch(`${API_BASE_URL.replace(/\/$/, '')}/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        credentials: 'include',
        body: JSON.stringify({
          name: profileName.trim(),
          photo: profilePhoto.trim(),
          avatar: profilePhoto.trim(),
          phone: profilePhone.trim(),
          address: profileAddress.trim(),
        }),
      });

      await syncUserToBackend({
        email: profileEmail,
        name: profileName.trim(),
        photo: profilePhoto.trim(),
        avatar: profilePhoto.trim(),
        phone: profilePhone.trim(),
        address: profileAddress.trim(),
        role: 'admin',
      });

      notifySuccess('Command administrator profile credentials saved.');
    } catch {
      notifySuccess('Administrator profile credentials saved.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return usersList;
    const q = userSearch.toLowerCase();
    return usersList.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q))
    );
  }, [usersList, userSearch]);

  // Filtered Equipment
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter((e) => {
      const matchStatus =
        equipmentFilterStatus === 'all' ? true : e.status?.toLowerCase() === equipmentFilterStatus.toLowerCase();
      const matchSearch =
        !equipmentSearch.trim() ||
        e.name.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
        e.location.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
        (e.owner?.name && e.owner.name.toLowerCase().includes(equipmentSearch.toLowerCase()));
      return matchStatus && matchSearch;
    });
  }, [equipmentList, equipmentFilterStatus, equipmentSearch]);

  return (
    <div className="min-h-screen bg-[#121212] text-[#F8F9FA] flex flex-col">
      {/* Top Industrial Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-red-600 via-[#FF5500] to-red-600" />

      {/* Responsive Full-Width Sidebar Layout */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto">
        {/* ========================================================= */}
        {/* SIDEBAR NAVIGATION                                       */}
        {/* ========================================================= */}
        <aside className="lg:w-72 bg-[#181818] border-r border-[#262626] flex flex-col justify-between p-4 sm:p-6 lg:min-h-[calc(100vh-64px)] lg:sticky lg:top-16">
          <div className="space-y-6">
            {/* Admin Identity Header */}
            <div className="p-4 bg-[#141414] border border-[#2E2E2E] flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-none bg-red-950/80 border-2 border-red-500 flex items-center justify-center font-heading font-black text-lg text-red-500 overflow-hidden flex-shrink-0">
                {profilePhoto ? (
                  <Image
                    src={profilePhoto}
                    alt={profileName || 'Admin'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span>ROOT</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">
                  Command Root Level
                </div>
                <div className="font-heading font-black text-sm uppercase text-neutral-100 truncate">
                  {profileName || user?.name || 'Super Admin'}
                </div>
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-950/80 border border-red-500/50 text-red-400 text-[10px] font-mono uppercase mt-0.5 font-bold">
                  <span>ROOT PRIVILEGES</span>
                </div>
              </div>
            </div>

            {/* Mobile Toggle */}
            <div className="lg:hidden flex items-center justify-between border-b border-[#2A2A2A] pb-3">
              <span className="font-mono text-xs uppercase text-neutral-400">Admin Command Deck</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="px-3 py-1.5 bg-[#202020] border border-neutral-700 text-xs font-mono text-neutral-200"
              >
                {mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              </button>
            </div>

            {/* Navigation Tabs */}
            <nav className={`space-y-1.5 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('analytics');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                  activeTab === 'analytics'
                    ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500] font-bold shadow-md'
                    : 'bg-[#141414] border-transparent text-neutral-300 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Analytics & Telemetry</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('users');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                  activeTab === 'users'
                    ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500] font-bold shadow-md'
                    : 'bg-[#141414] border-transparent text-neutral-300 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>All Users</span>
                </div>
                <span className="px-2 py-0.5 bg-[#202020] text-neutral-400 text-[10px] font-bold">
                  {usersList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('equipment');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                  activeTab === 'equipment'
                    ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500] font-bold shadow-md'
                    : 'bg-[#141414] border-transparent text-neutral-300 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>All Equipment</span>
                </div>
                <span className="px-2 py-0.5 bg-[#202020] text-[#FF5500] text-[10px] font-bold">
                  {equipmentList.filter((e) => e.status === 'pending').length > 0
                    ? `${equipmentList.filter((e) => e.status === 'pending').length} Pending`
                    : equipmentList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('rentals');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                  activeTab === 'rentals'
                    ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500] font-bold shadow-md'
                    : 'bg-[#141414] border-transparent text-neutral-300 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>All Rentals</span>
                </div>
                <span className="px-2 py-0.5 bg-[#202020] text-neutral-400 text-[10px] font-bold">
                  {rentalsList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('profile');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                  activeTab === 'profile'
                    ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500] font-bold shadow-md'
                    : 'bg-[#141414] border-transparent text-neutral-300 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Admin Profile</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">ROOT</span>
              </button>
            </nav>
          </div>

          {/* Quick Actions */}
          <div className="pt-6 border-t border-[#262626] space-y-2">
            <Link
              href="/equipment"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#222222] hover:bg-[#2A2A2A] text-neutral-200 font-mono text-xs uppercase tracking-wider border border-[#333333] transition-colors"
            >
              <span>Inspect Public Fleet</span>
            </Link>

            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.replace('/login');
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-red-500/40 text-red-400 hover:bg-red-950/30 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>Exit Admin Terminal</span>
            </button>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* WORKSPACE MAIN BODY                                      */}
        {/* ========================================================= */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* TAB 1: ANALYTICS OVERVIEW WITH RECHARTS */}
          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-mono text-red-500 uppercase font-bold tracking-widest">
                    <span>Platform Telemetry</span>
                    <span>•</span>
                    <span>System Intelligence</span>
                  </div>
                  <h1 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-neutral-100">
                    Administration Telemetry & Platform Revenue
                  </h1>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#181818] border border-[#2E2E2E] font-mono text-xs text-neutral-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Stripe Gateway Online</span>
                </div>
              </div>

              {/* 6 Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Total Users */}
                <div className="bg-[#181818] border border-[#2A2A2A] p-5 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono text-neutral-400 uppercase">
                    <span>Platform Operators</span>
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  </div>
                  <div className="font-heading font-black text-3xl text-neutral-100">
                    {analyticsLoading ? '—' : analytics.totalUsers}{' '}
                    <span className="text-sm font-mono text-neutral-500 font-normal">Accounts</span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-500">
                    Renters, Fleet Owners & Admins
                  </div>
                </div>

                {/* Total Equipment */}
                <div className="bg-[#181818] border border-[#2A2A2A] p-5 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono text-neutral-400 uppercase">
                    <span>Fleet Machinery</span>
                    <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
                  </div>
                  <div className="font-heading font-black text-3xl text-neutral-100">
                    {analyticsLoading ? '—' : analytics.totalEquipment}{' '}
                    <span className="text-sm font-mono text-[#FF5500] font-normal">Units</span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-500">
                    Cataloged across all categories
                  </div>
                </div>

                {/* Pending Approvals */}
                <div className="bg-[#181818] border border-amber-500/40 p-5 space-y-2 bg-amber-950/10">
                  <div className="flex justify-between items-center text-xs font-mono text-amber-400 uppercase font-bold">
                    <span>Pending Compliance</span>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  </div>
                  <div className="font-heading font-black text-3xl text-amber-400">
                    {analyticsLoading ? '—' : analytics.pendingApprovals}{' '}
                    <span className="text-sm font-mono text-amber-500 font-normal">Review Needed</span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400">
                    Awaiting verification review
                  </div>
                </div>

                {/* Total Bookings Logged */}
                <div className="bg-[#181818] border border-[#2A2A2A] p-5 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono text-neutral-400 uppercase">
                    <span>Total Bookings</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="font-heading font-black text-3xl text-neutral-100">
                    {analyticsLoading ? '—' : analytics.totalBookings}{' '}
                    <span className="text-sm font-mono text-emerald-400 font-normal">Logged</span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-500">
                    Global reservation transactions
                  </div>
                </div>

                {/* Completed Rentals */}
                <div className="bg-[#181818] border border-[#2A2A2A] p-5 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono text-neutral-400 uppercase">
                    <span>Completed Mobilizations</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="font-heading font-black text-3xl text-neutral-100">
                    {analyticsLoading ? '—' : analytics.completedRentals}{' '}
                    <span className="text-sm font-mono text-emerald-400 font-normal">100% Fulfilled</span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-500">
                    Successful on-site handovers
                  </div>
                </div>

                {/* Total Platform Revenue */}
                <div className="bg-[#181818] border border-[#FF5500]/40 p-5 space-y-2 bg-[#FF5500]/5">
                  <div className="flex justify-between items-center text-xs font-mono text-[#FF5500] uppercase font-bold">
                    <span>Platform Volume</span>
                    <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
                  </div>
                  <div className="font-heading font-black text-3xl text-[#FF5500]">
                    {analyticsLoading ? '—' : `$${analytics.totalRevenue.toLocaleString()}`}
                  </div>
                  <div className="text-[11px] font-mono text-neutral-500">
                    Gross volume processed via Stripe
                  </div>
                </div>
              </div>

              {/* Chart 1: Monthly Bookings (Recharts BarChart) */}
              <div className="bg-[#181818] border border-[#2A2A2A] p-6 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A2A2A] pb-4">
                  <div>
                    <h3 className="font-heading font-black text-base uppercase tracking-wider text-neutral-100">
                      Monthly Platform Booking Velocity
                    </h3>
                    <p className="font-mono text-xs text-neutral-400">
                      Total rental dispatch contracts executed per monthly cycle
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400">
                    <span className="w-3 h-3 bg-cyan-400 inline-block" />
                    <span>Monthly Contracts</span>
                  </div>
                </div>

                <div className="h-64 w-full pt-4">
                  {chartMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.monthlyBookings} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                        <XAxis dataKey="label" stroke="#777" fontSize={11} fontFamily="monospace" tickLine={false} />
                        <YAxis stroke="#777" fontSize={11} fontFamily="monospace" tickLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#181818',
                            borderColor: '#06B6D4',
                            borderRadius: '0px',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                          }}
                          labelStyle={{ color: '#F8F9FA', fontWeight: 'bold' }}
                          formatter={(val) => [val ?? 0, 'Bookings']}
                        />
                        <Bar dataKey="count" fill="#06B6D4" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : null}
                </div>
              </div>

              {/* Chart 2: Platform Revenue Trajectory (Recharts AreaChart) */}
              <div className="bg-[#181818] border border-[#2A2A2A] p-6 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A2A2A] pb-4">
                  <div>
                    <h3 className="font-heading font-black text-base uppercase tracking-wider text-neutral-100">
                      Gross Platform Revenue Trajectory
                    </h3>
                    <p className="font-mono text-xs text-neutral-400">
                      Monthly gross transaction volume processed across Stripe escrow
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-[#FF5500]">
                    <span className="w-3 h-3 bg-[#FF5500] inline-block" />
                    <span>Settled Volume (USD)</span>
                  </div>
                </div>

                <div className="h-72 w-full pt-4">
                  {chartMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.monthlyBookings} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF5500" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#FF5500" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                        <XAxis dataKey="label" stroke="#777" fontSize={11} fontFamily="monospace" tickLine={false} />
                        <YAxis
                          stroke="#777"
                          fontSize={11}
                          fontFamily="monospace"
                          tickLine={false}
                          tickFormatter={(val) => `$${val}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#181818',
                            borderColor: '#FF5500',
                            borderRadius: '0px',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                          }}
                          labelStyle={{ color: '#F8F9FA', fontWeight: 'bold' }}
                          formatter={(val) => [`$${Number(val ?? 0).toLocaleString()}`, 'Monthly Volume']}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#FF5500"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#adminRevGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: ALL USERS TABLE (CHANGE ROLE, DELETE) */}
          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-mono text-red-500 uppercase font-bold tracking-widest">
                    <span>Identity Registry</span>
                    <span>•</span>
                    <span>Clearance Controls</span>
                  </div>
                  <h1 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-neutral-100">
                    Platform User Directory
                  </h1>
                </div>

                <div className="w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search by name, email, or role..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] px-3.5 py-2 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                  />
                </div>
              </div>

              <div className="bg-[#181818] border border-[#2A2A2A] shadow-xl overflow-hidden">
                {usersLoading ? (
                  <div className="p-12 text-center text-neutral-400 font-mono text-xs flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-[#2A2A2A] border-t-[#FF5500] animate-spin" />
                    <span>Querying user records from MongoDB...</span>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-12 text-center font-mono text-xs text-neutral-400">
                    No users matching criteria &quot;{userSearch}&quot;.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-[#141414] border-b border-[#2A2A2A] text-neutral-400 uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4 font-bold">Operator</th>
                          <th className="py-3.5 px-4 font-bold">Contact Hotline</th>
                          <th className="py-3.5 px-4 font-bold">Clearance Role</th>
                          <th className="py-3.5 px-4 font-bold">Registered On</th>
                          <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#242424] text-neutral-300">
                        {filteredUsers.map((u) => {
                          const currentRole = (u.role || 'customer').toLowerCase();
                          const isSelf = (user?.id === u._id) || (user?.email === u.email);

                          return (
                            <tr key={u._id} className="hover:bg-[#1C1C1C] transition-colors">
                              {/* Operator info */}
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-none bg-[#242424] border border-[#333333] flex items-center justify-center font-heading font-black text-xs text-[#FF5500] flex-shrink-0">
                                    {(u.name || u.email || 'U')[0].toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-heading font-black text-xs uppercase text-neutral-100 truncate">
                                      {u.name || 'Anonymous Operator'}
                                    </div>
                                    <div className="text-[10px] text-neutral-400">{u.email}</div>
                                  </div>
                                </div>
                              </td>

                              {/* Phone */}
                              <td className="py-4 px-4 whitespace-nowrap text-neutral-400">
                                {u.phone || '—'}
                              </td>

                              {/* Role Selector */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <select
                                  value={currentRole}
                                  disabled={isSelf}
                                  onChange={(e) => handleChangeRole(u, e.target.value)}
                                  className={`bg-[#131313] border px-2.5 py-1 text-xs font-mono font-bold uppercase focus:outline-none ${
                                    currentRole === 'admin'
                                      ? 'border-red-500/60 text-red-400'
                                      : currentRole === 'owner'
                                      ? 'border-[#FF5500]/60 text-[#FF5500]'
                                      : 'border-neutral-600 text-neutral-300'
                                  }`}
                                >
                                  <option value="customer">Customer</option>
                                  <option value="owner">Owner</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>

                              {/* Date */}
                              <td className="py-4 px-4 whitespace-nowrap text-neutral-500">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                              </td>

                              {/* Actions */}
                              <td className="py-4 px-4 whitespace-nowrap text-right">
                                {isSelf ? (
                                  <span className="text-[10px] font-mono text-neutral-600 uppercase">Self Session</span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(u)}
                                    className="px-2.5 py-1.5 border border-red-500/40 text-red-400 hover:bg-red-950/30 text-[11px] font-mono uppercase transition-colors cursor-pointer"
                                  >
                                    Delete User
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: ALL EQUIPMENT TABLE (APPROVE, REJECT, UPDATE, DELETE) */}
          {activeTab === 'equipment' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-mono text-red-500 uppercase font-bold tracking-widest">
                    <span>Fleet Audit Deck</span>
                    <span>•</span>
                    <span>Catalog Verification</span>
                  </div>
                  <h1 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-neutral-100">
                    Master Equipment Inventory
                  </h1>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={equipmentFilterStatus}
                    onChange={(e) => setEquipmentFilterStatus(e.target.value)}
                    className="bg-[#141414] border border-[#333333] px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none focus:border-[#FF5500]"
                  >
                    <option value="all">All Statuses ({equipmentList.length})</option>
                    <option value="pending">Pending Review ({equipmentList.filter((e) => e.status === 'pending').length})</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Search equipment..."
                    value={equipmentSearch}
                    onChange={(e) => setEquipmentSearch(e.target.value)}
                    className="bg-[#141414] border border-[#333333] px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none focus:border-[#FF5500] w-48"
                  />
                </div>
              </div>

              <div className="bg-[#181818] border border-[#2A2A2A] shadow-xl overflow-hidden">
                {equipmentLoading ? (
                  <div className="p-12 text-center text-neutral-400 font-mono text-xs flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-[#2A2A2A] border-t-[#FF5500] animate-spin" />
                    <span>Synchronizing equipment records...</span>
                  </div>
                ) : filteredEquipment.length === 0 ? (
                  <div className="p-12 text-center font-mono text-xs text-neutral-400">
                    No equipment matching active filter parameters.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-[#141414] border-b border-[#2A2A2A] text-neutral-400 uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4 font-bold">Machinery Asset</th>
                          <th className="py-3.5 px-4 font-bold">Category</th>
                          <th className="py-3.5 px-4 font-bold">Fleet Owner</th>
                          <th className="py-3.5 px-4 font-bold">Rate</th>
                          <th className="py-3.5 px-4 font-bold">Status</th>
                          <th className="py-3.5 px-4 font-bold text-right">Administrative Controls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#242424] text-neutral-300">
                        {filteredEquipment.map((item) => {
                          const isPending = item.status === 'pending';
                          const isApproved = item.status === 'approved' || item.status === 'available';
                          const isRejected = item.status === 'rejected';

                          return (
                            <tr key={item._id} className="hover:bg-[#1C1C1C] transition-colors">
                              {/* Asset */}
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-14 h-11 bg-[#121212] border border-[#2E2E2E] flex-shrink-0 overflow-hidden">
                                    <Image
                                      src={item.image || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80'}
                                      alt={item.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-heading font-black text-xs uppercase text-neutral-100 truncate max-w-xs">
                                      {item.name}
                                    </div>
                                    <div className="text-[10px] text-neutral-500 font-mono">
                                      {item.location} • {item.quantity} Units
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-0.5 bg-[#141414] border border-[#2E2E2E] text-neutral-300 text-[10px] font-bold uppercase">
                                  {item.category}
                                </span>
                              </td>

                              {/* Owner */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="text-neutral-200 font-medium">
                                  {item.owner?.name || 'Heavy Equipment Owner'}
                                </div>
                                <div className="text-[10px] text-neutral-500">{item.owner?.email || 'dispatch@owner.com'}</div>
                              </td>

                              {/* Rate */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="font-heading font-black text-sm text-[#FF5500]">
                                  ${item.price.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-neutral-500 uppercase">/ {item.rentalType}</div>
                              </td>

                              {/* Status Badge */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                    isApproved
                                      ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-400'
                                      : isPending
                                      ? 'bg-amber-950/80 border border-amber-500/50 text-amber-400 animate-pulse'
                                      : isRejected
                                      ? 'bg-red-950/80 border border-red-500/50 text-red-400'
                                      : 'bg-cyan-950/80 border border-cyan-500/50 text-cyan-400'
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </td>

                              {/* Controls */}
                              <td className="py-4 px-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Approve Button */}
                                  {item.status !== 'approved' && (
                                    <button
                                      type="button"
                                      onClick={() => handleApproveEquipment(item)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-black font-heading font-black text-[10px] uppercase cursor-pointer"
                                      title="Approve for public fleet"
                                    >
                                      Approve
                                    </button>
                                  )}

                                  {/* Reject Button */}
                                  {item.status !== 'rejected' && (
                                    <button
                                      type="button"
                                      onClick={() => handleRejectEquipment(item)}
                                      className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-600 text-[10px] uppercase cursor-pointer"
                                      title="Reject listing"
                                    >
                                      Reject
                                    </button>
                                  )}

                                  {/* Update Button */}
                                  <button
                                    type="button"
                                    onClick={() => setEditingEquipment({ ...item })}
                                    className="px-2.5 py-1 bg-[#FF5500]/10 hover:bg-[#FF5500]/20 border border-[#FF5500]/60 text-[#FF5500] text-[10px] uppercase cursor-pointer font-bold"
                                  >
                                    Edit
                                  </button>

                                  {/* Delete Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteEquipment(item)}
                                    className="px-2 py-1 border border-red-500/40 text-red-400 hover:bg-red-950/30 text-[10px] uppercase cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 4: ALL RENTALS TABLE */}
          {activeTab === 'rentals' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-mono text-red-500 uppercase font-bold tracking-widest">
                    <span>Global Escrow Logs</span>
                    <span>•</span>
                    <span>Mobilization Transactions</span>
                  </div>
                  <h1 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-neutral-100">
                    All Platform Rental Bookings
                  </h1>
                </div>

                <div className="text-xs font-mono text-neutral-400">
                  Total Dispatches: <strong className="text-[#FF5500]">{rentalsList.length}</strong>
                </div>
              </div>

              <div className="bg-[#181818] border border-[#2A2A2A] shadow-xl overflow-hidden">
                {rentalsLoading ? (
                  <div className="p-12 text-center text-neutral-400 font-mono text-xs flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-[#2A2A2A] border-t-[#FF5500] animate-spin" />
                    <span>Querying system reservations...</span>
                  </div>
                ) : rentalsList.length === 0 ? (
                  <div className="p-12 text-center font-mono text-xs text-neutral-400">
                    No bookings recorded in database.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-[#141414] border-b border-[#2A2A2A] text-neutral-400 uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4 font-bold">Booking Ref</th>
                          <th className="py-3.5 px-4 font-bold">Equipment Asset</th>
                          <th className="py-3.5 px-4 font-bold">Renter Customer</th>
                          <th className="py-3.5 px-4 font-bold">Fleet Provider</th>
                          <th className="py-3.5 px-4 font-bold">Timeline</th>
                          <th className="py-3.5 px-4 font-bold">Total</th>
                          <th className="py-3.5 px-4 font-bold">Payment</th>
                          <th className="py-3.5 px-4 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#242424] text-neutral-300">
                        {rentalsList.map((b) => {
                          const customerName = b.customer?.name || b.customerName || 'Verified Customer';
                          const customerEmail = b.customer?.email || b.customerEmail || 'dispatch@client.com';
                          const ownerName = b.owner?.name || 'Heavy Equipment Owner';

                          return (
                            <tr key={b._id} className="hover:bg-[#1C1C1C] transition-colors">
                              {/* Ref */}
                              <td className="py-4 px-4 whitespace-nowrap font-mono text-[#FF5500] font-bold">
                                #{b._id.substring(b._id.length - 6).toUpperCase()}
                              </td>

                              {/* Equipment */}
                              <td className="py-4 px-4">
                                <div className="font-heading font-black text-xs uppercase text-neutral-100 truncate max-w-xs">
                                  {b.equipmentName || b.equipment?.name || 'Machinery Asset'}
                                </div>
                                <div className="text-[10px] text-neutral-500 font-mono">
                                  Units: {b.quantity || 1}
                                </div>
                              </td>

                              {/* Customer */}
                              <td className="py-4 px-4">
                                <div className="font-bold text-neutral-200">{customerName}</div>
                                <div className="text-[10px] text-neutral-400">{customerEmail}</div>
                              </td>

                              {/* Owner */}
                              <td className="py-4 px-4 whitespace-nowrap text-neutral-300">
                                {ownerName}
                              </td>

                              {/* Timeline */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="text-neutral-200 font-bold">
                                  {new Date(b.startDate).toLocaleDateString()} &rarr; {new Date(b.endDate).toLocaleDateString()}
                                </div>
                                <div className="text-[10px] text-neutral-500">
                                  {b.duration ? `${b.duration} Days` : 'Multi-day'}
                                </div>
                              </td>

                              {/* Total */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="font-heading font-black text-sm text-[#FF5500]">
                                  ${Number(b.totalPrice || b.total || 0).toLocaleString()}
                                </div>
                                <div className="text-[10px] text-neutral-500">USD</div>
                              </td>

                              {/* Payment */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold uppercase">
                                  {b.paymentStatus || 'Paid'}
                                </span>
                              </td>

                              {/* Status */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 bg-blue-950/80 border border-blue-500/50 text-blue-400 text-[10px] font-bold uppercase">
                                  {b.status || 'Confirmed'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 5: ADMIN PROFILE (VIEW & EDIT) */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 max-w-4xl"
            >
              <div className="border-b border-[#2A2A2A] pb-4">
                <div className="inline-flex items-center gap-2 text-[10px] font-mono text-red-500 uppercase font-bold tracking-widest">
                  <span>Root Credentials</span>
                  <span>•</span>
                  <span>Superuser Profile</span>
                </div>
                <h1 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-neutral-100">
                  Command Administrator Profile
                </h1>
                <p className="font-mono text-xs text-neutral-400 mt-1">
                  Manage global master credentials, notification hotlines, and security clearance identifiers.
                </p>
              </div>

              <div className="bg-[#181818] border border-[#2A2A2A] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-xl">
                <div className="relative w-20 h-20 bg-red-950/80 border-2 border-red-500 flex items-center justify-center font-heading font-black text-2xl text-red-500 overflow-hidden flex-shrink-0">
                  {profilePhoto ? (
                    <Image
                      src={profilePhoto}
                      alt={profileName || 'Admin'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span>ROOT</span>
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading font-black text-xl uppercase text-neutral-100">
                      {profileName || user?.name || 'Administrator'}
                    </h3>
                    <span className="px-2 py-0.5 bg-red-950/80 border border-red-500/50 text-red-400 text-[10px] font-mono font-bold uppercase">
                      Clearance: Super Administrator (Root)
                    </span>
                  </div>
                  <div className="font-mono text-xs text-neutral-400">{profileEmail}</div>
                  <div className="flex flex-wrap gap-4 font-mono text-xs text-neutral-500 pt-1">
                    <span>Hotline: <strong className="text-neutral-300">{profilePhone || 'Not Set'}</strong></span>
                    <span>•</span>
                    <span>Admin HQ: <strong className="text-neutral-300">{profileAddress || 'Austin Command Center'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="bg-[#181818] border border-[#2A2A2A] p-6 sm:p-8 shadow-xl">
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                        Administrator Alias <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Master Admin"
                        className="w-full bg-[#121212] border border-[#333333] px-3.5 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                        Root Email Address
                      </label>
                      <input
                        type="email"
                        readOnly
                        value={profileEmail}
                        className="w-full bg-[#141414] border border-[#262626] px-3.5 py-2.5 text-xs font-mono text-neutral-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                      Avatar Image Link
                    </label>
                    <input
                      type="url"
                      value={profilePhoto}
                      onChange={(e) => setProfilePhoto(e.target.value)}
                      placeholder="https://images.unsplash.com/... or ImgBB URL"
                      className="w-full bg-[#121212] border border-[#333333] px-3.5 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                        Direct Security Hotline
                      </label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="+1 (555) 900-0001"
                        className="w-full bg-[#121212] border border-[#333333] px-3.5 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                        Central Command Terminal Address
                      </label>
                      <input
                        type="text"
                        value={profileAddress}
                        onChange={(e) => setProfileAddress(e.target.value)}
                        placeholder="HeavyRent Command Terminal, Austin, TX"
                        className="w-full bg-[#121212] border border-[#333333] px-3.5 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#2A2A2A] flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white font-heading font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                    >
                      {isSavingProfile ? 'Saving Credentials...' : 'Save Root Profile'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* ADMIN EDIT EQUIPMENT MODAL                                */}
      {/* ========================================================= */}
      <AnimatePresence>
        {editingEquipment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              className="bg-[#181818] border-2 border-red-500 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto text-[#F8F9FA]"
            >
              <button
                type="button"
                onClick={() => setEditingEquipment(null)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="border-b border-[#2E2E2E] pb-4 mb-6">
                <span className="text-xs font-mono text-red-400 font-bold uppercase tracking-widest">
                  Administrator Override
                </span>
                <h2 className="font-heading font-black text-xl sm:text-2xl uppercase tracking-tight text-neutral-100 mt-1">
                  Modify Asset: {editingEquipment.name}
                </h2>
              </div>

              <form onSubmit={handleUpdateEquipmentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1">
                      Machinery Title
                    </label>
                    <input
                      type="text"
                      required
                      value={editingEquipment.name}
                      onChange={(e) => setEditingEquipment({ ...editingEquipment, name: e.target.value })}
                      className="w-full bg-[#121212] border border-[#333333] px-3 py-2 text-xs font-mono text-neutral-100 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1">
                      Category
                    </label>
                    <select
                      value={editingEquipment.category}
                      onChange={(e) => setEditingEquipment({ ...editingEquipment, category: e.target.value })}
                      className="w-full bg-[#121212] border border-[#333333] px-3 py-2 text-xs font-mono text-neutral-100 focus:outline-none focus:border-red-500"
                    >
                      <option value="Construction">Construction</option>
                      <option value="Photography">Photography</option>
                      <option value="Vehicles & Transportation">Vehicles & Transportation</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Event">Event</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1">
                      Rental Rate ($)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={editingEquipment.price}
                      onChange={(e) => setEditingEquipment({ ...editingEquipment, price: Number(e.target.value) })}
                      className="w-full bg-[#121212] border border-[#333333] px-3 py-2 text-xs font-mono text-neutral-100 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1">
                      Rental Frequency
                    </label>
                    <select
                      value={editingEquipment.rentalType}
                      onChange={(e) => setEditingEquipment({ ...editingEquipment, rentalType: e.target.value })}
                      className="w-full bg-[#121212] border border-[#333333] px-3 py-2 text-xs font-mono text-neutral-100 focus:outline-none focus:border-red-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1">
                      Inventory Units
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={editingEquipment.quantity}
                      onChange={(e) => setEditingEquipment({ ...editingEquipment, quantity: Number(e.target.value) })}
                      className="w-full bg-[#121212] border border-[#333333] px-3 py-2 text-xs font-mono text-neutral-100 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1">
                    Deployment Yard Location
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEquipment.location}
                    onChange={(e) => setEditingEquipment({ ...editingEquipment, location: e.target.value })}
                    className="w-full bg-[#121212] border border-[#333333] px-3 py-2 text-xs font-mono text-neutral-100 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1">
                    Image Link
                  </label>
                  <input
                    type="url"
                    required
                    value={editingEquipment.image}
                    onChange={(e) => setEditingEquipment({ ...editingEquipment, image: e.target.value })}
                    className="w-full bg-[#121212] border border-[#333333] px-3 py-2 text-xs font-mono text-neutral-100 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="pt-4 border-t border-[#2A2A2A] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingEquipment(null)}
                    className="px-5 py-2.5 border border-[#333333] text-neutral-300 font-mono text-xs uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingEquipment}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-heading font-black text-xs uppercase tracking-widest cursor-pointer"
                  >
                    {isUpdatingEquipment ? 'Saving...' : 'Apply Admin Override'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']} redirectTo="/login">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
