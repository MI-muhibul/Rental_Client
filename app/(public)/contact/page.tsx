'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import SectionContainer from '@/components/ui/SectionContainer';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    siteLocation: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Dispatch ticket submitted. A field representative will contact you within 15 minutes.');
    setFormData({ name: '', email: '', phone: '', siteLocation: '', message: '' });
  };

  return (
    <SectionContainer className="py-16">
      <div className="max-w-3xl mb-12">
        <span className="hazard-badge mb-3">JOB SITE TELEMETRY // DISPATCH</span>
        <Heading level={1} size="xl" className="mb-4">
          Contact Field Dispatch
        </Heading>
        <p className="text-gray-400 text-lg font-body">
          Need urgent machinery mobilization or have custom project requirements? Our technical logistics
          team is staffed 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact Form (2 Spans) */}
        <div className="lg:col-span-2 bg-base-200 border border-base-300 rounded-sm p-8 shadow-xl">
          <Heading level={2} size="md" className="mb-6">
            Dispatch Ticket Requisition
          </Heading>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Operator / Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Apex Civil LLC"
                  className="w-full bg-[#121519] border border-base-300 focus:border-primary text-white text-sm px-4 py-2.5 rounded-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="dispatch@apexcivil.com"
                  className="w-full bg-[#121519] border border-base-300 focus:border-primary text-white text-sm px-4 py-2.5 rounded-xs outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Direct Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-[#121519] border border-base-300 focus:border-primary text-white text-sm px-4 py-2.5 rounded-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Project Site Location
                </label>
                <input
                  type="text"
                  value={formData.siteLocation}
                  onChange={(e) => setFormData({ ...formData, siteLocation: e.target.value })}
                  placeholder="Dallas Fort Worth Yard #4"
                  className="w-full bg-[#121519] border border-base-300 focus:border-primary text-white text-sm px-4 py-2.5 rounded-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-gray-300 mb-1">
                Equipment Specs & Logistics Notes *
              </label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Specify machinery models required, expected mobilization dates, and site access constraints."
                className="w-full bg-[#121519] border border-base-300 focus:border-primary text-white text-sm px-4 py-2.5 rounded-xs outline-none font-body"
              />
            </div>

            <Button type="submit" size="md" className="mt-4">
              Transmit Dispatch Request
            </Button>
          </form>
        </div>

        {/* Technical Direct Contacts */}
        <div className="space-y-6">
          <div className="bg-base-200 border border-base-300 rounded-sm p-6">
            <span className="hazard-badge mb-2">24/7 HOTLINE</span>
            <div className="text-xl font-heading font-bold text-primary mt-1">
              1-800-HEAVY-RENT
            </div>
            <p className="text-xs text-gray-400 mt-2 font-mono">
              Direct emergency dispatch to certified heavy haul mechanics.
            </p>
          </div>

          <div className="bg-base-200 border border-base-300 rounded-sm p-6 space-y-3 font-mono text-xs">
            <div className="text-white font-bold font-heading text-sm uppercase">
              Operational Hubs
            </div>
            <div className="text-gray-400">
              <strong className="text-gray-200">Dallas Yard:</strong> 10440 Interstate 35E, Dallas, TX
            </div>
            <div className="text-gray-400">
              <strong className="text-gray-200">Houston Yard:</strong> 7200 Port of Houston Blvd, Houston, TX
            </div>
            <div className="text-gray-400">
              <strong className="text-gray-200">Email:</strong> dispatch@heavyrent.com
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
