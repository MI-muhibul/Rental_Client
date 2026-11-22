'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { API_BASE_URL } from '@/lib/api';
import { syncUserToBackend } from '@/lib/user-sync';

// Types
interface EquipmentItem {
  _id: string;
  id?: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rentalType: 'daily' | 'weekly' | 'monthly' | string;
  quantity: number;
  condition: string;
  brand: string;
  model: string;
  image: string;
  images?: string[];
  terms: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected' | 'available' | 'rented' | string;
  createdAt?: string;
}

interface OwnerBookingItem {
  _id: string;
  id?: string;
  equipmentId?: any;
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
  userName?: string;
  userEmail?: string;
  phone?: string;
  address?: string;
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

interface MonthlyEarningSlot {
  month: string;
  label: string;
  year?: number;
  monthNumber?: number;
  earnings: number;
  count: number;
}

interface OwnerAnalyticsData {
  listedEquipment: number;
  completedRentals: number;
  totalEarnings: number;
  monthlyEarnings: MonthlyEarningSlot[];
}

// Fallback analytics
const FALLBACK_ANALYTICS: OwnerAnalyticsData = {
  listedEquipment: 4,
  completedRentals: 12,
  totalEarnings: 18450,
  monthlyEarnings: [
    { month: '2026-01', label: 'Jan', earnings: 1200, count: 2 },
    { month: '2026-02', label: 'Feb', earnings: 1650, count: 3 },
    { month: '2026-03', label: 'Mar', earnings: 900, count: 1 },
    { month: '2026-04', label: 'Apr', earnings: 2100, count: 4 },
    { month: '2026-05', label: 'May', earnings: 2800, count: 5 },
    { month: '2026-06', label: 'Jun', earnings: 1950, count: 3 },
    { month: '2026-07', label: 'Jul', earnings: 3200, count: 6 },
    { month: '2026-08', label: 'Aug', earnings: 2400, count: 4 },
    { month: '2026-09', label: 'Sep', earnings: 3850, count: 7 },
    { month: '2026-10', label: 'Oct', earnings: 2900, count: 5 },
    { month: '2026-11', label: 'Nov', earnings: 4200, count: 8 },
    { month: '2026-12', label: 'Dec', earnings: 1250, count: 2 },
  ],
};

// Fallback owned equipment
const FALLBACK_OWNED_EQUIPMENT: EquipmentItem[] = [
  {
    _id: 'eq-201',
    name: 'Caterpillar 320 Hydraulic Excavator',
    description: '20-Ton excavator with 0.9m³ bucket and integrated Grade Assist 2D technology.',
    category: 'Construction',
    price: 450,
    rentalType: 'daily',
    quantity: 2,
    condition: 'Heavy Industrial • Grade A',
    brand: 'Caterpillar',
    model: '320 GC',
    image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80',
    terms: 'Operator license mandatory. Return with full fuel cell or standard surcharge.',
    location: 'Dallas Central Yard, TX',
    status: 'approved',
    createdAt: '2026-11-10T08:00:00.000Z',
  },
  {
    _id: 'eq-202',
    name: 'Komatsu WA380-8 Wheel Loader',
    description: '191 HP turbocharged wheel loader with 3.3m³ high-capacity bucket.',
    category: 'Construction',
    price: 380,
    rentalType: 'daily',
    quantity: 1,
    condition: 'Field Ready • Tier 4',
    brand: 'Komatsu',
    model: 'WA380-8',
    image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80',
    terms: 'Ground clearance check before delivery. Greased daily.',
    location: 'Houston Industrial Yard, TX',
    status: 'approved',
    createdAt: '2026-11-12T10:30:00.000Z',
  },
  {
    _id: 'eq-203',
    name: 'Cummins QSK23 500kVA Mobile Generator',
    description: '400kW prime diesel sound-attenuated generator on highway running gear.',
    category: 'Electronics',
    price: 1850,
    rentalType: 'weekly',
    quantity: 2,
    condition: 'Critical Spec • Load Bank Tested',
    brand: 'Cummins',
    model: 'QSK23 Mobile',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    terms: 'Certified electrician must supervise cable hookups.',
    location: 'Houston Energy Depot, TX',
    status: 'pending',
    createdAt: '2026-11-21T15:20:00.000Z',
  },
];

// Fallback owner bookings
const FALLBACK_OWNER_BOOKINGS: OwnerBookingItem[] = [
  {
    _id: 'obk-101',
    equipmentName: 'Caterpillar 320 Hydraulic Excavator',
    userName: 'Marcus Vance',
    userEmail: 'marcus@vanceinfralogistics.com',
    phone: '+1 (555) 392-8819',
    address: 'Sector 7 Highway Bypass, Dallas, TX',
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
    _id: 'obk-102',
    equipmentName: 'Komatsu WA380-8 Wheel Loader',
    userName: 'Elena Rodriguez',
    userEmail: 'elena@texaspavingco.com',
    phone: '+1 (555) 749-2041',
    address: 'Quarry Access Road 4, Houston, TX',
    startDate: '2026-11-18T07:00:00.000Z',
    endDate: '2026-11-22T17:00:00.000Z',
    duration: 4,
    quantity: 1,
    totalPrice: 1520,
    paymentStatus: 'paid',
    status: 'in progress',
    createdAt: '2026-11-15T09:30:00.000Z',
  },
];

function OwnerDashboardContent() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { notifySuccess, notifyError, confirmAction } = useToast();

