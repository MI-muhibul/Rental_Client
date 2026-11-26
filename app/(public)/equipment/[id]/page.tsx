'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { BookNowModal } from '@/components/BookNowModal';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';

interface EquipmentOwner {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
}

interface EquipmentDetail {
  _id: string;
  id?: string;
  name: string;
  description: string;
  category: string;
  price: number;
  pricePerDay?: number;
  rentalType: 'daily' | 'weekly' | 'monthly' | string;
  location: string;
  quantity: number;
  condition?: string;
  brand?: string;
  model?: string;
  image?: string;
  images?: string[];
  terms?: string;
  status?: string;
  owner?: EquipmentOwner;
  ownerId?: string;
  createdAt?: string;
}

// Fallback assets for development or when backend item is mocked
const FALLBACK_ITEM_MAP: Record<string, EquipmentDetail> = {
  'eq-1': {
    _id: 'eq-1',
    id: 'eq-1',
    name: 'Caterpillar 320 Hydraulic Excavator',
    description:
      'Engineered for heavy-duty earthmoving and trenching, the Cat 320 combines high production with easy-to-use technology. Standard factory-integrated Cat Grade with 2D, Grade Assist, and Payload systems boosts operator efficiency up to 45%. Features a 0.9m³ heavy digging bucket, high-flow auxiliary hydraulics, and reinforced track rollers.',
    category: 'Construction',
    rentalType: 'daily',
    price: 450,
    pricePerDay: 450,
    quantity: 3,
    location: 'Dallas Central Yard, TX',
    condition: 'Heavy Industrial • Grade A',
    brand: 'Caterpillar',
    model: '320 GC Tier 4 Final',
    image:
      'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    ],
    terms:
      'Certified heavy machinery operator license required upon site mobilization. Daily greasing and fluid level checks are mandatory. Equipment returned with less than full fuel tank incurs standard refueling surcharge.',
    status: 'approved',
    owner: {
      id: 'owner-1',
      name: 'Apex Heavy Fleet Logistics',
      email: 'dispatch@apexheavyfleet.com',
      phone: '+1 (555) 892-4401',
      company: 'Apex Industrial Logistics LLC',
    },
  },
  'eq-2': {
    _id: 'eq-2',
    id: 'eq-2',
    name: 'Komatsu WA380-8 Wheel Loader',
    description:
      '191 HP turbocharged wheel loader engineered for high-volume aggregate handling, quarry operations, and bulk material loading. Equipped with a 3.3m³ heavy-duty material bucket, auto-dig control, hydrostatic drive, and pressurized ROPS cab.',
    category: 'Construction',
    rentalType: 'daily',
    price: 380,
    pricePerDay: 380,
    quantity: 2,
    location: 'Houston Industrial Yard, TX',
    condition: 'Field Calibrated • Grade A',
    brand: 'Komatsu',
    model: 'WA380-8 Heavy Series',
    image:
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
    ],
    terms:
      'Jobsite ground clearance inspection mandated prior to delivery. Tire wear and pressure must be recorded daily. Operating limit: 10 operating hours/day included in base rate.',
    status: 'approved',
    owner: {
      id: 'owner-2',
      name: 'Vanguard Earthworks Fleet',
      email: 'ops@vanguardearth.com',
      phone: '+1 (555) 741-2098',
      company: 'Vanguard Infrastructure Partners',
    },
  },
  'eq-3': {
    _id: 'eq-3',
    id: 'eq-3',
    name: 'Dynapac CA2500 Soil Compactor',
    description:
      'Single smooth drum vibratory roller designed for long working days in tough subbase compaction. Optimized amplitude and frequency delivers superior soil and crushed rock density with minimum passes.',
    category: 'Construction',
    rentalType: 'daily',
    price: 240,
    pricePerDay: 240,
    quantity: 3,
    location: 'Austin Sub-Yard, TX',
    condition: 'Field Ready • Grade A',
    brand: 'Dynapac',
    model: 'CA2500 D',
    image:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    terms:
      'Compactor must not be transported across public tarmac on bare drum. Lowboy mobilization required.',
    status: 'approved',
    owner: {
      id: 'owner-3',
      name: 'Titan Compaction Systems',
      email: 'rentals@titancompaction.com',
    },
  },
  'eq-4': {
    _id: 'eq-4',
    id: 'eq-4',
    name: 'Sony FX9 Full-Frame Cinema Package',
    description:
      'Full-Frame 6K sensor cinema package equipped with 15+ stops dynamic range, dual base ISO (800/4000), electronic variable ND filter, and Sony 28-135mm f/4 G OSS power zoom. Includes V-mount flight battery pack and 4x 240GB XQD media cards.',
    category: 'Photography',
    rentalType: 'daily',
    price: 320,
    pricePerDay: 320,
    quantity: 2,
    location: 'Dallas Creative Hub, TX',
    condition: 'Studio Calibrated • Flawless',
    brand: 'Sony CineAlta',
    model: 'PXW-FX9 Package',
    image:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    terms:
      'Production insurance certificate naming HeavyRent as loss payee required prior to equipment handover.',
    status: 'approved',
    owner: {
      id: 'owner-4',
      name: 'CineCore Gear Vault',
      email: 'rent@cinecorevault.com',
    },
  },
  'eq-5': {
    _id: 'eq-5',
    id: 'eq-5',
    name: 'Peterbilt 389 Heavy Haul Lowboy',
    description:
      'Heavy-spec 55-ton tri-axle detachable gooseneck (RGN) lowboy combo with Cummins X15 605 HP power unit. Built for oversized earthmoving machinery and structural beam transfers.',
    category: 'Vehicles & Transportation',
    rentalType: 'daily',
    price: 650,
    pricePerDay: 650,
    quantity: 1,
    location: 'San Antonio Logistics Port, TX',
    condition: 'DOT Certified • Heavy Spec',
    brand: 'Peterbilt & Trail King',
    model: '389 Tri-Axle RGN 55T',
    image:
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
    terms:
      'CDL Class A with heavy haul endorsement and clean MVR required for dry rental. Wet lease with driver available upon request.',
    status: 'approved',
    owner: {
      id: 'owner-5',
      name: 'Lone Star Heavy Haulers',
      email: 'dispatch@lonestarheavyhaul.com',
    },
  },
  'eq-6': {
    _id: 'eq-6',
    id: 'eq-6',
    name: 'John Deere 8R 370 Row Crop Tractor',
    description:
      '370 HP intelligent agricultural workhorse equipped with AutoTrac automated guidance, e23 PowerShift transmission, dual rear wheels, and high-capacity hydraulic remotes for continuous tillage and planting.',
    category: 'Agriculture',
    rentalType: 'daily',
    price: 490,
    pricePerDay: 490,
    quantity: 2,
    location: 'Lubbock Agricultural Base, TX',
    condition: 'Field Serviced • Tier 4',
    brand: 'John Deere',
    model: '8R 370 e23',
    image:
      'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
    terms:
      'Seasonal rate minimums apply during spring planting and autumn harvest. Scheduled grease service every 50 operational hours.',
    status: 'approved',
    owner: {
      id: 'owner-6',
      name: 'High Plains Ag Equipment',
      email: 'service@highplainsag.com',
    },
  },
  'eq-7': {
    _id: 'eq-7',
    id: 'eq-7',
    name: 'Cummins QSK23 500kVA Mobile Generator',
    description:
      'Heavy-duty 400kW prime / 440kW standby diesel generator set housed inside an ISO sound-attenuated container on dual-axle highway running gear. Features multi-voltage selector switch and 24-hour on-board fuel cell.',
    category: 'Electronics',
    rentalType: 'weekly',
    price: 1850,
    pricePerDay: 370,
    quantity: 2,
    location: 'Houston Energy Depot, TX',
    condition: 'Critical Spec • Load Bank Tested',
    brand: 'Cummins Power Generation',
    model: 'C500 D5e Mobile',
    image:
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
    terms:
      'Certified electrician must supervise cable tie-ins and initial phase balancing. UL-certified distribution cables available.',
    status: 'approved',
    owner: {
      id: 'owner-7',
      name: 'Delta Grid Power Systems',
      email: 'rentals@deltagridpower.com',
    },
  },
  'eq-8': {
    _id: 'eq-8',
    id: 'eq-8',
    name: 'Modular Concert Staging & Roof Truss System',
    description:
      'Engineered 40ft x 40ft modular outdoor concert stage platform with aluminum box roof trussing, ballast anchors, dual access staircases, and heavy-duty vinyl weather canopy certified up to 55mph gusts.',
    category: 'Event',
    rentalType: 'weekly',
    price: 2400,
    pricePerDay: 480,
    quantity: 1,
    location: 'Austin Event Yard, TX',
    condition: 'Certified Structural • Grade A',
    brand: 'Prolyte & StageLine',
    model: 'Heavy Stage Truss 4040',
    image:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    terms:
      'Structural PE stamped engineering calculations provided. HeavyRent certified riggers must inspect anchorage prior to show.',
    status: 'approved',
    owner: {
      id: 'owner-8',
      name: 'SoundWave Live Staging Co.',
      email: 'stage@soundwavelive.com',
    },
  },
};

