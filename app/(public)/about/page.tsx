import React from 'react';
import SectionContainer from '@/components/ui/SectionContainer';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <SectionContainer className="py-16">
      <div className="max-w-3xl mb-12">
        <span className="hazard-badge mb-3">CORPORATE BACKGROUND</span>
        <Heading level={1} size="xl" className="mb-4">
          Engineered for Heavy Infrastructure
        </Heading>
        <p className="text-gray-400 text-lg leading-relaxed font-body">
          HEAVYRENT is a technology-driven industrial marketplace connecting verified commercial
          fleet owners with civil engineering contractors across North America.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-base-200 border border-base-300 rounded-sm p-6">
          <div className="text-primary font-heading font-black text-3xl mb-2">99.8%</div>
          <Heading level={3} size="md" className="mb-2">
            Zero Downtime SLA
          </Heading>
          <p className="text-sm text-gray-400 font-body">
            All listed units pass multi-point pre-delivery inspections. If a unit experiences mechanical
            failure, a replacement is dispatched in under 4 hours.
          </p>
        </div>

        <div className="bg-base-200 border border-base-300 rounded-sm p-6">
          <div className="text-primary font-heading font-black text-3xl mb-2">$50M+</div>
          <Heading level={3} size="md" className="mb-2">
            Insured Fleet Value
          </Heading>
          <p className="text-sm text-gray-400 font-body">
            Every booking is backed by comprehensive commercial general liability and inland marine
            coverage, protecting both renter and equipment owner.
          </p>
        </div>

        <div className="bg-base-200 border border-base-300 rounded-sm p-6">
          <div className="text-primary font-heading font-black text-3xl mb-2">1,200+</div>
          <Heading level={3} size="md" className="mb-2">
            Contractor Network
          </Heading>
          <p className="text-sm text-gray-400 font-body">
            From regional road expansions to utility excavation, hundreds of certified contractors
            rely on our on-demand heavy machinery network daily.
          </p>
        </div>
      </div>

      <div className="border-t border-base-300 pt-8 flex items-center justify-between">
        <div className="text-xs font-mono text-gray-500">
          OPERATIONAL HEADQUARTERS // DALLAS • HOUSTON • AUSTIN
        </div>
        <Link href="/contact">
          <Button variant="outline" size="sm">
            Contact Engineering Team
          </Button>
        </Link>
      </div>
    </SectionContainer>
  );
}
