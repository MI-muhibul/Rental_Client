import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import SectionContainer from '@/components/ui/SectionContainer';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import Card, { CardBody, CardContent, CardFooter, CardImage } from '@/components/ui/Card';

export default function HomePage() {
  const featuredMachinery = [
    {
      id: 'eq-1',
      name: 'Caterpillar 320 Hydraulic Excavator',
      category: 'Earthmoving',
      price: 450,
      unit: 'day',
      spec: '20-Ton Operating Weight // 0.9m³ Bucket',
      location: 'Dallas Yard',
      image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'eq-2',
      name: 'Komatsu WA380 Wheel Loader',
      category: 'Material Handling',
      price: 380,
      unit: 'day',
      spec: '191 HP // 3.3m³ High Capacity Bucket',
      location: 'Houston Yard',
      image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'eq-3',
      name: 'Dynapac CA2500 Single Drum Compactor',
      category: 'Compaction',
      price: 240,
      unit: 'day',
      spec: '10-Ton Smooth Drum // Dual Amplitude',
      location: 'Austin Yard',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-base-100 text-base-content">
      {/* Industrial Navigation Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative border-b border-base-300 bg-[#121519] overflow-hidden">
        {/* Subtle industrial grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#2b323c_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

        <SectionContainer className="relative z-10 py-16 sm:py-24 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-heading text-xs font-bold uppercase tracking-widest text-primary">
                COMMERCIAL FLEET DISPATCH // INSTANT AVAILABILITY
              </span>
            </div>

            <Heading level={1} size="xl" className="mb-6">
              HEAVY MACHINERY <span className="text-primary">ON DEMAND</span> FOR TOUGH JOBS
            </Heading>

            <p className="text-lg sm:text-xl text-gray-300 mb-8 font-body leading-relaxed max-w-2xl">
              Contractor-grade earthmoving, lifting, and compaction equipment. Verified
              service histories, guaranteed zero downtime SLA, and prompt site delivery.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/equipment">
                <Button size="lg">Inspect Equipment Fleet</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg">
                  Operations Console
                </Button>
              </Link>
            </div>
          </div>
        </SectionContainer>
      </section>

      {/* Featured Machinery Grid (Equal-Height Cards) */}
      <SectionContainer id="fleet">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-base-300">
          <div>
            <span className="hazard-badge mb-2">VERIFIED FLEET</span>
            <Heading level={2} size="lg">
              Featured Machinery
            </Heading>
          </div>
          <p className="text-sm text-gray-400 mt-2 sm:mt-0 font-mono">
            DAILY // WEEKLY // MONTHLY TERMS
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredMachinery.map((machine) => (
            <Card key={machine.id}>
              <CardImage>
                <img src={machine.image} alt={machine.name} />
                <div className="absolute top-3 left-3">
                  <span className="hazard-badge">{machine.category}</span>
                </div>
              </CardImage>

              <CardBody>
                <CardContent>
                  <div className="text-xs text-primary font-mono font-bold mb-1">
                    {machine.location}
                  </div>
                  <Heading level={3} size="md" className="mb-2">
                    {machine.name}
                  </Heading>
                  <p className="text-sm text-gray-400 mb-4 font-mono">{machine.spec}</p>
                </CardContent>

                <CardFooter>
                  <div>
                    <span className="text-2xl font-bold font-heading text-primary">
                      ${machine.price}
                    </span>
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-mono">
                      /{machine.unit}
                    </span>
                  </div>
                  <Button size="sm">Book Unit</Button>
                </CardFooter>
              </CardBody>
            </Card>
          ))}
        </div>
      </SectionContainer>

      {/* Industrial Specs & Standards Bar */}
      <section id="standards" className="border-t border-b border-base-300 bg-base-200">
        <SectionContainer className="py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="border-l-2 border-primary pl-4">
              <div className="text-3xl font-bold font-heading text-white">100%</div>
              <div className="text-sm font-semibold uppercase font-heading text-gray-300 mt-1">
                OSHA Inspected
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Every unit undergoes rigorous load and safety calibration.
              </p>
            </div>

            <div className="border-l-2 border-primary pl-4">
              <div className="text-3xl font-bold font-heading text-white">&lt; 4 HRS</div>
              <div className="text-sm font-semibold uppercase font-heading text-gray-300 mt-1">
                Emergency Dispatch
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Field technicians ready for on-site repairs or unit replacement.
              </p>
            </div>

            <div className="border-l-2 border-primary pl-4">
              <div className="text-3xl font-bold font-heading text-white">STRIPE</div>
              <div className="text-sm font-semibold uppercase font-heading text-gray-300 mt-1">
                Secure Escrow
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Encrypted payment sessions with transparent billing milestones.
              </p>
            </div>

            <div className="border-l-2 border-primary pl-4">
              <div className="text-3xl font-bold font-heading text-white">BETTER AUTH</div>
              <div className="text-sm font-semibold uppercase font-heading text-gray-300 mt-1">
                Multi-Role Security
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Cryptographic JWKS token validation for renters and owners.
              </p>
            </div>
          </div>
        </SectionContainer>
      </section>

      {/* Industrial Footer */}
      <footer className="mt-auto border-t border-base-300 bg-[#121519] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary rounded-xs flex items-center justify-center font-bold text-white text-xs">
              H
            </div>
            <span className="font-heading font-bold uppercase tracking-wider text-sm text-gray-300">
              HEAVY<span className="text-primary">RENT</span> // Heavy Equipment Marketplace
            </span>
          </div>

          <div className="text-xs font-mono text-gray-500">
            SYSTEM STATUS: ALL FLEET TELEMETRY OPERATIONAL
          </div>
        </div>
      </footer>
    </div>
  );
}