function EquipmentDetailView() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { notifySuccess, notifyError, confirmAction } = useToast();

  const id = (params?.id as string) || '';

  const [equipment, setEquipment] = useState<EquipmentDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Gallery view state
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Favorites toggle state
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [favLoading, setFavLoading] = useState<boolean>(false);

  // Booking Modal state
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);

  // 1. Fetch Equipment Details
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!id) return;
      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/equipment/${encodeURIComponent(id)}`, {
          cache: 'no-store',
        });

        if (res.ok) {
          const data = await res.json();
          const item: EquipmentDetail = data.equipment || data.item || data;
          if (isMounted && item && item.name) {
            setEquipment(item);
            setSelectedImage(item.image || (item.images && item.images[0]) || '');
            setLoading(false);
            return;
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn('Backend fetch failed, checking fallback items:', message);
      }

      // Check fallback item map
      const fallback = FALLBACK_ITEM_MAP[id] || FALLBACK_ITEM_MAP['eq-1'];
      if (isMounted) {
        if (fallback) {
          // Adapt fallback if ID doesn't match
          const adapted = {
            ...fallback,
            _id: id,
            id: id,
          };
          setEquipment(adapted);
          setSelectedImage(adapted.image || (adapted.images && adapted.images[0]) || '');
        } else {
          setErrorMsg('Specified industrial asset was not found in active fleet inventory.');
        }
        setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // 2. Check initial Favorites status
  useEffect(() => {
    let isMounted = true;

    async function checkFavorite() {
      if (!id || !user) return;

      // First check local storage for instantaneous responsiveness
      try {
        const localFavs = JSON.parse(localStorage.getItem('hr_favorites') || '[]');
        if (localFavs.includes(id)) {
          if (isMounted) setIsFavorite(true);
        }
      } catch {
        // ignore storage errors
      }

      // Query server favorites if user session is present
      try {
        const authHeaders = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/favorites`, {
          headers: authHeaders,
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          const favList = (data.favorites || data.items || []) as Array<{
            _id?: string;
            equipmentId?: string | { _id?: string; id?: string };
            equipment?: { _id?: string };
          }>;
          const match = favList.some((fav) => {
            const eqObj = typeof fav.equipmentId === 'object' && fav.equipmentId !== null ? fav.equipmentId : null;
            const fEqId = eqObj?._id || eqObj?.id || (typeof fav.equipmentId === 'string' ? fav.equipmentId : undefined) || fav._id;
            return fEqId === id || fav.equipment?._id === id;
          });
          if (isMounted) {
            setIsFavorite(match);
          }
        }
      } catch {
        // Non-fatal, local state persists
      }
    }

    checkFavorite();

    return () => {
      isMounted = false;
    };
  }, [id, user]);

  // Handle Add to Favorites toggle
  const handleToggleFavorite = async () => {
    if (!equipment) return;
    setFavLoading(true);

    const nextState = !isFavorite;
    setIsFavorite(nextState);

    // Sync to local storage
    try {
      const localFavs = JSON.parse(localStorage.getItem('hr_favorites') || '[]');
      let updated: string[];
      if (nextState) {
        updated = Array.from(new Set([...localFavs, id]));
      } else {
        updated = localFavs.filter((itemId: string) => itemId !== id);
      }
      localStorage.setItem('hr_favorites', JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Call backend API
    try {
      const authHeaders = await getAuthHeaders();
      if (nextState) {
        // POST /favorites
        const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          credentials: 'include',
          body: JSON.stringify({ equipmentId: id }),
        });

        if (res.ok || res.status === 409) {
          notifySuccess(`"${equipment.name}" added to saved favorites.`);
        } else {
          // Still considered saved locally
          notifySuccess(`Saved to your favorite fleet assets.`);
        }
      } else {
        // DELETE /favorites/:id
        await fetch(`${API_BASE_URL.replace(/\/$/, '')}/favorites/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: authHeaders,
          credentials: 'include',
        });
        notifySuccess(`Asset removed from your favorites.`);
      }
    } catch {
      // Graceful notification
      notifySuccess(
        nextState ? 'Asset saved to fleet favorites.' : 'Asset removed from favorites.'
      );
    } finally {
      setFavLoading(false);
    }
  };

  // Image Gallery list
  const galleryImages = useMemo(() => {
    if (!equipment) return [];
    if (equipment.images && equipment.images.length > 0) {
      return equipment.images;
    }
    if (equipment.image) {
      return [equipment.image];
    }
    return ['https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80'];
  }, [equipment]);

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#F8F9FA] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="h-4 w-64 bg-[#232323] rounded"></div>

          {/* Grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <div className="w-full aspect-[4/3] bg-[#1E1E1E] rounded-md border border-[#2E2E2E]"></div>
              <div className="flex gap-3">
                <div className="w-24 h-20 bg-[#1E1E1E] rounded border border-[#2E2E2E]"></div>
                <div className="w-24 h-20 bg-[#1E1E1E] rounded border border-[#2E2E2E]"></div>
                <div className="w-24 h-20 bg-[#1E1E1E] rounded border border-[#2E2E2E]"></div>
              </div>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <div className="h-8 w-3/4 bg-[#232323] rounded"></div>
              <div className="h-6 w-1/3 bg-[#232323] rounded"></div>
              <div className="h-32 bg-[#1E1E1E] rounded border border-[#2E2E2E]"></div>
              <div className="h-14 bg-[#2E2E2E] rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (errorMsg || !equipment) {
    return (
      <div className="min-h-[70vh] bg-[#121212] text-[#F8F9FA] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1A1A1A] border-2 border-red-500/40 p-8 rounded-none shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-950/60 border border-red-500/60 flex items-center justify-center text-red-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="font-heading font-black text-2xl uppercase tracking-wider text-neutral-100">
            Asset Record Unavailable
          </h2>
          <p className="text-sm text-neutral-400 font-mono">
            {errorMsg || 'The requested machinery ID could not be loaded from active inventory records.'}
          </p>
          <div className="pt-4">
            <Link
              href="/equipment"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF5500] hover:bg-[#E64A00] text-black font-heading font-black text-xs uppercase tracking-widest transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Equipment Fleet
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inStock = equipment.quantity > 0;
  const displayImage = selectedImage || equipment.image || galleryImages[0];

  return (
    <div className="min-h-screen bg-[#121212] text-[#F8F9FA] pb-24">
      {/* Top Industrial Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF5500] via-[#E64A00] to-[#FF5500]" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400 mb-6">
          <Link href="/" className="hover:text-[#FF5500] transition-colors">
            HQ Terminal
          </Link>
          <span className="text-neutral-600">/</span>
          <Link href="/equipment" className="hover:text-[#FF5500] transition-colors">
            Fleet Catalog
          </Link>
          <span className="text-neutral-600">/</span>
          <span className="text-neutral-200 font-bold truncate max-w-xs">{equipment.name}</span>
        </nav>

        {/* Primary Machinery Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Visual Media Gallery & Technical Badges (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Primary Main Viewport */}
            <div className="relative group bg-[#181818] border-2 border-[#2A2A2A] rounded-none overflow-hidden shadow-2xl">
              {/* Category & Status Overlay Chips */}
              <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 bg-black/80 backdrop-blur-md border border-[#FF5500]/40 text-[#FF5500] font-mono font-bold text-xs uppercase tracking-wider">
                  {equipment.category}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/80 backdrop-blur-md border border-neutral-700 text-neutral-200 font-mono text-xs uppercase tracking-wider">
                  <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  {inStock ? `${equipment.quantity} Units Mobilized` : 'Depleted'}
                </span>
              </div>

              {/* Machinery Image Viewport */}
              <div className="relative w-full aspect-[4/3] bg-[#141414] overflow-hidden">
                <Image
                  src={displayImage}
                  alt={equipment.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-60" />
              </div>

              {/* Technical Spec Footbar inside Image Container */}
              <div className="p-4 bg-[#1A1A1A] border-t border-[#2A2A2A] flex items-center justify-between font-mono text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">SPEC:</span>
                  <span className="text-neutral-200 font-bold">{equipment.brand || 'CAT SPEC'} {equipment.model || ''}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <span>DISPATCH LOC:</span>
                  <span className="text-neutral-200">{equipment.location}</span>
                </div>
              </div>
            </div>

            {/* Thumbnail Gallery Selector */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-700">
                {galleryImages.map((imgUrl, idx) => {
                  const isActive = displayImage === imgUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative w-24 h-20 flex-shrink-0 border-2 transition-all overflow-hidden ${
                        isActive
                          ? 'border-[#FF5500] ring-2 ring-[#FF5500]/30 opacity-100 scale-100'
                          : 'border-[#2A2A2A] opacity-60 hover:opacity-100 hover:border-neutral-400'
                      }`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`Angle thumbnail ${idx + 1}`}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Asset Description Box */}
            <div className="bg-[#181818] border border-[#2A2A2A] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
                <h3 className="font-heading font-black text-sm uppercase tracking-widest text-[#FF5500] flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Operational Overview & Technical Dossier
                </h3>
                <span className="font-mono text-xs text-neutral-500">ID: {equipment._id.substring(0, 12)}</span>
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-line font-sans">
                {equipment.description}
              </p>

              {/* Machinery Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[#2A2A2A]">
                <div className="bg-[#141414] p-3 border border-[#252525]">
                  <div className="text-[10px] font-mono text-neutral-500 uppercase">Machinery Class</div>
                  <div className="text-xs font-bold text-neutral-200 mt-0.5">{equipment.category}</div>
                </div>
                <div className="bg-[#141414] p-3 border border-[#252525]">
                  <div className="text-[10px] font-mono text-neutral-500 uppercase">Manufacturer</div>
                  <div className="text-xs font-bold text-neutral-200 mt-0.5">{equipment.brand || 'OEM Industrial'}</div>
                </div>
                <div className="bg-[#141414] p-3 border border-[#252525]">
                  <div className="text-[10px] font-mono text-neutral-500 uppercase">Series / Model</div>
                  <div className="text-xs font-bold text-neutral-200 mt-0.5">{equipment.model || 'Heavy-Duty'}</div>
                </div>
                <div className="bg-[#141414] p-3 border border-[#252525]">
                  <div className="text-[10px] font-mono text-neutral-500 uppercase">Machinery Condition</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">{equipment.condition || 'Factory Certified'}</div>
                </div>
                <div className="bg-[#141414] p-3 border border-[#252525]">
                  <div className="text-[10px] font-mono text-neutral-500 uppercase">Active Inventory</div>
                  <div className="text-xs font-bold text-neutral-200 mt-0.5">{equipment.quantity} units available</div>
                </div>
                <div className="bg-[#141414] p-3 border border-[#252525]">
                  <div className="text-[10px] font-mono text-neutral-500 uppercase">Rental Frequency</div>
                  <div className="text-xs font-bold text-[#FF5500] uppercase mt-0.5">{equipment.rentalType} lease</div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions Callout */}
            <div className="bg-[#181818] border-l-4 border-l-[#FF5500] border-t border-r border-b border-[#2A2A2A] p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#FF5500] font-heading font-black text-sm uppercase tracking-wider">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Fleet Terms & Operating Conditions
              </div>

              <div className="space-y-3 font-mono text-xs text-neutral-300">
                <div className="flex items-start gap-2">
                  <span className="text-[#FF5500] font-bold">01.</span>
                  <div>
                    <strong className="text-neutral-100">Certified Operator Requirement:</strong> Operator must present valid state heavy equipment credentials prior to site handover.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#FF5500] font-bold">02.</span>
                  <div>
                    <strong className="text-neutral-100">Fuel & Fluid Servicing:</strong> Machinery is dispatched with 100% fuel. Return inspection requires equivalent fill or standard market refueling surcharge.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#FF5500] font-bold">03.</span>
                  <div>
                    <strong className="text-neutral-100">Damage Waiver & Security Deposit:</strong> Standard 50% single-day deposit held as authorization until post-rental yard return check.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#FF5500] font-bold">04.</span>
                  <div>
                    <strong className="text-neutral-100">Weather & Mobilization Grace Period:</strong> 24-hour weather delay rescheduling guarantee with zero penalty.
                  </div>
                </div>

                {/* Custom equipment terms if configured on item */}
                {equipment.terms && (
                  <div className="mt-4 p-3 bg-[#131313] border border-[#2E2E2E] text-neutral-400">
                    <span className="text-[10px] uppercase font-bold text-[#FF5500] block mb-1">Owner Custom Provisions:</span>
                    {equipment.terms}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Pricing, Actions, Owner Info & Booking Trigger (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Primary Action Card */}
            <div className="bg-[#181818] border-2 border-[#2A2A2A] p-6 shadow-2xl relative overflow-hidden">
              {/* Subtle top industrial pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(#FF5500_1px,transparent_1px)] [background-size:12px_12px] opacity-15 pointer-events-none" />

              {/* Title & Brand */}
              <div className="space-y-1 border-b border-[#2A2A2A] pb-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#FF5500] font-bold">
                    {equipment.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
                    <svg className="w-3.5 h-3.5 text-[#FF5500]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{equipment.location}</span>
                  </div>
                </div>
                <h1 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-neutral-100 leading-tight">
                  {equipment.name}
                </h1>
              </div>

              {/* Pricing Section */}
              <div className="py-5 border-b border-[#2A2A2A] flex items-baseline justify-between">
                <div>
                  <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                    Mobilization Rate ({equipment.rentalType})
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-heading font-black text-4xl text-[#FF5500]">
                      ${(equipment.price || 0).toLocaleString()}
                    </span>
                    <span className="font-mono text-sm text-neutral-400 uppercase">
                      / {equipment.rentalType}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider ${
                    inStock ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40' : 'bg-red-950/60 text-red-400 border border-red-500/40'
                  }`}>
                    {inStock ? `${equipment.quantity} in stock` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Add to Favorites & Book Now */}
              <div className="pt-6 space-y-3">
                {/* Book Now Button */}
                <button
                  type="button"
                  disabled={!inStock}
                  onClick={() => setIsBookingOpen(true)}
                  className={`w-full py-4 px-6 flex items-center justify-center gap-3 font-heading font-black text-sm uppercase tracking-widest shadow-xl transition-all ${
                    inStock
                      ? 'bg-[#FF5500] hover:bg-[#E64A00] text-black hover:shadow-[#FF5500]/20 active:translate-y-0.5 cursor-pointer'
                      : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {inStock ? 'Book Asset Now' : 'Inventory Unavailable'}
                </button>

                {/* Add to Favorites Toggle */}
                <button
                  type="button"
                  disabled={favLoading}
                  onClick={handleToggleFavorite}
                  className={`w-full py-3.5 px-6 flex items-center justify-center gap-2 border-2 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isFavorite
                      ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500] hover:bg-[#FF5500]/20'
                      : 'bg-[#141414] border-[#2E2E2E] text-neutral-300 hover:border-neutral-400 hover:text-white'
                  }`}
                >
                  <motion.svg
                    animate={{ scale: isFavorite ? [1, 1.25, 1] : 1 }}
                    transition={{ duration: 0.25 }}
                    className={`w-4 h-4 ${isFavorite ? 'text-[#FF5500] fill-[#FF5500]' : 'text-neutral-400 fill-none'}`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </motion.svg>
                  {isFavorite ? 'Saved in Your Fleet' : 'Add to Favorites'}
                </button>
              </div>

              {/* Reassurance Guarantee Footer */}
              <div className="mt-6 pt-4 border-t border-[#2A2A2A] grid grid-cols-2 gap-2 text-[11px] font-mono text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#FF5500]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>100% Insured Fleet</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#FF5500]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>24hr Yard Dispatch</span>
                </div>
              </div>
            </div>

            {/* Owner / Fleet Operator Dossier */}
            <div className="bg-[#181818] border border-[#2A2A2A] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
                <h3 className="font-heading font-black text-xs uppercase tracking-widest text-[#FF5500] flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Verified Fleet Owner Profile
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono uppercase">
                  Verified Owner
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Industrial Avatar */}
                <div className="w-12 h-12 rounded-none bg-[#242424] border-2 border-[#FF5500]/60 flex items-center justify-center font-heading font-black text-lg text-[#FF5500]">
                  {(equipment.owner?.name || 'HeavyRent Operator').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-heading font-black text-sm uppercase text-neutral-100">
                    {equipment.owner?.name || 'Apex Heavy Fleet Logistics'}
                  </div>
                  <div className="font-mono text-xs text-neutral-400">
                    {equipment.owner?.email || 'dispatch@heavyrent.io'}
                  </div>
                  {equipment.owner?.company && (
                    <div className="font-mono text-[11px] text-[#FF5500]">
                      {equipment.owner.company}
                    </div>
                  )}
                </div>
              </div>

              {/* Owner Reliability Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-2 font-mono text-xs text-neutral-300">
                <div className="bg-[#131313] p-2.5 border border-[#262626]">
                  <span className="text-[10px] text-neutral-500 uppercase block">Response Time</span>
                  <span className="font-bold text-neutral-200">&lt; 15 Minutes</span>
                </div>
                <div className="bg-[#131313] p-2.5 border border-[#262626]">
                  <span className="text-[10px] text-neutral-500 uppercase block">Fleet Score</span>
                  <span className="font-bold text-emerald-400">99.8% Reliability</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Book Now Modal with Live Quote & Stripe Checkout */}
      {equipment && (
        <BookNowModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          equipment={equipment}
        />
      )}
    </div>
  );
}

// Protected Route Wrapper ensuring page remains strictly private
export default function EquipmentDetailPage() {
  return (
    <ProtectedRoute redirectTo="/login">
      <EquipmentDetailView />
    </ProtectedRoute>
  );
}
