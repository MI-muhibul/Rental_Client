'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SectionContainer from '@/components/ui/SectionContainer';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import Card, { CardBody, CardContent, CardFooter, CardImage } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { API_BASE_URL } from '@/lib/api';

interface EquipmentItem {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  category: string;
  rentalType: string;
  price: number;
  quantity: number;
  location: string;
  image?: string;
  images?: string[];
  condition?: string;
  brand?: string;
  model?: string;
  status?: string;
  [key: string]: any;
}

// Calibrated fallback fleet assets to ensure smooth experience if backend is offline
const FALLBACK_FLEET: EquipmentItem[] = [
  {
    _id: 'eq-1',
    id: 'eq-1',
    name: 'Caterpillar 320 Hydraulic Excavator',
    description: '20-Ton operating weight excavator with 0.9m³ heavy-duty digging bucket and auxiliary hydraulics.',
    category: 'Construction',
    rentalType: 'daily',
    price: 450,
    quantity: 2,
    location: 'Dallas, TX',
    image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    brand: 'Caterpillar',
    model: '320 GC',
    status: 'approved',
  },
  {
    _id: 'eq-2',
    id: 'eq-2',
    name: 'Komatsu WA380-8 Wheel Loader',
    description: '191 HP turbocharged wheel loader with 3.3m³ high-capacity material handling bucket.',
    category: 'Construction',
    rentalType: 'daily',
    price: 380,
    quantity: 1,
    location: 'Houston, TX',
    image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80',
    brand: 'Komatsu',
    model: 'WA380-8',
    status: 'approved',
  },
  {
    _id: 'eq-3',
    id: 'eq-3',
    name: 'Dynapac CA2500 Soil Compactor',
    category: 'Construction',
    rentalType: 'daily',
    price: 240,
    quantity: 3,
    location: 'Austin, TX',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    brand: 'Dynapac',
    model: 'CA2500',
    status: 'approved',
  },
  {
    _id: 'eq-4',
    id: 'eq-4',
    name: 'Sony FX9 Full-Frame Cinema Package',
    description: '6K Full-Frame cinema camera rig with dual native ISO, 28-135mm zoom and V-mount power module.',
    category: 'Photography',
    rentalType: 'daily',
    price: 320,
    quantity: 2,
    location: 'Dallas, TX',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    brand: 'Sony',
    model: 'FX9',
    status: 'approved',
  },
  {
    _id: 'eq-5',
    id: 'eq-5',
    name: 'Peterbilt 389 Heavy Haul Lowboy',
    description: '55-Ton capacity detachable gooseneck tri-axle lowboy trailer for heavy machinery transport.',
    category: 'Vehicles & Transportation',
    rentalType: 'daily',
    price: 650,
    quantity: 1,
    location: 'San Antonio, TX',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80',
    brand: 'Peterbilt',
    model: '389 Lowboy',
    status: 'approved',
  },
  {
    _id: 'eq-6',
    id: 'eq-6',
    name: 'John Deere 8R 370 Row Crop Tractor',
    description: '370 HP intelligent agricultural powerhouse with dual tires, ILS front suspension and AutoTrac.',
    category: 'Agriculture',
    rentalType: 'daily',
    price: 490,
    quantity: 2,
    location: 'Lubbock, TX',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    brand: 'John Deere',
    model: '8R 370',
    status: 'approved',
  },
  {
    _id: 'eq-7',
    id: 'eq-7',
    name: 'Cummins QSK23 500kVA Mobile Generator',
    description: '400kW prime diesel generator mounted on sound-attenuated tandem highway trailer.',
    category: 'Electronics',
    rentalType: 'weekly',
    price: 1850,
    quantity: 2,
    location: 'Houston, TX',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    brand: 'Cummins',
    model: 'QSK23',
    status: 'approved',
  },
  {
    _id: 'eq-8',
    id: 'eq-8',
    name: 'Modular Concert Staging & Roof Truss System',
    description: '40x40 modular aluminum stage with weather canopy, safety rails, and integrated rigging towers.',
    category: 'Event',
    rentalType: 'weekly',
    price: 2400,
    quantity: 1,
    location: 'Austin, TX',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80',
    brand: 'Prolyte',
    model: 'M40 Truss',
    status: 'approved',
  },
  {
    _id: 'eq-9',
    id: 'eq-9',
    name: 'Bobcat T770 Compact Track Loader',
    description: '92 HP vertical lift path compact track loader suited for aggressive grading in tight job sites.',
    category: 'Construction',
    rentalType: 'daily',
    price: 290,
    quantity: 4,
    location: 'Fort Worth, TX',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
    brand: 'Bobcat',
    model: 'T770',
    status: 'approved',
  },
];

