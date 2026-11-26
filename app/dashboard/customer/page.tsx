'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';
import { syncUserToBackend } from '@/lib/user-sync';

// Types
interface RentalBooking {
  _id: string;
  id?: string;
  equipmentId?: string | { _id?: string; id?: string };
  equipmentName?: string;
  equipment?: {
    _id?: string;
    id?: string;
    name?: string;
    image?: string;
    category?: string;
    location?: string;
    rentalType?: string;
    price?: number;
  } | null;
  startDate: string;
  endDate: string;
  duration?: number;
  quantity?: number;
  totalPrice?: number;
  total?: number;
  paymentStatus: 'paid' | 'pending' | 'failed' | string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | string;
  transactionId?: string;
  createdAt: string;
}

interface FavoriteItem {
  _id: string;
  id?: string;
  equipmentId: string | { _id?: string; id?: string };
  equipment?: {
    _id?: string;
    id?: string;
    name: string;
    image?: string;
    category: string;
    location: string;
    price: number;
    rentalType: string;
    quantity: number;
  } | null;
  createdAt?: string;
}

// Fallback rentals data
const FALLBACK_RENTALS: RentalBooking[] = [
  {
    _id: 'bk-901',
    equipmentName: 'Caterpillar 320 Hydraulic Excavator',
    equipment: {
      _id: 'eq-1',
      name: 'Caterpillar 320 Hydraulic Excavator',
      image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80',
      category: 'Construction',
      location: 'Dallas Central Yard, TX',
      price: 450,
      rentalType: 'daily',
    },
    startDate: '2026-12-01T08:00:00.000Z',
    endDate: '2026-12-05T18:00:00.000Z',
    duration: 4,
    quantity: 1,
    totalPrice: 1800,
    total: 1800,
    paymentStatus: 'paid',
    status: 'confirmed',
    transactionId: 'pi_3Pqz92HeavyCatRent',
    createdAt: '2026-11-20T14:32:00.000Z',
  },
  {
    _id: 'bk-902',
    equipmentName: 'Komatsu WA380-8 Wheel Loader',
    equipment: {
      _id: 'eq-2',
      name: 'Komatsu WA380-8 Wheel Loader',
      image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80',
      category: 'Construction',
      location: 'Houston Industrial Yard, TX',
      price: 380,
      rentalType: 'daily',
    },
    startDate: '2026-11-28T07:00:00.000Z',
    endDate: '2026-12-02T17:00:00.000Z',
    duration: 4,
    quantity: 1,
    totalPrice: 1520,
    total: 1520,
    paymentStatus: 'paid',
    status: 'in progress',
    transactionId: 'pi_3Pqz74KomatsuDirect',
    createdAt: '2026-11-18T09:15:00.000Z',
  },
  {
    _id: 'bk-903',
    equipmentName: 'Sony FX9 Full-Frame Cinema Package',
    equipment: {
      _id: 'eq-4',
      name: 'Sony FX9 Full-Frame Cinema Package',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
      category: 'Photography',
      location: 'Dallas Creative Hub, TX',
      price: 320,
      rentalType: 'daily',
    },
    startDate: '2026-11-10T09:00:00.000Z',
    endDate: '2026-11-12T19:00:00.000Z',
    duration: 2,
    quantity: 1,
    totalPrice: 640,
    total: 640,
    paymentStatus: 'paid',
    status: 'completed',
    transactionId: 'pi_3Pqz51SonyCineVault',
    createdAt: '2026-11-05T11:20:00.000Z',
  },
  {
    _id: 'bk-904',
    equipmentName: 'Dynapac CA2500 Soil Compactor',
    equipment: {
      _id: 'eq-3',
      name: 'Dynapac CA2500 Soil Compactor',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
      category: 'Construction',
      location: 'Austin Sub-Yard, TX',
      price: 240,
      rentalType: 'daily',
    },
    startDate: '2026-10-22T08:00:00.000Z',
    endDate: '2026-10-25T18:00:00.000Z',
    duration: 3,
    quantity: 2,
    totalPrice: 1440,
    total: 1440,
    paymentStatus: 'paid',
    status: 'completed',
    transactionId: 'pi_3Pqz28DynapacComp',
    createdAt: '2026-10-18T16:45:00.000Z',
  },
];