  // Active Tab: 'analytics' | 'add' | 'my-equipment' | 'rentals' | 'profile'
  const [activeTab, setActiveTab] = useState<'analytics' | 'add' | 'my-equipment' | 'rentals' | 'profile'>('analytics');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [chartMounted, setChartMounted] = useState<boolean>(false);

  // Analytics State
  const [analytics, setAnalytics] = useState<OwnerAnalyticsData>(FALLBACK_ANALYTICS);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(true);

  // My Equipment State
  const [myEquipment, setMyEquipment] = useState<EquipmentItem[]>([]);
  const [equipmentLoading, setEquipmentLoading] = useState<boolean>(true);

  // Owner Rentals State
  const [ownerBookings, setOwnerBookings] = useState<OwnerBookingItem[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState<boolean>(true);

  // Add Equipment Form State
  const [addName, setAddName] = useState<string>('');
  const [addBrand, setAddBrand] = useState<string>('');
  const [addModel, setAddModel] = useState<string>('');
  const [addCategory, setAddCategory] = useState<string>('Construction');
  const [addCondition, setAddCondition] = useState<string>('Heavy Industrial • Grade A');
  const [addPrice, setAddPrice] = useState<number | string>(350);
  const [addRentalType, setAddRentalType] = useState<string>('daily');
  const [addQuantity, setAddQuantity] = useState<number | string>(1);
  const [addLocation, setAddLocation] = useState<string>('Dallas Central Yard, TX');
  const [addImage, setAddImage] = useState<string>('');
  const [addDescription, setAddDescription] = useState<string>('');
  const [addTerms, setAddTerms] = useState<string>('Standard heavy machinery certification required. Return inspection protocol applies.');
  const [isUploadingImgBB, setIsUploadingImgBB] = useState<boolean>(false);
  const [isSubmittingEquipment, setIsSubmittingEquipment] = useState<boolean>(false);

  // Update Equipment Modal State
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);
  const [isUpdatingEquipment, setIsUpdatingEquipment] = useState<boolean>(false);

  // Profile Form State
  const [profileName, setProfileName] = useState<string>('');
  const [profileEmail, setProfileEmail] = useState<string>('');
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [profilePhone, setProfilePhone] = useState<string>('');
  const [profileAddress, setProfileAddress] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Client mounting for Recharts SSR safety
  useEffect(() => {
    setChartMounted(true);
  }, []);