const CATEGORIES = [
  'All',
  'Construction',
  'Photography',
  'Vehicles & Transportation',
  'Agriculture',
  'Electronics',
  'Event',
];

const RENTAL_TYPES = [
  { label: 'All Terms', value: 'all' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

// Inner content component wrapped in Suspense
function EquipmentCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [, startTransition] = useTransition();

  // Search filter states
  const initialCategory = searchParams.get('category') || 'All';
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [rentalType, setRentalType] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [availability, setAvailability] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(9); // 3-column rows (9 items per page)

  // Data states
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // 1. Debounce Search Input (350ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setCurrentPage(1);
    }, 350);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Sync initial URL category if searchParams changes
  useEffect(() => {
    const urlCat = searchParams.get('category');
    if (urlCat) {
      setSelectedCategory(urlCat);
      setCurrentPage(1);
    }
  }, [searchParams]);

  // 2. Fetch Equipment from Backend on Every Parameter Change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function fetchFleet() {
      try {
        const query = new URLSearchParams();
        if (debouncedSearch) query.set('search', debouncedSearch);
        if (selectedCategory && selectedCategory !== 'All') query.set('category', selectedCategory);
        if (rentalType && rentalType !== 'all') query.set('rentalType', rentalType);
        if (minPrice) query.set('minPrice', String(minPrice));
        if (maxPrice) query.set('maxPrice', String(maxPrice));
        if (availability && availability !== 'all') query.set('availability', availability);
        if (sortOption) query.set('sort', sortOption);
        query.set('page', String(currentPage));
        query.set('limit', String(limit));

        const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/equipment?${query.toString()}`, {
          cache: 'no-store',
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setItems(data.items || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
          }
        } else {
          throw new Error('Backend returned non-200');
        }
      } catch (err) {
        // Safe fallback simulation if backend is unavailable
        if (isMounted) {
          let filtered = [...FALLBACK_FLEET];

          if (debouncedSearch) {
            const term = debouncedSearch.toLowerCase();
            filtered = filtered.filter(
              (i) => i.name.toLowerCase().includes(term) || i.location.toLowerCase().includes(term)
            );
          }

          if (selectedCategory && selectedCategory !== 'All') {
            filtered = filtered.filter(
              (i) => i.category.toLowerCase() === selectedCategory.toLowerCase()
            );
          }

          if (rentalType && rentalType !== 'all') {
            filtered = filtered.filter((i) => i.rentalType.toLowerCase() === rentalType.toLowerCase());
          }

          if (minPrice) {
            filtered = filtered.filter((i) => i.price >= Number(minPrice));
          }

          if (maxPrice) {
            filtered = filtered.filter((i) => i.price <= Number(maxPrice));
          }

          if (availability === 'available') {
            filtered = filtered.filter((i) => i.quantity > 0);
          }

          if (sortOption === 'price_asc') {
            filtered.sort((a, b) => a.price - b.price);
          } else if (sortOption === 'price_desc') {
            filtered.sort((a, b) => b.price - a.price);
          }

          const startIdx = (currentPage - 1) * limit;
          const paginated = filtered.slice(startIdx, startIdx + limit);

          setItems(paginated);
          setTotal(filtered.length);
          setTotalPages(Math.ceil(filtered.length / limit) || 1);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    startTransition(() => {
      fetchFleet();
    });

    return () => {
      isMounted = false;
    };
  }, [
    debouncedSearch,
    selectedCategory,
    rentalType,
    minPrice,
    maxPrice,
    availability,
    sortOption,
    currentPage,
    limit,
  ]);

  // Reset all filters to default
  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setSelectedCategory('All');
    setRentalType('all');
    setMinPrice('');
    setMaxPrice('');
    setAvailability('all');
    setSortOption('newest');
    setCurrentPage(1);
    router.replace('/equipment');
  };

  // View Details: redirect to /login if unauthenticated, or to /equipment/:id if logged in
  const handleViewDetails = (item: EquipmentItem) => {
    const id = item._id?.toString() || item.id;
    const targetUrl = `/equipment/${id}`;
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(targetUrl)}`);
    } else {
      router.push(targetUrl);
    }
  };

  return (
    <SectionContainer className="py-12">
      {/* Page Header */}
      <div className="mb-10 pb-6 border-b border-base-300 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="hazard-badge mb-2">COMMERCIAL INVENTORY // LIVE TELEMETRY</span>
          <Heading level={1} size="xl">
            Fleet Catalog
          </Heading>
          <p className="text-gray-400 text-sm font-mono mt-1">
            OSHA-audited excavators, loaders, transport rigs, power units, and cinematography kits.
          </p>
        </div>

        <div className="text-xs font-mono text-gray-400">
          SHOWING{' '}
          <span className="text-primary font-bold">
            {total > 0 ? (currentPage - 1) * limit + 1 : 0} -{' '}
            {Math.min(currentPage * limit, total)}
          </span>{' '}
          OF <span className="text-white font-bold">{total}</span> VERIFIED ASSETS
        </div>
      </div>

      {/* Control Panel: Search & Filters Bar */}
      <div className="bg-base-200 border border-base-300 rounded-sm p-6 mb-10 shadow-xl space-y-5">
        {/* Row 1: Search Input & Sort Dropdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Debounced Search by Name or Location */}
          <div className="lg:col-span-8 relative">
            <label className="block text-[11px] font-heading font-bold uppercase tracking-wider text-gray-400 mb-1">
              Search by Machine Name or Yard Location
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="e.g. Caterpillar 320, Dallas Yard, Wheel Loader..."
                className="w-full bg-[#121519] border border-base-300 focus:border-primary text-white text-sm pl-10 pr-10 py-2.5 rounded-xs outline-none transition-colors"
              />
              <span className="absolute left-3.5 top-3 text-gray-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-2.5 text-xs text-gray-500 hover:text-white"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="lg:col-span-4">
            <label className="block text-[11px] font-heading font-bold uppercase tracking-wider text-gray-400 mb-1">
              Sort Sequence
            </label>
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#121519] border border-base-300 focus:border-primary text-white text-sm px-4 py-2.5 rounded-xs outline-none font-mono"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Category Selector Pills */}
        <div>
          <label className="block text-[11px] font-heading font-bold uppercase tracking-wider text-gray-400 mb-2">
            Filter by Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`text-xs font-heading font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xs transition-colors border ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-primary text-white border-primary shadow-sm shadow-orange-500/20'
                    : 'bg-[#121519] text-gray-400 border-base-300 hover:text-white hover:border-gray-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Term, Price Range, Availability & Reset */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 pt-2 border-t border-base-300/70 items-end">
          {/* Rental Term Filter */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-heading font-bold uppercase tracking-wider text-gray-400 mb-1">
              Rental Term
            </label>
            <select
              value={rentalType}
              onChange={(e) => {
                setRentalType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#121519] border border-base-300 focus:border-primary text-white text-xs px-3 py-2 rounded-xs outline-none font-mono"
            >
              {RENTAL_TYPES.map((term) => (
                <option key={term.value} value={term.value}>
                  {term.label}
                </option>
              ))}
            </select>
          </div>

          {/* Min Price */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-heading font-bold uppercase tracking-wider text-gray-400 mb-1">
              Min Price ($)
            </label>
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="0"
              className="w-full bg-[#121519] border border-base-300 focus:border-primary text-white text-xs px-3 py-2 rounded-xs outline-none font-mono"
            />
          </div>

          {/* Max Price */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-heading font-bold uppercase tracking-wider text-gray-400 mb-1">
              Max Price ($)
            </label>
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="5000"
              className="w-full bg-[#121519] border border-base-300 focus:border-primary text-white text-xs px-3 py-2 rounded-xs outline-none font-mono"
            />
          </div>

          {/* Availability Toggle */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-heading font-bold uppercase tracking-wider text-gray-400 mb-1">
              Availability
            </label>
            <select
              value={availability}
              onChange={(e) => {
                setAvailability(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#121519] border border-base-300 focus:border-primary text-white text-xs px-3 py-2 rounded-xs outline-none font-mono"
            >
              <option value="all">All Inventory</option>
              <option value="available">In-Stock Only (Qty &gt; 0)</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          <div className="lg:col-span-2">
            <button
              onClick={handleResetFilters}
              className="w-full btn-industrial-outline text-xs py-2 justify-center text-gray-400 hover:text-white"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          3-COLUMN RESPONSIVE FLEET GRID
         ======================================================== */}
      {loading ? (
        /* Skeleton Loading Grid (9 Shimmering Cards) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="industrial-card h-full animate-pulse bg-base-200 border-base-300"
            >
              <div className="w-full aspect-[16/10] bg-base-300/80" />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="w-24 h-3 bg-base-300 rounded-xs mb-3" />
                  <div className="w-3/4 h-5 bg-base-300 rounded-xs mb-2" />
                  <div className="w-full h-3 bg-base-300/60 rounded-xs mb-1" />
                  <div className="w-2/3 h-3 bg-base-300/60 rounded-xs mb-4" />
                </div>
                <div className="pt-4 border-t border-base-300 flex items-center justify-between">
                  <div className="w-20 h-6 bg-base-300 rounded-xs" />
                  <div className="w-24 h-8 bg-base-300 rounded-xs" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Industrial Empty State */
        <div className="bg-base-200 border-2 border-dashed border-base-300 rounded-sm p-12 lg:p-16 text-center my-8 shadow-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/30 text-primary mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="hazard-badge">NO ASSETS MATCH CURRENT PARAMETERS</span>
          <Heading level={2} size="md" className="mt-3 mb-2">
            No Machinery Located On Grid
          </Heading>
          <p className="text-gray-400 text-sm font-body max-w-md mx-auto mb-6">
            We could not find approved equipment matching your active filters. Try expanding your search
            terms, clearing price boundaries, or resetting filters.
          </p>
          <Button onClick={handleResetFilters} size="md">
            Reset All Search Parameters
          </Button>
        </div>
      ) : (
        /* Active 3-Column Fleet Cards (Equal Height) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {items.map((item, idx) => {
            const eqId = item._id?.toString() || item.id || `eq-${idx}`;
            const primaryImg =
              item.image ||
              (Array.isArray(item.images) && item.images[0]) ||
              'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80';

            return (
              <Card key={eqId} className="h-full">
                {/* 16:10 Aspect Ratio Image */}
                <CardImage>
                  <img src={primaryImg} alt={item.name} />
                  <div className="absolute top-3 left-3">
                    <span className="hazard-badge">{item.category}</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs border ${
                        item.quantity > 0
                          ? 'bg-success/20 text-success border-success/40'
                          : 'bg-error/20 text-error border-error/40'
                      }`}
                    >
                      {item.quantity > 0 ? `${item.quantity} UNITS IN STOCK` : 'CURRENTLY OUT'}
                    </span>
                  </div>
                </CardImage>

                {/* Equal Height Body */}
                <CardBody>
                  <CardContent>
                    <div className="text-xs text-primary font-mono font-bold mb-1">
                      📍 {item.location || 'Central Depot, TX'}
                    </div>

                    <Heading level={3} size="md" className="mb-2 line-clamp-1">
                      {item.name}
                    </Heading>

                    <p className="text-xs text-gray-400 font-body line-clamp-2 mb-4 leading-relaxed">
                      {item.description || 'Verified machinery inspected for heavy job-site duty.'}
                    </p>

                    {item.model && (
                      <div className="text-[11px] font-mono text-gray-500 mb-2">
                        MODEL: {item.brand ? `${item.brand} ` : ''}{item.model}
                      </div>
                    )}
                  </CardContent>

                  {/* Pinned Bottom Footer */}
                  <CardFooter>
                    <div>
                      <span className="text-2xl font-bold font-heading text-primary">
                        ${item.price}
                      </span>
                      <span className="text-xs text-gray-400 uppercase font-mono ml-1">
                        /{item.rentalType || 'day'}
                      </span>
                    </div>

                    <Button size="sm" onClick={() => handleViewDetails(item)}>
                      View Details
                    </Button>
                  </CardFooter>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================
          PAGINATION BAR
         ======================================================== */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-base-300 font-mono text-xs text-gray-400">
          <div>
            PAGE <span className="text-white font-bold">{currentPage}</span> OF{' '}
            <span className="text-white font-bold">{totalPages}</span> ({total} Total Machines)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className="px-3.5 py-1.5 bg-base-200 border border-base-300 rounded-xs text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary transition-colors font-bold uppercase tracking-wider"
            >
              &larr; Previous
            </button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Only show current, first, last, and +/- 1 neighbors
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xs font-bold text-xs transition-colors border ${
                        currentPage === pageNum
                          ? 'bg-primary text-white border-primary'
                          : 'bg-base-200 text-gray-400 border-base-300 hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return (
                    <span key={pageNum} className="px-1 text-gray-600">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className="px-3.5 py-1.5 bg-base-200 border border-base-300 rounded-xs text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary transition-colors font-bold uppercase tracking-wider"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}
    </SectionContainer>
  );
}

export default function EquipmentCatalogPage() {
  return (
    <Suspense
      fallback={
        <SectionContainer className="py-12">
          <div className="w-48 h-8 bg-base-300 animate-pulse rounded-xs mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="industrial-card aspect-[16/10] bg-base-200 animate-pulse" />
            ))}
          </div>
        </SectionContainer>
      }
    >
      <EquipmentCatalogContent />
    </Suspense>
  );
}
