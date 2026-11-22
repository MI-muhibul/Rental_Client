'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionContainer from '@/components/ui/SectionContainer';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import Card, { CardBody, CardContent, CardFooter, CardImage } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { API_BASE_URL } from '@/lib/api';

interface FeaturedItem {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  rentalType?: string;
  price: number;
  quantity?: number;
  location?: string;
  description?: string;
  image?: string;
  images?: string[];
  brand?: string;
  model?: string;
  [key: string]: any;
}

// Fallback high-quality machinery items for Featured section
const FALLBACK_FEATURED: FeaturedItem[] = [
  {
    _id: 'eq-feat-1',
    id: 'eq-feat-1',
    name: 'Caterpillar 320 Hydraulic Excavator',
    category: 'Construction',
    rentalType: 'daily',
    price: 450,
    quantity: 2,
    location: 'Dallas Central Yard, TX',
    description: '20-Ton operating weight excavator with 0.9m³ heavy duty digging bucket. High fuel efficiency.',
    image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    brand: 'Caterpillar',
    model: '320 GC',
  },
  {
    _id: 'eq-feat-2',
    id: 'eq-feat-2',
    name: 'Komatsu WA380-8 Wheel Loader',
    category: 'Construction',
    rentalType: 'daily',
    price: 380,
    quantity: 1,
    location: 'Houston Ship Channel, TX',
    description: '191 HP turbocharged engine with 3.3m³ high-capacity material handling bucket. Fully enclosed ROPS cab.',
    image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80',
    brand: 'Komatsu',
    model: 'WA380-8',
  },
  {
    _id: 'eq-feat-3',
    id: 'eq-feat-3',
    name: 'Dynapac CA2500 Soil Compactor',
    category: 'Construction',
    rentalType: 'daily',
    price: 240,
    quantity: 3,
    location: 'Austin Regional Hub, TX',
    description: '10-Ton single smooth drum roller with dual amplitude frequency for sub-base and asphalt compaction.',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    brand: 'Dynapac',
    model: 'CA2500',
  },
  {
    _id: 'eq-feat-4',
    id: 'eq-feat-4',
    name: 'Sony FX9 Full-Frame Cinema Kit',
    category: 'Photography',
    rentalType: 'daily',
    price: 320,
    quantity: 2,
    location: 'Dallas Film Logistics, TX',
    description: '6K Full-Frame cinema camera rig with dual native ISO, 28-135mm G Master zoom, and V-mount battery module.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    brand: 'Sony',
    model: 'FX9 Cinema',
  },
  {
    _id: 'eq-feat-5',
    id: 'eq-feat-5',
    name: 'Peterbilt 389 Heavy Haul Lowboy',
    category: 'Vehicles & Transportation',
    rentalType: 'daily',
    price: 650,
    quantity: 1,
    location: 'San Antonio Freight Hub, TX',
    description: '55-Ton capacity tri-axle detachable gooseneck lowboy trailer suited for long-haul machinery mobilization.',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80',
    brand: 'Peterbilt',
    model: '389 Lowboy',
  },
  {
    _id: 'eq-feat-6',
    id: 'eq-feat-6',
    name: 'John Deere 8R 370 Row Crop Tractor',
    category: 'Agriculture',
    rentalType: 'daily',
    price: 490,
    quantity: 2,
    location: 'Lubbock Agronomy Center, TX',
    description: '370 HP intelligent agricultural powerhouse with dual tires, ILS front suspension, and AutoTrac guidance.',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    brand: 'John Deere',
    model: '8R 370',
  },
];