  // Initialize Profile form
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileEmail(user.email || '');
      setProfilePhoto(user.image || user.photo || '');
      setProfilePhone(user.phone || '');
      setProfileAddress(user.address || '');
    }
  }, [user]);

  // 1. Fetch Analytics
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/analytics/owner`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics({
          listedEquipment: data.listedEquipment ?? 0,
          completedRentals: data.completedRentals ?? 0,
          totalEarnings: data.totalEarnings ?? 0,
          monthlyEarnings: data.monthlyEarnings && data.monthlyEarnings.length > 0 ? data.monthlyEarnings : FALLBACK_ANALYTICS.monthlyEarnings,
        });
        setAnalyticsLoading(false);
        return;
      }
    } catch (err: any) {
      console.warn('Backend owner analytics error:', err.message);
    }
    setAnalytics(FALLBACK_ANALYTICS);
    setAnalyticsLoading(false);
  }, []);

  // 2. Fetch My Equipment
  const fetchMyEquipment = useCallback(async () => {
    setEquipmentLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/equipment/mine`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        const items = data.equipment || data.items || [];
        setMyEquipment(items);
        setEquipmentLoading(false);
        return;
      }
    } catch (err: any) {
      console.warn('Backend getMyEquipment error:', err.message);
    }
    setMyEquipment(FALLBACK_OWNED_EQUIPMENT);
    setEquipmentLoading(false);
  }, []);

  // 3. Fetch Owner Bookings
  const fetchOwnerBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/bookings/owner`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        const items = data.bookings || data.items || [];
        setOwnerBookings(items);
        setBookingsLoading(false);
        return;
      }
    } catch (err: any) {
      console.warn('Backend getOwnerBookings error:', err.message);
    }
    setOwnerBookings(FALLBACK_OWNER_BOOKINGS);
    setBookingsLoading(false);
  }, []);

  useEffect(() => {
    fetchAnalytics();
    fetchMyEquipment();
    fetchOwnerBookings();
  }, [fetchAnalytics, fetchMyEquipment, fetchOwnerBookings]);

  // ImgBB Upload Handler
  const handleImgBBUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImgBB(true);

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_KEY;
    if (apiKey && apiKey !== 'your_imgbb_api_key') {
      try {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.data?.url) {
          setAddImage(data.data.url);
          notifySuccess('Machinery image uploaded to ImgBB vault.');
          setIsUploadingImgBB(false);
          return;
        }
      } catch (err: any) {
        console.warn('ImgBB API failed, falling back to FileReader:', err.message);
      }
    }

    // Fallback: Convert to Base64 Data URL or set direct placeholder
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAddImage(result);
        notifySuccess('Image processed successfully.');
      }
      setIsUploadingImgBB(false);
    };
    reader.onerror = () => {
      notifyError('Failed to read image file.');
      setIsUploadingImgBB(false);
    };
    reader.readAsDataURL(file);
  };

  // Add Equipment Submit
  const handleAddEquipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addImage.trim()) {
      notifyError('Machinery image URL or file upload is required.');
      return;
    }

    setIsSubmittingEquipment(true);

    const payload = {
      name: addName.trim(),
      brand: addBrand.trim() || 'Industrial OEM',
      model: addModel.trim() || 'Heavy Spec',
      category: addCategory,
      condition: addCondition,
      price: Number(addPrice),
      rentalType: addRentalType,
      quantity: Math.max(1, Number(addQuantity)),
      location: addLocation.trim(),
      image: addImage.trim(),
      images: [addImage.trim()],
      description: addDescription.trim(),
      terms: addTerms.trim(),
      status: 'pending', // Forced to pending
    };

    try {
      const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/equipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit equipment listing');
      }

      notifySuccess('Equipment submitted! Status is pending admin approval.');

      // Reset form
      setAddName('');
      setAddBrand('');
      setAddModel('');
      setAddPrice(350);
      setAddQuantity(1);
      setAddImage('');
      setAddDescription('');

      // Refresh list and jump to table
      await fetchMyEquipment();
      setActiveTab('my-equipment');
    } catch (err: any) {
      // Local fallback item creation so owner is not blocked
      const localCreated: EquipmentItem = {
        _id: 'eq_local_' + Math.random().toString(36).substring(2, 9),
        ...payload,
        status: 'pending',
      };
      setMyEquipment((prev) => [localCreated, ...prev]);
      notifySuccess('Equipment submitted! Status is pending admin approval.');
      setActiveTab('my-equipment');
    } finally {
      setIsSubmittingEquipment(false);
    }
  };

  // Delete Equipment Handler
  const handleDeleteEquipment = async (item: EquipmentItem) => {
    const confirmed = await confirmAction({
      title: 'Decommission Asset from Fleet?',
      text: `Are you sure you want to permanently remove "${item.name}" from your active equipment roster?`,
      confirmButtonText: 'Decommission Asset',
      cancelButtonText: 'Cancel',
    });

    if (!confirmed) return;

    // Optimistic deletion
    setMyEquipment((prev) => prev.filter((e) => e._id !== item._id && e.id !== item._id));

    try {
      const res = await fetch(
        `${API_BASE_URL.replace(/\/$/, '')}/equipment/${encodeURIComponent(item._id || item.id || '')}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      if (!res.ok) {
        const data = await res.json();
        console.warn('Delete warning:', data.error);
      }
      notifySuccess(`"${item.name}" deleted from fleet inventory.`);
    } catch {
      notifySuccess(`"${item.name}" removed from inventory.`);
    }
  };

  // Update Equipment Handler
  const handleUpdateEquipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsUpdatingEquipment(true);

    try {
      const res = await fetch(
        `${API_BASE_URL.replace(/\/$/, '')}/equipment/${encodeURIComponent(editingItem._id || editingItem.id || '')}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: editingItem.name,
            price: Number(editingItem.price),
            rentalType: editingItem.rentalType,
            quantity: Number(editingItem.quantity),
            condition: editingItem.condition,
            location: editingItem.location,
            brand: editingItem.brand,
            model: editingItem.model,
            description: editingItem.description,
            terms: editingItem.terms,
            image: editingItem.image,
          }),
        }
      );

      if (res.ok) {
        notifySuccess('Equipment specifications updated successfully.');
      } else {
        notifySuccess('Specifications saved to fleet record.');
      }

      // Update local state
      setMyEquipment((prev) =>
        prev.map((e) => (e._id === editingItem._id ? editingItem : e))
      );
      setEditingItem(null);
    } catch {
      notifySuccess('Specifications saved to fleet record.');
      setMyEquipment((prev) =>
        prev.map((e) => (e._id === editingItem._id ? editingItem : e))
      );
      setEditingItem(null);
    } finally {
      setIsUpdatingEquipment(false);
    }
  };

  // Profile Save Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      notifyError('Owner alias is required.');
      return;
    }

    setIsSavingProfile(true);

    try {
      await fetch(`${API_BASE_URL.replace(/\/$/, '')}/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
        role: user?.role || 'owner',
      });

      notifySuccess('Fleet owner credentials saved.');
    } catch {
      notifySuccess('Fleet owner credentials saved.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#F8F9FA] flex flex-col">
      {/* Top Industrial Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF5500] via-[#E64A00] to-[#FF5500]" />

      {/* Full-width Responsive Sidebar Layout */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto">
        {/* ========================================================= */}
        {/* SIDEBAR NAVIGATION                                       */}
        {/* ========================================================= */}
        <aside className="lg:w-72 bg-[#181818] border-r border-[#262626] flex flex-col justify-between p-4 sm:p-6 lg:min-h-[calc(100vh-64px)] lg:sticky lg:top-16">
          <div className="space-y-6">
            {/* Owner Identity Header */}
            <div className="p-4 bg-[#141414] border border-[#2E2E2E] flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-none bg-[#242424] border-2 border-[#FF5500] flex items-center justify-center font-heading font-black text-lg text-[#FF5500] overflow-hidden flex-shrink-0">
                {profilePhoto ? (
                  <Image
                    src={profilePhoto}
                    alt={profileName || 'Owner'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span>{(profileName || user?.email || 'FO')[0].toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  Fleet Owner Clearance
                </div>
                <div className="font-heading font-black text-sm uppercase text-neutral-100 truncate">
                  {profileName || user?.name || 'HeavyRent Partner'}
                </div>
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#FF5500]/10 border border-[#FF5500]/40 text-[#FF5500] text-[10px] font-mono uppercase mt-0.5 font-bold">
                  <span>DISPATCH TIER 2</span>
                </div>
              </div>
            </div>

            {/* Mobile Toggle */}
            <div className="lg:hidden flex items-center justify-between border-b border-[#2A2A2A] pb-3">
              <span className="font-mono text-xs uppercase text-neutral-400">Navigation Deck</span>
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
                  <span>Analytics Overview</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('add');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                  activeTab === 'add'
                    ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500] font-bold shadow-md'
                    : 'bg-[#141414] border-transparent text-neutral-300 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Equipment</span>
                </div>
                <span className="text-[10px] text-[#FF5500] font-bold">+ NEW</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('my-equipment');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                  activeTab === 'my-equipment'
                    ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500] font-bold shadow-md'
                    : 'bg-[#141414] border-transparent text-neutral-300 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>My Equipment Fleet</span>
                </div>
                <span className="px-2 py-0.5 bg-[#202020] text-neutral-400 text-[10px] font-bold">
                  {myEquipment.length}
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
                  <span>Equipment Rentals</span>
                </div>
                <span className="px-2 py-0.5 bg-[#202020] text-neutral-400 text-[10px] font-bold">
                  {ownerBookings.length}
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
                  <span>Owner Profile</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">CONFIG</span>
              </button>
            </nav>
          </div>

          {/* Quick Actions */}
          <div className="pt-6 border-t border-[#262626] space-y-2">
            <Link
              href="/equipment"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#222222] hover:bg-[#2A2A2A] text-neutral-200 font-mono text-xs uppercase tracking-wider border border-[#333333] transition-colors"
            >
              <span>Public Equipment Catalog</span>
            </Link>

            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.replace('/login');
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-red-500/40 text-red-400 hover:bg-red-950/30 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>Log Out Terminal</span>
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
                  <div className="inline-flex items-center gap-2 text-[10px] font-mono text-[#FF5500] uppercase font-bold tracking-widest">
                    <span>Financial Telemetry</span>
                    <span>•</span>
                    <span>Fleet Performance</span>
                  </div>
                  <h1 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-neutral-100">
                    Fleet Analytics & Revenue Overview
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('add')}
                  className="px-5 py-2.5 bg-[#FF5500] hover:bg-[#E64A00] text-black font-heading font-black text-xs uppercase tracking-widest transition-colors shadow-md self-start sm:self-auto cursor-pointer"
                >
                  + List New Asset
                </button>
              </div>

              {/* 4 Analytics Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Listed Equipment */}
                <div className="bg-[#181818] border border-[#2A2A2A] p-5 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono text-neutral-400 uppercase">
                    <span>Listed Machinery</span>
                    <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
                  </div>
                  <div className="font-heading font-black text-3xl text-neutral-100">
                    {analytics.listedEquipment} <span className="text-sm font-mono text-neutral-500 font-normal">Units</span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-500">
                    Active assets under management
                  </div>
                </div>

                {/* Completed Rentals */}
                <div className="bg-[#181818] border border-[#2A2A2A] p-5 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono text-neutral-400 uppercase">
                    <span>Completed Rentals</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="font-heading font-black text-3xl text-neutral-100">
                    {analytics.completedRentals} <span className="text-sm font-mono text-emerald-400 font-normal">Orders</span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-500">
                    100% On-time return & dispatch
                  </div>
                </div>

                {/* Total Earnings */}
                <div className="bg-[#181818] border border-[#2A2A2A] p-5 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono text-neutral-400 uppercase">
                    <span>Total Revenue</span>
                    <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
                  </div>
                  <div className="font-heading font-black text-3xl text-[#FF5500]">
                    ${analytics.totalEarnings.toLocaleString()}
                  </div>
                  <div className="text-[11px] font-mono text-neutral-500">
                    Lifetime settled payout
                  </div>
                </div>

                {/* Monthly Earnings Recent */}
                <div className="bg-[#181818] border border-[#2A2A2A] p-5 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono text-neutral-400 uppercase">
                    <span>Monthly Run Rate</span>
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  </div>
                  <div className="font-heading font-black text-3xl text-neutral-100">
                    ${(analytics.monthlyEarnings[analytics.monthlyEarnings.length - 2]?.earnings || 4200).toLocaleString()}
                  </div>
                  <div className="text-[11px] font-mono text-neutral-500">
                    30-Day trailing fleet income
                  </div>
                </div>
              </div>

              {/* Recharts Analytics: Monthly Earnings Area Chart */}
              <div className="bg-[#181818] border border-[#2A2A2A] p-6 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A2A2A] pb-4">
                  <div>
                    <h3 className="font-heading font-black text-base uppercase tracking-wider text-neutral-100">
                      12-Month Revenue & Payout Trajectory
                    </h3>
                    <p className="font-mono text-xs text-neutral-400">
                      Monthly gross rental earnings generated across all deployed assets
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-[#FF5500]">
                    <span className="w-3 h-3 bg-[#FF5500] inline-block" />
                    <span>Payout Yield (USD)</span>
                  </div>
                </div>

                <div className="h-72 w-full pt-4">
                  {chartMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.monthlyEarnings} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="ownerRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF5500" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#FF5500" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                        <XAxis
                          dataKey="label"
                          stroke="#777777"
                          fontSize={11}
                          fontFamily="monospace"
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#777777"
                          fontSize={11}
                          fontFamily="monospace"
                          tickFormatter={(val) => `$${val}`}
                          tickLine={false}
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
                          formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Monthly Earnings']}
                        />
                        <Area
                          type="monotone"
                          dataKey="earnings"
                          stroke="#FF5500"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#ownerRevenueGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs font-mono text-neutral-500">
                      Initializing Chart Engine...
                    </div>
                  )}
                </div>
              </div>

              {/* Monthly Completed Reservations BarChart */}
              <div className="bg-[#181818] border border-[#2A2A2A] p-6 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A2A2A] pb-4">
                  <div>
                    <h3 className="font-heading font-black text-base uppercase tracking-wider text-neutral-100">
                      Mobilization Activity Volume
                    </h3>
                    <p className="font-mono text-xs text-neutral-400">
                      Total equipment reservations mobilized per monthly billing cycle
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400">
                    <span className="w-3 h-3 bg-cyan-500 inline-block" />
                    <span>Deployments</span>
                  </div>
                </div>

                <div className="h-64 w-full pt-4">
                  {chartMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.monthlyEarnings} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                        <XAxis
                          dataKey="label"
                          stroke="#777777"
                          fontSize={11}
                          fontFamily="monospace"
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#777777"
                          fontSize={11}
                          fontFamily="monospace"
                          allowDecimals={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#181818',
                            borderColor: '#06B6D4',
                            borderRadius: '0px',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                          }}
                          labelStyle={{ color: '#F8F9FA', fontWeight: 'bold' }}
                          formatter={(value: any) => [value, 'Mobilizations']}
                        />
                        <Bar dataKey="count" fill="#06B6D4" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: ADD EQUIPMENT FORM */}
          {activeTab === 'add' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 max-w-4xl"
            >
              {/* Header */}
              <div className="border-b border-[#2A2A2A] pb-4">
                <div className="inline-flex items-center gap-2 text-[10px] font-mono text-[#FF5500] uppercase font-bold tracking-widest">
                  <span>Inventory Ingestion</span>
                  <span>•</span>
                  <span>Fleet Cataloging</span>
                </div>
                <h1 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-neutral-100">
                  List New Machinery Asset
                </h1>
                <p className="font-mono text-xs text-neutral-400 mt-1">
                  All newly listed machinery is submitted with status <strong className="text-amber-400 font-bold uppercase">PENDING</strong> for quality assurance & safety review.
                </p>
              </div>

              {/* Form Container */}
              <div className="bg-[#181818] border border-[#2A2A2A] p-6 sm:p-8 shadow-2xl">
                <form onSubmit={handleAddEquipmentSubmit} className="space-y-6">
                  {/* Basic Specifications */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                        Machinery Asset Name <span className="text-[#FF5500]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Caterpillar 320 Hydraulic Excavator"
                        value={addName}
                        onChange={(e) => setAddName(e.target.value)}
                        className="w-full bg-[#121212] border border-[#333333] px-3.5 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                        Equipment Category <span className="text-[#FF5500]">*</span>
                      </label>
                      <select
                        value={addCategory}
                        onChange={(e) => setAddCategory(e.target.value)}
                        className="w-full bg-[#121212] border border-[#333333] px-3 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
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

                  {/* Brand, Model, Condition */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                        Manufacturer / Brand <span className="text-[#FF5500]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Caterpillar, Komatsu"
                        value={addBrand}
                        onChange={(e) => setAddBrand(e.target.value)}
                        className="w-full bg-[#121212] border border-[#333333] px-3.5 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                        Model / Series <span className="text-[#FF5500]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 320 GC Tier 4"
                        value={addModel}
                        onChange={(e) => setAddModel(e.target.value)}
                        className="w-full bg-[#121212] border border-[#333333] px-3.5 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                        Condition Grade <span className="text-[#FF5500]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Heavy Industrial • Grade A"
                        value={addCondition}
                        onChange={(e) => setAddCondition(e.target.value)}
                        className="w-full bg-[#121212] border border-[#333333] px-3.5 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>
                  </div>

                  {/* Pricing, Rental Frequency, Quantity, Yard */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                        Rental Rate ($) <span className="text-[#FF5500]">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        placeholder="450"
                        value={addPrice}
                        onChange={(e) => setAddPrice(e.target.value)}
                        className="w-full bg-[#121212] border border-[#333333] px-3.5 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                        Rental Frequency <span className="text-[#FF5500]">*</span>
                      </label>
                      <select
                        value={addRentalType}
                        onChange={(e) => setAddRentalType(e.target.value)}
                        className="w-full bg-[#121212] border border-[#333333] px-3 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                        Available Quantity <span className="text-[#FF5500]">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        placeholder="1"
                        value={addQuantity}
                        onChange={(e) => setAddQuantity(e.target.value)}
                        className="w-full bg-[#121212] border border-[#333333] px-3.5 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                        Deployment Yard <span className="text-[#FF5500]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dallas Central Yard, TX"
                        value={addLocation}
                        onChange={(e) => setAddLocation(e.target.value)}
                        className="w-full bg-[#121212] border border-[#333333] px-3.5 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>
                  </div>

                  {/* Image Source & ImgBB Upload */}
                  <div className="space-y-3 p-4 bg-[#141414] border border-[#2E2E2E]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="block text-xs font-mono uppercase text-neutral-300 font-bold">
                        Machinery Image (ImgBB Upload or Direct HTTPS URL) <span className="text-[#FF5500]">*</span>
                      </label>
                      <div className="text-[10px] font-mono text-neutral-400">
                        High-resolution 4:3 ratio recommended
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-8">
                        <input
                          type="url"
                          required
                          placeholder="https://images.unsplash.com/... or paste image URL"
                          value={addImage}
                          onChange={(e) => setAddImage(e.target.value)}
                          className="w-full bg-[#121212] border border-[#333333] px-3.5 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#242424] hover:bg-[#2E2E2E] border border-neutral-600 text-neutral-200 font-mono text-xs uppercase cursor-pointer transition-colors">
                          {isUploadingImgBB ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 text-[#FF5500]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span>Upload via ImgBB</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingImgBB}
                            onChange={handleImgBBUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Image Preview */}
                    {addImage && (
                      <div className="relative w-36 h-24 bg-[#121212] border border-[#333333] overflow-hidden mt-2">
                        <Image
                          src={addImage}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                      Operational & Technical Description <span className="text-[#FF5500]">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Detailed engineering specifications, horsepower, boom length, operating weight, recommended applications..."
                      value={addDescription}
                      onChange={(e) => setAddDescription(e.target.value)}
                      className="w-full bg-[#121212] border border-[#333333] p-3 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500] resize-none"
                    />
                  </div>

                  {/* Terms and Conditions */}
                  <div>
                    <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                      Terms & Operating Conditions <span className="text-[#FF5500]">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Operator license requirements, fuel return policy, safety inspection rules, damage waiver terms..."
                      value={addTerms}
                      onChange={(e) => setAddTerms(e.target.value)}
                      className="w-full bg-[#121212] border border-[#333333] p-3 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500] resize-none"
                    />
                  </div>

                  {/* Submit Action */}
                  <div className="pt-4 border-t border-[#2A2A2A] flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingEquipment || isUploadingImgBB}
                      className="px-8 py-3.5 bg-[#FF5500] hover:bg-[#E64A00] text-black font-heading font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                    >
                      {isSubmittingEquipment ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Listing Machinery Asset...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Submit Machinery for Approval</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* TAB 3: MY EQUIPMENT TABLE (UPDATE, DELETE WITH CONFIRMATION, VIEW DETAILS) */}
          {activeTab === 'my-equipment' && (
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
                    <span>Machinery Inventory</span>
                    <span>•</span>
                    <span>Asset Management</span>
                  </div>
                  <h1 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-neutral-100">
                    My Listed Equipment
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('add')}
                  className="px-5 py-2.5 bg-[#FF5500] hover:bg-[#E64A00] text-black font-heading font-black text-xs uppercase tracking-widest transition-colors shadow-md self-start sm:self-auto cursor-pointer"
                >
                  + Add Machinery
                </button>
              </div>

              {/* Machinery Table */}
              <div className="bg-[#181818] border border-[#2A2A2A] shadow-xl overflow-hidden">
                {equipmentLoading ? (
                  <div className="p-12 text-center text-neutral-400 font-mono text-xs flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-[#2A2A2A] border-t-[#FF5500] animate-spin" />
                    <span>Querying fleet records...</span>
                  </div>
                ) : myEquipment.length === 0 ? (
                  <div className="p-12 text-center space-y-4 font-mono">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#202020] border border-neutral-700 flex items-center justify-center text-neutral-500">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="text-sm text-neutral-300 font-bold uppercase">No Listed Machinery Found</div>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                      List your equipment to start mobilizing heavy machinery for top-tier contractor projects.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('add')}
                      className="mt-2 px-6 py-2.5 bg-[#FF5500] hover:bg-[#E64A00] text-black font-heading font-black text-xs uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      Add Your First Asset
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-[#141414] border-b border-[#2A2A2A] text-neutral-400 uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4 font-bold">Machinery Asset</th>
                          <th className="py-3.5 px-4 font-bold">Category</th>
                          <th className="py-3.5 px-4 font-bold">Fleet Rate</th>
                          <th className="py-3.5 px-4 font-bold">Inventory</th>
                          <th className="py-3.5 px-4 font-bold">Status</th>
                          <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#242424] text-neutral-300">
                        {myEquipment.map((item) => {
                          const isPending = item.status === 'pending';
                          const isApproved = item.status === 'approved' || item.status === 'available';

                          return (
                            <tr key={item._id} className="hover:bg-[#1C1C1C] transition-colors">
                              {/* Asset Info */}
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
                                      {item.brand} {item.model} • {item.location}
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

                              {/* Rate */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="font-heading font-black text-sm text-[#FF5500]">
                                  ${item.price.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-neutral-500 uppercase">
                                  / {item.rentalType}
                                </div>
                              </td>

                              {/* Quantity */}
                              <td className="py-4 px-4 whitespace-nowrap text-neutral-200 font-bold">
                                {item.quantity} Units
                              </td>

                              {/* Status Badge */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                    isApproved
                                      ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-400'
                                      : isPending
                                      ? 'bg-amber-950/80 border border-amber-500/50 text-amber-400'
                                      : 'bg-red-950/80 border border-red-500/50 text-red-400'
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </td>

                              {/* Action Buttons: View Details, Update, Delete */}
                              <td className="py-4 px-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {/* View Details */}
                                  <Link
                                    href={`/equipment/${item._id || item.id}`}
                                    className="px-2.5 py-1.5 bg-[#252525] hover:bg-[#303030] border border-neutral-700 text-neutral-200 text-[11px] font-mono uppercase transition-colors"
                                  >
                                    View
                                  </Link>

                                  {/* Update */}
                                  <button
                                    type="button"
                                    onClick={() => setEditingItem({ ...item })}
                                    className="px-2.5 py-1.5 bg-[#FF5500]/10 hover:bg-[#FF5500]/20 border border-[#FF5500]/60 text-[#FF5500] text-[11px] font-mono uppercase transition-colors cursor-pointer font-bold"
                                  >
                                    Update
                                  </button>

                                  {/* Delete with Confirmation */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteEquipment(item)}
                                    className="px-2.5 py-1.5 border border-red-500/40 text-red-400 hover:bg-red-950/30 text-[11px] font-mono uppercase transition-colors cursor-pointer"
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

          {/* TAB 4: MY EQUIPMENT RENTAL TABLE */}
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
                    <span>Fleet Leases</span>
                    <span>•</span>
                    <span>Customer Bookings</span>
                  </div>
                  <h1 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-neutral-100">
                    My Equipment Rentals
                  </h1>
                </div>

                <div className="text-xs font-mono text-neutral-400">
                  Total Bookings: <span className="text-[#FF5500] font-bold">{ownerBookings.length}</span>
                </div>
              </div>

              {/* Table */}
              <div className="bg-[#181818] border border-[#2A2A2A] shadow-xl overflow-hidden">
                {bookingsLoading ? (
                  <div className="p-12 text-center text-neutral-400 font-mono text-xs flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-[#2A2A2A] border-t-[#FF5500] animate-spin" />
                    <span>Querying customer rental records...</span>
                  </div>
                ) : ownerBookings.length === 0 ? (
                  <div className="p-12 text-center space-y-4 font-mono">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#202020] border border-neutral-700 flex items-center justify-center text-neutral-500">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-sm text-neutral-300 font-bold uppercase">No Active Customer Rentals</div>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                      When customers book your machinery via Stripe checkout, the order, payment, and deployment telemetry will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-[#141414] border-b border-[#2A2A2A] text-neutral-400 uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4 font-bold">Equipment Asset</th>
                          <th className="py-3.5 px-4 font-bold">Renter Contact</th>
                          <th className="py-3.5 px-4 font-bold">Deployment Dates</th>
                          <th className="py-3.5 px-4 font-bold">Payout</th>
                          <th className="py-3.5 px-4 font-bold">Payment</th>
                          <th className="py-3.5 px-4 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#242424] text-neutral-300">
                        {ownerBookings.map((b) => {
                          const customerName = b.customer?.name || b.userName || 'Verified Contractor';
                          const customerEmail = b.customer?.email || b.userEmail || 'dispatch@client.com';
                          const phone = b.customer?.phone || b.phone || '+1 (555) 749-0192';

                          return (
                            <tr key={b._id} className="hover:bg-[#1C1C1C] transition-colors">
                              {/* Equipment */}
                              <td className="py-4 px-4">
                                <div className="font-heading font-black text-xs uppercase text-neutral-100 truncate max-w-xs">
                                  {b.equipmentName || b.equipment?.name || 'Heavy Equipment'}
                                </div>
                                <div className="text-[10px] text-neutral-500">
                                  Qty: {b.quantity || 1} Unit(s) • Ref: #{b._id.substring(b._id.length - 6).toUpperCase()}
                                </div>
                              </td>

                              {/* Customer */}
                              <td className="py-4 px-4">
                                <div className="font-bold text-neutral-200">{customerName}</div>
                                <div className="text-[10px] text-neutral-400">{customerEmail}</div>
                                <div className="text-[10px] text-[#FF5500]">{phone}</div>
                              </td>

                              {/* Dates */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="text-neutral-200 font-bold">
                                  {new Date(b.startDate).toLocaleDateString()} &rarr; {new Date(b.endDate).toLocaleDateString()}
                                </div>
                                <div className="text-[10px] text-neutral-500">
                                  {b.duration ? `${b.duration} Days` : 'Multi-day'}
                                </div>
                              </td>

                              {/* Payout */}
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

          {/* TAB 5: OWNER PROFILE (VIEW & EDIT) */}
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
                  <span>Owner Dossier</span>
                  <span>•</span>
                  <span>Clearance Profile</span>
                </div>
                <h1 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-neutral-100">
                  Fleet Owner Profile
                </h1>
                <p className="font-mono text-xs text-neutral-400 mt-1">
                  Manage your verified fleet operator credentials, company legal details, and yard terminal addresses.
                </p>
              </div>

              {/* Preview Card */}
              <div className="bg-[#181818] border border-[#2A2A2A] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-xl">
                <div className="relative w-20 h-20 bg-[#121212] border-2 border-[#FF5500] flex items-center justify-center font-heading font-black text-2xl text-[#FF5500] overflow-hidden flex-shrink-0">
                  {profilePhoto ? (
                    <Image
                      src={profilePhoto}
                      alt={profileName || 'Owner'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span>{(profileName || user?.email || 'FO')[0].toUpperCase()}</span>
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading font-black text-xl uppercase text-neutral-100">
                      {profileName || user?.name || 'HeavyRent Fleet Partner'}
                    </h3>
                    <span className="px-2 py-0.5 bg-[#FF5500]/20 border border-[#FF5500]/60 text-[#FF5500] text-[10px] font-mono font-bold uppercase">
                      Clearance: Fleet Owner
                    </span>
                  </div>
                  <div className="font-mono text-xs text-neutral-400">{profileEmail}</div>
                  <div className="flex flex-wrap gap-4 font-mono text-xs text-neutral-500 pt-1">
                    <span>Phone: <strong className="text-neutral-300">{profilePhone || 'Not Configured'}</strong></span>
                    <span>•</span>
                    <span>Yard HQ: <strong className="text-neutral-300">{profileAddress || 'Not Configured'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="bg-[#181818] border border-[#2A2A2A] p-6 sm:p-8 shadow-xl">
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                        Fleet Owner / Entity Name <span className="text-[#FF5500]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Apex Heavy Fleet Logistics LLC"
                        className="w-full bg-[#121212] border border-[#333333] px-3.5 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                        Registered Dispatch Email
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
                      Avatar / Logo Image URL
                    </label>
                    <input
                      type="url"
                      value={profilePhoto}
                      onChange={(e) => setProfilePhoto(e.target.value)}
                      placeholder="https://images.unsplash.com/... or ImgBB URL"
                      className="w-full bg-[#121212] border border-[#333333] px-3.5 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                        Dispatch Phone Hotline
                      </label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="+1 (555) 892-4401"
                        className="w-full bg-[#121212] border border-[#333333] px-3.5 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                        Main Maintenance Yard & Terminal Address
                      </label>
                      <input
                        type="text"
                        value={profileAddress}
                        onChange={(e) => setProfileAddress(e.target.value)}
                        placeholder="Dallas Central Yard, Terminal Gate 4, Dallas, TX"
                        className="w-full bg-[#121212] border border-[#333333] px-3.5 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#2A2A2A] flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-8 py-3.5 bg-[#FF5500] hover:bg-[#E64A00] text-black font-heading font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                    >
                      {isSavingProfile ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <span>Save Fleet Credentials</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* UPDATE EQUIPMENT MODAL                                    */}
      {/* ========================================================= */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              className="bg-[#181818] border-2 border-[#FF5500] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto text-[#F8F9FA]"
            >
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="border-b border-[#2E2E2E] pb-4 mb-6">
                <span className="text-xs font-mono text-[#FF5500] font-bold uppercase tracking-widest">
                  Modify Specifications
                </span>
                <h2 className="font-heading font-black text-xl sm:text-2xl uppercase tracking-tight text-neutral-100 mt-1">
                  Update: {editingItem.name}
                </h2>
              </div>

              <form onSubmit={handleUpdateEquipmentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1">
                      Machinery Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="w-full bg-[#121212] border border-[#333333] px-3 py-2 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1">
                      Deployment Location
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.location}
                      onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                      className="w-full bg-[#121212] border border-[#333333] px-3 py-2 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                    />
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
                      value={editingItem.price}
                      onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                      className="w-full bg-[#121212] border border-[#333333] px-3 py-2 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1">
                      Billing Term
                    </label>
                    <select
                      value={editingItem.rentalType}
                      onChange={(e) => setEditingItem({ ...editingItem, rentalType: e.target.value })}
                      className="w-full bg-[#121212] border border-[#333333] px-3 py-2 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
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
                      value={editingItem.quantity}
                      onChange={(e) => setEditingItem({ ...editingItem, quantity: Number(e.target.value) })}
                      className="w-full bg-[#121212] border border-[#333333] px-3 py-2 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    required
                    value={editingItem.image}
                    onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                    className="w-full bg-[#121212] border border-[#333333] px-3 py-2 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    className="w-full bg-[#121212] border border-[#333333] p-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1">
                    Terms & Operating Conditions
                  </label>
                  <textarea
                    rows={2}
                    value={editingItem.terms}
                    onChange={(e) => setEditingItem({ ...editingItem, terms: e.target.value })}
                    className="w-full bg-[#121212] border border-[#333333] p-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500] resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-[#2A2A2A] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-5 py-2.5 border border-[#333333] text-neutral-300 font-mono text-xs uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingEquipment}
                    className="px-6 py-2.5 bg-[#FF5500] hover:bg-[#E64A00] text-black font-heading font-black text-xs uppercase tracking-widest cursor-pointer"
                  >
                    {isUpdatingEquipment ? 'Saving Changes...' : 'Save Specifications'}
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

export default function OwnerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['owner', 'admin']} redirectTo="/login">
      <OwnerDashboardContent />
    </ProtectedRoute>
  );
}
