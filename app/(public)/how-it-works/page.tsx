import React from 'react';
import Link from 'next/link';
import SectionContainer from '@/components/ui/SectionContainer';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Select Certified Machinery',
      desc: 'Browse our real-time inventory of excavators, loaders, dozers, and compaction gear. Review technical specs, load limits, and availability.',
      highlight: 'Live Availability Tracking',
    },
    {
      num: '02',
      title: 'Request Instant Job Quote',
      desc: 'Enter your project dates and deployment location. Our backend calculates transparent duration rates with zero hidden surcharges.',
      highlight: 'Daily / Weekly / Monthly Rates',
    },
    {
      num: '03',
      title: 'Secure Escrow & Booking',
      desc: 'Confirm your rental reservation through encrypted Stripe checkout sessions. Funds remain in escrow until machinery is dispatched.',
      highlight: '100% Insured Transactions',
    },
    {
      num: '04',
      title: 'On-Site Delivery & Telemetry',
      desc: 'Our certified flatbed fleet hauls the machinery directly to your job site coordinate. Complete return logistics handled automatically.',
      highlight: '4-Hour Emergency Support',
    },
  ];

  return (
    <SectionContainer className="py-16">
      <div className="max-w-3xl mb-12">
        <span className="hazard-badge mb-3">PROCEDURAL PROTOCOLS</span>
        <Heading level={1} size="xl" className="mb-4">
          How Machinery Rental Works
        </Heading>
        <p className="text-gray-400 text-lg">
          A streamlined 4-step deployment cycle built specifically for civil engineers,
          general contractors, and fleet managers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {steps.map((step) => (
          <div
            key={step.num}
            className="bg-base-200 border border-base-300 rounded-sm p-6 relative flex flex-col justify-between hover:border-primary/50 transition-colors"
          >
            <div>
              <div className="font-heading font-black text-4xl text-primary/40 mb-3">
                {step.num}
              </div>
              <Heading level={3} size="md" className="mb-3">
                {step.title}
              </Heading>
              <p className="text-sm text-gray-400 leading-relaxed font-body">
                {step.desc}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-base-300/80 text-[11px] font-mono text-primary font-bold">
              [ {step.highlight} ]
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#121519] border border-base-300 rounded-sm p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <Heading level={2} size="md" className="mb-2">
            Ready to dispatch equipment to your job site?
          </Heading>
          <p className="text-sm text-gray-400 font-mono">
            Full compliance coverage with nationwide contractor support.
          </p>
        </div>
        <Link href="/equipment">
          <Button size="lg">Explore Equipment Fleet</Button>
        </Link>
      </div>
    </SectionContainer>
  );
}