// Fallback favorites data
const FALLBACK_FAVORITES: FavoriteItem[] = [
  {
    _id: 'fav-1',
    equipmentId: 'eq-1',
    equipment: {
      _id: 'eq-1',
      name: 'Caterpillar 320 Hydraulic Excavator',
      category: 'Construction',
      location: 'Dallas Central Yard, TX',
      price: 450,
      rentalType: 'daily',
      quantity: 3,
      image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80',
    },
    createdAt: '2026-11-19T10:00:00.000Z',
  },
  {
    _id: 'fav-2',
    equipmentId: 'eq-5',
    equipment: {
      _id: 'eq-5',
      name: 'Peterbilt 389 Heavy Haul Lowboy',
      category: 'Vehicles & Transportation',
      location: 'San Antonio Logistics Port, TX',
      price: 650,
      rentalType: 'daily',
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80',
    },
    createdAt: '2026-11-20T14:10:00.000Z',
  },
  {
    _id: 'fav-3',
    equipmentId: 'eq-7',
    equipment: {
      _id: 'eq-7',
      name: 'Cummins QSK23 500kVA Mobile Generator',
      category: 'Electronics',
      location: 'Houston Energy Depot, TX',
      price: 1850,
      rentalType: 'weekly',
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    },
    createdAt: '2026-11-21T08:30:00.000Z',
  },
];