// The 6 specific requested categories
const CATEGORIES = [
  {
    name: 'Construction',
    tag: 'HEAVY CIVIL',
    desc: 'Hydraulic excavators, bulldozers, wheel loaders & compactors.',
    count: '142 Units Ready',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    name: 'Photography',
    tag: 'PRODUCTION RIGS',
    desc: 'Cinema camera packages, aerial drones, anamorphic primes & rigs.',
    count: '68 Kits Ready',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    name: 'Vehicles & Transportation',
    tag: 'HAULAGE & FLEET',
    desc: 'Flatbed haulers, lowboys, dump trucks, utility vans & rough terrain trailers.',
    count: '84 Vehicles Ready',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
  },
  {
    name: 'Agriculture',
    tag: 'FARM & CROP',
    desc: 'Row crop tractors, combine harvesters, grain augers & irrigation skids.',
    count: '53 Units Ready',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
  },
  {
    name: 'Electronics',
    tag: 'SURVEY & POWER',
    desc: 'Diesel generators, mobile power stations, total stations & LiDAR scanners.',
    count: '96 Systems Ready',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: 'Event',
    tag: 'STAGING & AUDIO',
    desc: 'Modular staging, heavy truss systems, concert line arrays & power distribution.',
    count: '47 Packages Ready',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
];

// Customer Reviews (4+ authentic contractor evaluations)
const CUSTOMER_REVIEWS = [
  {
    id: 'rev-1',
    author: 'Marcus Vance',
    role: 'Lead Project Superintendent',
    company: 'Apex Infrastructure Group',
    rating: 5,
    date: '3 days ago',
    project: 'Interstate 35 Expansion',
    comment:
      'Mobilized two CAT 320 excavators and a Dynapac roller within 4 hours of contract execution. Telemetry and hour meters were calibrated spot-on. Zero downtime on a 24-hour concrete pouring schedule.',
  },
  {
    id: 'rev-2',
    author: 'Elena Rodriguez',
    role: 'Operations Director',
    company: 'Lone Star Power & Civil',
    rating: 5,
    date: '1 week ago',
    project: 'Solar Substation Installation',
    comment:
      'The automated quote and Stripe escrow checkout eliminated typical rental house bureaucracy. When one generator had an electrical sensor alert, field mechanics arrived with a fresh replacement unit in 90 minutes.',
  },
  {
    id: 'rev-3',
    author: 'David Sterling',
    role: 'Executive Producer',
    company: 'CineGround Media Works',
    rating: 5,
    date: '2 weeks ago',
    project: 'Commercial Shoot - West Texas',
    comment:
      'Finding high-end Sony cinema bodies together with rough-terrain transport trucks on one platform was a revelation. Equipment arrived packed in watertight flight cases with clean sensor certifications.',
  },
  {
    id: 'rev-4',
    author: 'Sarah Jenkins',
    role: 'Managing Partner',
    company: 'Hill Country Agri-Services',
    rating: 5,
    date: '3 weeks ago',
    project: 'Harvest Logistics Mobilization',
    comment:
      'Renting two 370 HP row crop tractors saved our harvest window when our primary fleet was held up at the dealership. Professional handover and clear return protocol. Will definitely deploy again.',
  },
];

// Extra Section 2: Recently Added Fleet Units
const RECENTLY_ADDED = [
  {
    id: 'rec-1',
    name: 'Caterpillar D6T XW Waste Handler Dozer',
    category: 'Construction',
    tag: 'NEWLY CERTIFIED',
    price: 680,
    unit: 'day',
    specs: '215 HP // VPAT 6-Way Blade // Diff Steer',
    location: 'Houston North Yard',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'rec-2',
    name: 'Genie S-85 XC 4WD Telescopic Boom Lift',
    category: 'Vehicles & Transportation',
    tag: 'FRESH INSPECTION',
    price: 360,
    unit: 'day',
    specs: '85 ft Working Height // 1,000 lb Dual Capacity',
    location: 'Dallas West Yard',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'rec-3',
    name: 'Cummins QSK23 500kVA Mobile Diesel Generator',
    category: 'Electronics',
    tag: 'TELEMETRY CALIBRATED',
    price: 420,
    unit: 'day',
    specs: '400kW Prime Power // Sound Attenuated Trailer',
    location: 'Austin Hub',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
  },
];

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>(FALLBACK_FEATURED);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Fetch 6 featured items from backend /equipment/featured
  useEffect(() => {
    let isMounted = true;

    async function loadFeatured() {
      try {
        const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/equipment/featured`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.items && Array.isArray(data.items) && data.items.length > 0) {
            setFeaturedItems(data.items.slice(0, 6));
          }
        }
      } catch (err) {
        // Fallback items safely handle offline backend
        console.warn('[Featured Machinery] Using local calibrated fleet items.');
      } finally {
        if (isMounted) setLoadingFeatured(false);
      }
    }

    loadFeatured();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle "View Details" click: goes to /login if logged out, or /equipment/:id if logged in
  const handleViewDetails = (equipmentId: string) => {
    const targetUrl = `/equipment/${equipmentId}`;
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(targetUrl)}`);
    } else {
      router.push(targetUrl);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-100 text-base-content selection:bg-primary selection:text-white">
      {/* Global Navigation Header */}
      <Navbar />

      {/* ========================================================
          1. ANIMATED HERO BANNER (Framer Motion)
         ======================================================== */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-base-300">
        {/* High-Quality Industrial Machinery Background with Dark Machined Overlay */}
        <motion.div
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1508873696983-2df5293cb325?auto=format&fit=crop&w=2000&q=85")',
          }}
        >
          {/* Heavy industrial tint gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#121519]/95 via-[#121519]/85 to-[#121519]/60" />
          <div className="absolute inset-0 bg-[radial-gradient(#2b323c_1px,transparent_1px)] [background-size:24px_24px] opacity-35" />
        </motion.div>

        <SectionContainer className="relative z-10 py-20 sm:py-28 lg:py-32">
          <div className="max-w-3xl">
            {/* Animated Status Pill */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-[#1a1e24]/90 border border-primary/40 rounded-xs mb-6 shadow-lg shadow-black/40"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span className="font-heading text-xs font-bold uppercase tracking-widest text-primary">
                COMMERCIAL FLEET DISPATCH // ZERO DOWNTIME SLA
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="heading-xl mb-6 text-white text-shadow-sm"
            >
              INDUSTRIAL MACHINERY <span className="text-primary">ON DEMAND</span> FOR HEAVY INFRASTRUCTURE
            </motion.h1>

            {/* Sub-Description */}
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg sm:text-xl text-gray-200 mb-10 font-body leading-relaxed max-w-2xl font-light"
            >
              Contractor-grade earthmoving, heavy transport, cinematography, and agricultural equipment.
              Calibrated multi-point inspections, instant transparent quotes, and rapid site flatbed delivery.
            </motion.p>

            {/* CTA Action Buttons */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link href="/equipment">
                <Button size="lg">Explore Full Fleet</Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="outline" size="lg">
                  How Deployment Works
                </Button>
              </Link>
            </motion.div>

            {/* Micro Industrial Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-12 pt-6 border-t border-base-300/60 grid grid-cols-3 gap-6 font-mono text-xs text-gray-300 max-w-lg"
            >
              <div>
                <span className="block text-xl font-bold font-heading text-white">400+</span>
                <span className="text-gray-400 uppercase text-[10px]">Verified Units</span>
              </div>
              <div>
                <span className="block text-xl font-bold font-heading text-white">&lt; 4h</span>
                <span className="text-gray-400 uppercase text-[10px]">Site Mobilization</span>
              </div>
              <div>
                <span className="block text-xl font-bold font-heading text-white">100%</span>
                <span className="text-gray-400 uppercase text-[10px]">Escrow Backed</span>
              </div>
            </motion.div>
          </div>
        </SectionContainer>
      </section>

      {/* ========================================================
          2. FEATURED EQUIPMENT SECTION (6 Cards, Framer Motion)
         ======================================================== */}
      <section className="py-20 border-b border-base-300 bg-base-100">
        <SectionContainer>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 pb-4 border-b border-base-300">
            <div>
              <span className="hazard-badge mb-2">VERIFIED ASSETS</span>
              <Heading level={2} size="lg">
                Featured Equipment
              </Heading>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-4 font-mono text-xs">
              <span className="text-gray-400">STATUS: 6 HIGH-UTILIZATION FLEET UNITS</span>
              <Link href="/equipment" className="text-primary font-bold hover:underline">
                View All &rarr;
              </Link>
            </div>
          </div>

          {/* 6 Equal-Height Cards Grid with Framer Motion Stagger */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map((item, index) => {
              const eqId = item._id?.toString() || item.id || `eq-${index}`;
              const primaryImg =
                item.image ||
                (Array.isArray(item.images) && item.images[0]) ||
                'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80';

              return (
                <motion.div
                  key={eqId}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card className="h-full">
                    {/* Fixed aspect ratio image container */}
                    <CardImage>
                      <img src={primaryImg} alt={item.name} />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="hazard-badge">{item.category}</span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="bg-[#121519]/90 border border-base-300 text-gray-300 text-[10px] font-mono px-2 py-0.5 rounded-xs">
                          {item.quantity || 1} IN STOCK
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
                          {item.description || 'Fully calibrated machinery ready for on-site mobilization.'}
                        </p>
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

                        {/* View Details button: routes to login if logged out, or equipment details if logged in */}
                        <Button
                          size="sm"
                          onClick={() => handleViewDetails(eqId)}
                          title={!isAuthenticated ? 'Sign In required to view full specifications' : 'View Specifications'}
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </SectionContainer>
      </section>

      {/* ========================================================
          3. CATEGORIES SECTION (6 Specified Categories, Framer Motion)
         ======================================================== */}
      <section className="py-20 border-b border-base-300 bg-base-200">
        <SectionContainer>
          <div className="max-w-2xl mb-12">
            <span className="hazard-badge mb-2">EQUIPMENT CLASSIFICATION</span>
            <Heading level={2} size="lg" className="mb-3">
              Fleet Categories
            </Heading>
            <p className="text-gray-400 text-sm font-body">
              Specialized machinery divided into six standard operational divisions. Fully certified
              under OSHA and regional transport standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat, idx) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="h-full"
              >
                <Link
                  href={`/equipment?category=${encodeURIComponent(cat.name)}`}
                  className="group block h-full"
                >
                  <div className="industrial-card p-6 h-full flex flex-col justify-between group-hover:border-primary group-hover:bg-[#1e232a] transition-all duration-200">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xs bg-[#121519] border border-base-300 flex items-center justify-center text-primary group-hover:border-primary group-hover:shadow-[0_0_12px_rgba(255,102,0,0.3)] transition-all">
                          {cat.icon}
                        </div>
                        <span className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest">
                          {cat.tag}
                        </span>
                      </div>

                      <Heading level={3} size="md" className="mb-2 group-hover:text-primary transition-colors">
                        {cat.name}
                      </Heading>

                      <p className="text-xs text-gray-400 leading-relaxed font-body mb-6">
                        {cat.desc}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-base-300 flex items-center justify-between text-xs font-mono">
                      <span className="text-primary font-bold">{cat.count}</span>
                      <span className="text-gray-400 group-hover:text-white transition-colors group-hover:translate-x-1 duration-150">
                        Inspect Category &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </SectionContainer>
      </section>

      {/* ========================================================
          4. EXTRA SECTION 1: HOW IT WORKS (Procedural Flow)
         ======================================================== */}
      <section className="py-20 border-b border-base-300 bg-base-100">
        <SectionContainer>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="hazard-badge mb-2">DEPLOYMENT PROTOCOL</span>
            <Heading level={2} size="lg" className="mb-3">
              How Equipment Dispatch Works
            </Heading>
            <p className="text-gray-400 text-sm font-body">
              A frictionless four-stage process engineered for commercial job sites and fast contractor turns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Search Fleet Telemetry',
                desc: 'Filter verified machinery by category, location, and daily rate with real-time stock levels.',
              },
              {
                step: '02',
                title: 'Calculate Quote',
                desc: 'Generate immediate price totals factoring in your project dates with zero hidden surcharges.',
              },
              {
                step: '03',
                title: 'Secure Stripe Escrow',
                desc: 'Lock in your rental reservation with encrypted Stripe Checkout sessions.',
              },
              {
                step: '04',
                title: 'On-Site Mobilization',
                desc: 'Flatbed haulers deliver machinery directly to your job site coordinates on schedule.',
              },
            ].map((item, idx) => (
              <div
                key={item.step}
                className="industrial-card p-6 h-full flex flex-col justify-between hover:border-primary/50 transition-colors"
              >
                <div>
                  <div className="font-heading font-black text-3xl text-primary/40 mb-3">
                    STAGE {item.step}
                  </div>
                  <Heading level={3} size="md" className="mb-2">
                    {item.title}
                  </Heading>
                  <p className="text-xs text-gray-400 leading-relaxed font-body">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-base-300 font-mono text-[10px] text-primary">
                  VERIFIED PROTOCOL
                </div>
              </div>
            ))}
          </div>
        </SectionContainer>
      </section>

      {/* ========================================================
          5. WHY CHOOSE US (Industrial Value Pillars)
         ======================================================== */}
      <section className="py-20 border-b border-base-300 bg-[#121519] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#2b323c_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />

        <SectionContainer className="relative z-10">
          <div className="max-w-2xl mb-14">
            <span className="hazard-badge mb-2">OPERATIONAL SUPERIORITY</span>
            <Heading level={2} size="lg" className="mb-3">
              Why Contractors Choose HEAVYRENT
            </Heading>
            <p className="text-gray-400 text-sm font-body">
              Built by industrial logistics engineers to solve downtime, broken machinery, and opaque broker fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Zero Downtime SLA',
                badge: '&lt; 4 HOURS',
                desc: 'If a machine develops an engine or hydraulic fault on-site, a mobile service tech or replacement unit is dispatched within 4 hours.',
              },
              {
                title: 'Comprehensive Escrow',
                badge: 'STRIPE BACKED',
                desc: 'Contractor rental funds are held in secure escrow. Payouts are released only after equipment successfully passes on-site check-in.',
              },
              {
                title: 'OSHA Safety Inspections',
                badge: '100% AUDITED',
                desc: 'Every bulldozer, excavator, and crane passes rigorous pre-delivery load, brake, and emergency cutoff tests before transport.',
              },
              {
                title: 'Automated Hour Logging',
                badge: 'TELEMETRY IOT',
                desc: 'Cellular IoT sensors monitor machine hours and maintenance windows in real time, avoiding billing disputes.',
              },
              {
                title: 'Transparent Fleet Rates',
                badge: 'ZERO SURCHARGES',
                desc: 'What you quote is what you pay. No hidden broker markups, surprise fuel surcharges, or unitemized maintenance line items.',
              },
              {
                title: '24/7 Field Dispatch',
                badge: '1-800 HOTLINE',
                desc: 'Real human dispatcher engineers on call around the clock to organize emergency rigging, permits, and overnight transport.',
              },
            ].map((pillar, idx) => (
              <div
                key={idx}
                className="industrial-card p-6 h-full flex flex-col justify-between border-l-4 border-l-primary"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Heading level={3} size="md">
                      {pillar.title}
                    </Heading>
                    <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-xs">
                      {pillar.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-body leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-base-300/80 font-mono text-[10px] text-gray-500">
                  STANDARD ON ALL CONTRACTS
                </div>
              </div>
            ))}
          </div>
        </SectionContainer>
      </section>

      {/* ========================================================
          6. EXTRA SECTION 2: RECENTLY ADDED (Equal-Height Cards)
         ======================================================== */}
      <section className="py-20 border-b border-base-300 bg-base-100">
        <SectionContainer>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 pb-4 border-b border-base-300">
            <div>
              <span className="hazard-badge mb-2">NEW ARRIVALS</span>
              <Heading level={2} size="lg">
                Recently Added Machinery
              </Heading>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-2 sm:mt-0">
              EXPANDED FLEET ASSETS // UPDATED HOURLY
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {RECENTLY_ADDED.map((item) => (
              <Card key={item.id} className="h-full">
                <CardImage>
                  <img src={item.image} alt={item.name} />
                  <div className="absolute top-3 left-3">
                    <span className="hazard-badge">{item.tag}</span>
                  </div>
                </CardImage>

                <CardBody>
                  <CardContent>
                    <div className="text-xs text-primary font-mono font-bold mb-1">
                      📍 {item.location}
                    </div>
                    <Heading level={3} size="md" className="mb-2">
                      {item.name}
                    </Heading>
                    <p className="text-xs text-gray-400 font-mono mb-4">{item.specs}</p>
                  </CardContent>

                  <CardFooter>
                    <div>
                      <span className="text-2xl font-bold font-heading text-primary">
                        ${item.price}
                      </span>
                      <span className="text-xs text-gray-400 uppercase font-mono ml-1">
                        /{item.unit}
                      </span>
                    </div>

                    <Button size="sm" onClick={() => handleViewDetails(item.id)}>
                      View Details
                    </Button>
                  </CardFooter>
                </CardBody>
              </Card>
            ))}
          </div>
        </SectionContainer>
      </section>

      {/* ========================================================
          7. CUSTOMER REVIEWS (4+ Detailed Cards, Equal Height)
         ======================================================== */}
      <section className="py-20 border-b border-base-300 bg-base-200">
        <SectionContainer>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="hazard-badge mb-2">FIELD TESTIMONIALS</span>
            <Heading level={2} size="lg" className="mb-3">
              Contractor & Operator Reviews
            </Heading>
            <p className="text-gray-400 text-sm font-body">
              Verified evaluations from heavy civil superintendents, film logistics managers, and fleet directors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CUSTOMER_REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className="industrial-card p-6 h-full flex flex-col justify-between hover:border-primary/50 transition-colors"
              >
                <div>
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 text-primary mb-3">
                    {[...Array(rev.rating)].map((_, i) => (
                      <span key={i} className="text-sm">
                        ★
                      </span>
                    ))}
                    <span className="text-xs font-mono text-gray-400 ml-2 font-bold">5.0</span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed font-body mb-6 italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-base-300">
                  <div className="font-heading font-bold text-sm text-white">
                    {rev.author}
                  </div>
                  <div className="text-[11px] text-primary font-mono leading-tight">
                    {rev.role}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                    {rev.company}
                  </div>
                  <div className="mt-2 text-[9px] font-mono text-gray-500 uppercase">
                    Project: {rev.project}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionContainer>
      </section>

      {/* Industrial Footer */}
      <Footer />
    </div>
  );
}