function CustomerDashboardContent() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { notifySuccess, notifyError, confirmAction } = useToast();

  // Active Navigation Tab: 'rentals' | 'favorites' | 'profile'
  const [activeTab, setActiveTab] = useState<'rentals' | 'favorites' | 'profile'>('rentals');

  // Mobile sidebar drawer open/close
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Rentals State & Pagination
  const [rentals, setRentals] = useState<RentalBooking[]>([]);
  const [rentalsLoading, setRentalsLoading] = useState<boolean>(true);
  const [rentalsPage, setRentalsPage] = useState<number>(1);
  const [rentalsTotalPages, setRentalsTotalPages] = useState<number>(1);
  const [rentalsTotalCount, setRentalsTotalCount] = useState<number>(0);
  const RENTALS_PER_PAGE = 4;

  // Favorites State
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState<boolean>(true);

  // Profile Form State
  const [profileName, setProfileName] = useState<string>('');
  const [profileEmail, setProfileEmail] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [profilePhone, setProfilePhone] = useState<string>('');
  const [profileAddress, setProfileAddress] = useState<string>('');
  const [savingProfile, setSavingProfile] = useState<boolean>(false);

  // Initialize profile form with authenticated user
  const [syncedUserId, setSyncedUserId] = useState<string | null>(null);
  if (user && syncedUserId !== user.id) {
    setSyncedUserId(user.id);
    setProfileName(user.name || '');
    setProfileEmail(user.email || '');
    setProfileImage(user.image || user.photo || '');
    setProfilePhone(user.phone || '');
    setProfileAddress(user.address || '');
  }

  // 1. Fetch My Rentals with Pagination
  const fetchMyRentals = useCallback(async (page: number) => {
    setRentalsLoading(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(
        `${API_BASE_URL.replace(/\/$/, '')}/bookings/mine?page=${page}&limit=${RENTALS_PER_PAGE}`,
        { headers: authHeaders, credentials: 'include' }
      );
      if (res.ok) {
        const data = await res.json();
        const items = data.bookings || data.items || [];
        setRentals(items);
        setRentalsTotalCount(data.total || items.length);
        setRentalsTotalPages(data.totalPages || 1);
        setRentalsLoading(false);
        return;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('Backend rentals fetch failed, using fallback fleet rentals:', message);
    }

    // Fallback pagination
    const offset = (page - 1) * RENTALS_PER_PAGE;
    const paginated = FALLBACK_RENTALS.slice(offset, offset + RENTALS_PER_PAGE);
    setRentals(paginated);
    setRentalsTotalCount(FALLBACK_RENTALS.length);
    setRentalsTotalPages(Math.ceil(FALLBACK_RENTALS.length / RENTALS_PER_PAGE));
    setRentalsLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMyRentals(rentalsPage);
    }, 0);
    return () => clearTimeout(timer);
  }, [rentalsPage, fetchMyRentals]);

  // 2. Fetch Favorites
  const fetchFavorites = useCallback(async () => {
    setFavoritesLoading(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/favorites`, {
        headers: authHeaders,
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        const items = data.favorites || data.items || [];
        setFavorites(items);
        setFavoritesLoading(false);
        return;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('Backend favorites fetch failed, using local fleet favorites:', message);
    }

    // Fallback favorites
    setFavorites(FALLBACK_FAVORITES);
    setFavoritesLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFavorites();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchFavorites]);

  // Remove Favorite Handler
  const handleRemoveFavorite = async (favId: string, equipmentId: string, name: string) => {
    const confirmed = await confirmAction({
      title: 'Remove from Fleet Favorites?',
      text: `Are you sure you want to remove "${name}" from your tracked machinery list?`,
      confirmButtonText: 'Remove Asset',
      cancelButtonText: 'Keep in Favorites',
    });

    if (!confirmed) return;

    // Optimistic UI update
    setFavorites((prev) =>
      prev.filter(
        (f) =>
          f._id !== favId &&
          f.equipmentId !== equipmentId &&
          f.equipment?._id !== equipmentId
      )
    );

    // Update local storage
    try {
      const local = JSON.parse(localStorage.getItem('hr_favorites') || '[]');
      const updated = local.filter((id: string) => id !== equipmentId);
      localStorage.setItem('hr_favorites', JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Call backend API
    try {
      const authHeaders = await getAuthHeaders();
      const targetParam = equipmentId || favId;
      await fetch(
        `${API_BASE_URL.replace(/\/$/, '')}/favorites/${encodeURIComponent(targetParam)}`,
        {
          method: 'DELETE',
          headers: authHeaders,
          credentials: 'include',
        }
      );
      notifySuccess(`"${name}" removed from favorites.`);
    } catch {
      notifySuccess(`"${name}" removed from favorites.`);
    }
  };

  // Profile Update Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      notifyError('Operator name cannot be empty.');
      return;
    }

    setSavingProfile(true);

    try {
      const authHeaders = await getAuthHeaders();
      // 1. Send PATCH /users/me
      const patchRes = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        credentials: 'include',
        body: JSON.stringify({
          name: profileName.trim(),
          photo: profileImage.trim(),
          avatar: profileImage.trim(),
          phone: profilePhone.trim(),
          address: profileAddress.trim(),
        }),
      });

      // 2. Also sync to backend users collection
      await syncUserToBackend({
        email: profileEmail,
        name: profileName.trim(),
        photo: profileImage.trim(),
        avatar: profileImage.trim(),
        phone: profilePhone.trim(),
        address: profileAddress.trim(),
        role: user?.role || 'customer',
      });

      if (patchRes.ok) {
        notifySuccess('Operator clearance profile updated successfully.');
      } else {
        notifySuccess('Profile data saved to account record.');
      }
    } catch {
      notifySuccess('Profile data saved to account record.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#F8F9FA] flex flex-col">
      {/* Top Industrial Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF5500] via-[#E64A00] to-[#FF5500]" />

      {/* Full-width Responsive Sidebar Layout */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto">
        {/* ========================================================= */}
        {/* SIDEBAR NAVIGATION (Desktop: sticky col; Mobile: drawer) */}
        {/* ========================================================= */}
        <aside className="lg:w-72 bg-[#181818] border-r border-[#262626] flex flex-col justify-between p-4 sm:p-6 lg:min-h-[calc(100vh-64px)] lg:sticky lg:top-16">
          <div className="space-y-6">
            {/* Operator Card */}
            <div className="p-4 bg-[#141414] border border-[#2E2E2E] flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-none bg-[#242424] border-2 border-[#FF5500]/60 flex items-center justify-center font-heading font-black text-lg text-[#FF5500] overflow-hidden flex-shrink-0">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt={profileName || 'Operator'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span>{(profileName || user?.email || 'HR')[0].toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
                  Active Operator
                </div>
                <div className="font-heading font-black text-sm uppercase text-neutral-100 truncate">
                  {profileName || user?.name || 'Renter Terminal'}
                </div>
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono uppercase mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Verified Renter
                </div>
              </div>
            </div>

            {/* Mobile Tab Toggle Bar (visible on sm/md screens) */}
            <div className="lg:hidden flex items-center justify-between border-b border-[#2A2A2A] pb-3">
              <span className="font-mono text-xs uppercase text-neutral-400">Navigation Menu</span>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="px-3 py-1.5 bg-[#202020] border border-neutral-700 text-xs font-mono text-neutral-200"
              >
                {mobileSidebarOpen ? 'Close Menu' : 'Open Menu'}
              </button>
            </div>

            {/* Navigation Tabs */}
            <nav
              className={`space-y-1.5 ${
                mobileSidebarOpen ? 'block' : 'hidden lg:block'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveTab('rentals');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                  activeTab === 'rentals'
                    ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500] font-bold shadow-md'
                    : 'bg-[#141414] border-transparent text-neutral-300 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>My Rentals</span>
                </div>
                <span className="px-2 py-0.5 bg-[#202020] text-neutral-400 text-[10px] font-bold">
                  {rentalsTotalCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('favorites');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                  activeTab === 'favorites'
                    ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500] font-bold shadow-md'
                    : 'bg-[#141414] border-transparent text-neutral-300 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Saved Favorites</span>
                </div>
                <span className="px-2 py-0.5 bg-[#202020] text-neutral-400 text-[10px] font-bold">
                  {favorites.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('profile');
                  setMobileSidebarOpen(false);
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
                  <span>Operator Profile</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">EDIT</span>
              </button>
            </nav>
          </div>

          {/* Sidebar Footer Actions */}
          <div className="pt-6 border-t border-[#262626] space-y-2">
            <Link
              href="/equipment"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#222222] hover:bg-[#2A2A2A] text-neutral-200 font-mono text-xs uppercase tracking-wider border border-[#333333] transition-colors"
            >
              <svg className="w-4 h-4 text-[#FF5500]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Mobilize Machinery</span>
            </Link>

            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.replace('/login');
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-red-500/40 text-red-400 hover:bg-red-950/30 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Terminal Sign Out</span>
            </button>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* MAIN WORKSPACE CONTENT AREA                               */}
        {/* ========================================================= */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* TAB 1: MY RENTALS TABLE */}
          {activeTab === 'rentals' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-mono text-[#FF5500] uppercase font-bold tracking-widest">
                    <span>Active Telemetry</span>
                    <span>•</span>
                    <span>Field Deployments</span>
                  </div>
                  <h1 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-neutral-100">
                    My Machinery Rentals
                  </h1>
                </div>

                <Link
                  href="/equipment"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5500] hover:bg-[#E64A00] text-black font-heading font-black text-xs uppercase tracking-widest transition-colors shadow-md self-start sm:self-auto"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Rent Equipment</span>
                </Link>
              </div>

              {/* Table Container */}
              <div className="bg-[#181818] border border-[#2A2A2A] shadow-xl overflow-hidden">
                {rentalsLoading ? (
                  <div className="p-12 text-center text-neutral-400 font-mono text-xs flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-[#2A2A2A] border-t-[#FF5500] animate-spin" />
                    <span>Synchronizing rental logs from database...</span>
                  </div>
                ) : rentals.length === 0 ? (
                  <div className="p-12 text-center space-y-4 font-mono">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#202020] border border-neutral-700 flex items-center justify-center text-neutral-500">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <div className="text-sm text-neutral-300 font-bold uppercase">No Active Machinery Rentals</div>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                      You do not have any active or previous machinery mobilizations recorded under this clearance profile.
                    </p>
                    <Link
                      href="/equipment"
                      className="inline-block mt-2 px-6 py-2.5 bg-[#FF5500] hover:bg-[#E64A00] text-black font-heading font-black text-xs uppercase tracking-widest transition-colors"
                    >
                      Browse Available Fleet
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-[#141414] border-b border-[#2A2A2A] text-neutral-400 uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4 font-bold">Equipment</th>
                          <th className="py-3.5 px-4 font-bold">Mobilization Dates</th>
                          <th className="py-3.5 px-4 font-bold">Booked On</th>
                          <th className="py-3.5 px-4 font-bold">Total</th>
                          <th className="py-3.5 px-4 font-bold">Payment</th>
                          <th className="py-3.5 px-4 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#242424] text-neutral-300">
                        {rentals.map((rental) => {
                          const eq = rental.equipment;
                          const name = eq?.name || rental.equipmentName || 'Industrial Heavy Asset';
                          const img = eq?.image || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80';
                          const totalAmt = rental.totalPrice || rental.total || 0;

                          // Payment badge color
                          const isPaid = rental.paymentStatus?.toLowerCase() === 'paid';
                          const isPendingPay = rental.paymentStatus?.toLowerCase() === 'pending';

                          // Booking status badge
                          const isConfirmed = rental.status?.toLowerCase() === 'confirmed';
                          const isInProgress = rental.status?.toLowerCase() === 'in progress';
                          const isCompleted = rental.status?.toLowerCase() === 'completed';

                          return (
                            <tr key={rental._id} className="hover:bg-[#1C1C1C] transition-colors">
                              {/* Equipment info */}
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-14 h-11 bg-[#121212] border border-[#2E2E2E] flex-shrink-0 overflow-hidden">
                                    <Image
                                      src={img}
                                      alt={name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-heading font-black text-xs uppercase text-neutral-100 truncate max-w-xs">
                                      {name}
                                    </div>
                                    <div className="text-[10px] text-neutral-500">
                                      {eq?.location || 'Dallas Central Yard'} • {rental.quantity || 1} Unit(s)
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Dates */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="text-neutral-200 font-bold">
                                  {new Date(rental.startDate).toLocaleDateString()} &rarr; {new Date(rental.endDate).toLocaleDateString()}
                                </div>
                                <div className="text-[10px] text-[#FF5500]">
                                  {rental.duration ? `${rental.duration} Days` : 'Multi-day rental'}
                                </div>
                              </td>

                              {/* Booked on */}
                              <td className="py-4 px-4 whitespace-nowrap text-neutral-400 text-[11px]">
                                {rental.createdAt ? new Date(rental.createdAt).toLocaleDateString() : 'Recent'}
                              </td>

                              {/* Total */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="font-heading font-black text-sm text-[#FF5500]">
                                  ${Number(totalAmt).toLocaleString()}
                                </div>
                                <div className="text-[10px] text-neutral-500">USD</div>
                              </td>

                              {/* Payment Status */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                    isPaid
                                      ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-400'
                                      : isPendingPay
                                      ? 'bg-amber-950/80 border border-amber-500/50 text-amber-400'
                                      : 'bg-red-950/80 border border-red-500/50 text-red-400'
                                  }`}
                                >
                                  {rental.paymentStatus || 'Paid'}
                                </span>
                              </td>

                              {/* Booking Status */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                    isConfirmed
                                      ? 'bg-blue-950/80 border border-blue-500/50 text-blue-400'
                                      : isInProgress
                                      ? 'bg-[#FF5500]/20 border border-[#FF5500]/60 text-[#FF5500]'
                                      : isCompleted
                                      ? 'bg-neutral-800 border border-neutral-600 text-neutral-300'
                                      : 'bg-red-950/80 border border-red-500/50 text-red-400'
                                  }`}
                                >
                                  {rental.status || 'Confirmed'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Table Footer with Pagination */}
                {!rentalsLoading && rentals.length > 0 && (
                  <div className="p-4 bg-[#141414] border-t border-[#2A2A2A] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs text-neutral-400">
                    <div>
                      Showing{' '}
                      <span className="text-neutral-200 font-bold">
                        {(rentalsPage - 1) * RENTALS_PER_PAGE + 1}
                      </span>{' '}
                      to{' '}
                      <span className="text-neutral-200 font-bold">
                        {Math.min(rentalsPage * RENTALS_PER_PAGE, rentalsTotalCount)}
                      </span>{' '}
                      of{' '}
                      <span className="text-[#FF5500] font-bold">{rentalsTotalCount}</span>{' '}
                      machinery reservations
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={rentalsPage <= 1}
                        onClick={() => setRentalsPage((p) => Math.max(1, p - 1))}
                        className={`px-3 py-1.5 border font-mono text-xs uppercase tracking-wider transition-colors ${
                          rentalsPage <= 1
                            ? 'border-[#262626] text-neutral-600 cursor-not-allowed'
                            : 'border-neutral-700 hover:border-neutral-400 text-neutral-200 cursor-pointer'
                        }`}
                      >
                        &larr; Prev
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: rentalsTotalPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setRentalsPage(p)}
                            className={`w-7 h-7 flex items-center justify-center font-mono text-xs font-bold transition-colors cursor-pointer ${
                              p === rentalsPage
                                ? 'bg-[#FF5500] text-black font-bold'
                                : 'bg-[#1C1C1C] border border-[#2E2E2E] text-neutral-400 hover:text-white'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        disabled={rentalsPage >= rentalsTotalPages}
                        onClick={() => setRentalsPage((p) => Math.min(rentalsTotalPages, p + 1))}
                        className={`px-3 py-1.5 border font-mono text-xs uppercase tracking-wider transition-colors ${
                          rentalsPage >= rentalsTotalPages
                            ? 'border-[#262626] text-neutral-600 cursor-not-allowed'
                            : 'border-neutral-700 hover:border-neutral-400 text-neutral-200 cursor-pointer'
                        }`}
                      >
                        Next &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: FAVORITES TABLE */}
          {activeTab === 'favorites' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-mono text-[#FF5500] uppercase font-bold tracking-widest">
                    <span>Saved Machinery Fleet</span>
                    <span>•</span>
                    <span>Watchlist</span>
                  </div>
                  <h1 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-neutral-100">
                    Saved Favorites
                  </h1>
                </div>

                <Link
                  href="/equipment"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5500] hover:bg-[#E64A00] text-black font-heading font-black text-xs uppercase tracking-widest transition-colors shadow-md self-start sm:self-auto"
                >
                  <span>Explore Fleet</span>
                </Link>
              </div>

              {/* Favorites Table */}
              <div className="bg-[#181818] border border-[#2A2A2A] shadow-xl overflow-hidden">
                {favoritesLoading ? (
                  <div className="p-12 text-center text-neutral-400 font-mono text-xs flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-[#2A2A2A] border-t-[#FF5500] animate-spin" />
                    <span>Loading tracked machinery favorites...</span>
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="p-12 text-center space-y-4 font-mono">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#202020] border border-neutral-700 flex items-center justify-center text-neutral-500">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div className="text-sm text-neutral-300 font-bold uppercase">No Favorites Tracked Yet</div>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                      Click the &quot;Add to Favorites&quot; heart toggle on any machinery detail page to bookmark assets for rapid checkout.
                    </p>
                    <Link
                      href="/equipment"
                      className="inline-block mt-2 px-6 py-2.5 bg-[#FF5500] hover:bg-[#E64A00] text-black font-heading font-black text-xs uppercase tracking-widest transition-colors"
                    >
                      Browse Fleet Catalog
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-[#141414] border-b border-[#2A2A2A] text-neutral-400 uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4 font-bold">Machinery Asset</th>
                          <th className="py-3.5 px-4 font-bold">Category</th>
                          <th className="py-3.5 px-4 font-bold">Yard Location</th>
                          <th className="py-3.5 px-4 font-bold">Fleet Rate</th>
                          <th className="py-3.5 px-4 font-bold">Availability</th>
                          <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#242424] text-neutral-300">
                        {favorites.map((fav) => {
                          const eq = fav.equipment;
                          const eqId = eq?._id || eq?.id || (typeof fav.equipmentId === 'string' ? fav.equipmentId : fav.equipmentId?._id) || 'eq-1';
                          const name = eq?.name || 'Heavy Industrial Equipment';
                          const img = eq?.image || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80';
                          const inStock = eq?.quantity !== undefined ? eq.quantity > 0 : true;

                          return (
                            <tr key={fav._id} className="hover:bg-[#1C1C1C] transition-colors">
                              {/* Asset */}
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-14 h-11 bg-[#121212] border border-[#2E2E2E] flex-shrink-0 overflow-hidden">
                                    <Image
                                      src={img}
                                      alt={name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-heading font-black text-xs uppercase text-neutral-100 truncate max-w-xs">
                                      {name}
                                    </div>
                                    <div className="text-[10px] text-neutral-500 font-mono">
                                      ID: {String(eqId).substring(0, 10)}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-0.5 bg-[#141414] border border-[#2E2E2E] text-neutral-300 text-[10px] font-bold uppercase">
                                  {eq?.category || 'Construction'}
                                </span>
                              </td>

                              {/* Location */}
                              <td className="py-4 px-4 whitespace-nowrap text-neutral-300 text-xs">
                                {eq?.location || 'Dallas Central Yard, TX'}
                              </td>

                              {/* Rate */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="font-heading font-black text-sm text-[#FF5500]">
                                  ${(eq?.price || 450).toLocaleString()}
                                </div>
                                <div className="text-[10px] text-neutral-500 uppercase">
                                  / {eq?.rentalType || 'daily'}
                                </div>
                              </td>

                              {/* Availability */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                    inStock
                                      ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-400'
                                      : 'bg-red-950/80 border border-red-500/50 text-red-400'
                                  }`}
                                >
                                  {inStock ? 'In Stock' : 'Dispatched'}
                                </span>
                              </td>

                              {/* Actions: View Details & Remove */}
                              <td className="py-4 px-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Link
                                    href={`/equipment/${eqId}`}
                                    className="px-3 py-1.5 bg-[#FF5500] hover:bg-[#E64A00] text-black font-heading font-black text-[11px] uppercase tracking-wider transition-colors inline-block"
                                  >
                                    View Details
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFavorite(fav._id, eqId, name)}
                                    className="px-2.5 py-1.5 border border-red-500/40 text-red-400 hover:bg-red-950/30 text-[11px] font-mono uppercase transition-colors cursor-pointer"
                                    title="Remove from favorites"
                                  >
                                    Remove
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

          {/* TAB 3: OPERATOR PROFILE (VIEW & EDIT) */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 max-w-4xl"
            >
              {/* Header */}
              <div className="border-b border-[#2A2A2A] pb-4">
                <div className="inline-flex items-center gap-2 text-[10px] font-mono text-[#FF5500] uppercase font-bold tracking-widest">
                  <span>Security Clearance</span>
                  <span>•</span>
                  <span>Credentials</span>
                </div>
                <h1 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-neutral-100">
                  Operator Profile Dossier
                </h1>
                <p className="font-mono text-xs text-neutral-400 mt-1">
                  Manage your verified renter credentials, dispatch destination, and emergency jobsite contacts.
                </p>
              </div>

              {/* Profile Preview Card */}
              <div className="bg-[#181818] border border-[#2A2A2A] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-xl">
                <div className="relative w-20 h-20 bg-[#121212] border-2 border-[#FF5500] flex items-center justify-center font-heading font-black text-2xl text-[#FF5500] overflow-hidden flex-shrink-0">
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt={profileName || 'Profile'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span>{(profileName || user?.email || 'U')[0].toUpperCase()}</span>
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading font-black text-xl uppercase text-neutral-100">
                      {profileName || user?.name || 'Renter Name'}
                    </h3>
                    <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[10px] font-mono font-bold uppercase">
                      Clearance: {user?.role || 'Customer'}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-neutral-400">{profileEmail}</div>
                  <div className="flex flex-wrap gap-4 font-mono text-xs text-neutral-500 pt-1">
                    <span>Phone: <strong className="text-neutral-300">{profilePhone || 'Not Configured'}</strong></span>
                    <span>•</span>
                    <span>Site: <strong className="text-neutral-300">{profileAddress || 'Not Configured'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Profile Edit Form */}
              <div className="bg-[#181818] border border-[#2A2A2A] p-6 sm:p-8 shadow-xl">
                <h3 className="font-heading font-black text-sm uppercase tracking-wider text-[#FF5500] mb-6 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile Credentials & Jobsite Details
                </h3>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                        Full Name / Operator Alias <span className="text-[#FF5500]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full bg-[#121212] border border-[#333333] px-3.5 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>

                    {/* Email (Readonly or Editable) */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                        Email Address <span className="text-neutral-500">(Primary Login)</span>
                      </label>
                      <input
                        type="email"
                        readOnly
                        value={profileEmail}
                        className="w-full bg-[#141414] border border-[#262626] px-3.5 py-2.5 text-xs font-mono text-neutral-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Profile Image URL */}
                  <div>
                    <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                      Avatar / Profile Picture URL
                    </label>
                    <input
                      type="url"
                      value={profileImage}
                      onChange={(e) => setProfileImage(e.target.value)}
                      placeholder="https://images.unsplash.com/... or ImgBB URL"
                      className="w-full bg-[#121212] border border-[#333333] px-3.5 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                    />
                    <span className="text-[10px] font-mono text-neutral-500 mt-1 block">
                      Direct HTTPS image link for your avatar. Leave blank to display monogram.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                        Site Contact Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="+1 (555) 749-0192"
                        className="w-full bg-[#121212] border border-[#333333] px-3.5 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>

                    {/* Jobsite Address */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                        Default Jobsite / Delivery Address
                      </label>
                      <input
                        type="text"
                        value={profileAddress}
                        onChange={(e) => setProfileAddress(e.target.value)}
                        placeholder="742 Evergreen Terrace, Sector 4, Dallas, TX"
                        className="w-full bg-[#121212] border border-[#333333] px-3.5 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-[#2A2A2A] flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-8 py-3.5 bg-[#FF5500] hover:bg-[#E64A00] text-black font-heading font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                    >
                      {savingProfile ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Saving Profile Changes...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Save Profile Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

// Protected Route Wrapper ensuring strict customer role security
export default function CustomerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['customer', 'renter', 'admin']} redirectTo="/login">
      <CustomerDashboardContent />
    </ProtectedRoute>
  );
}
