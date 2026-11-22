'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

function PaymentCancelContent() {
  return (
    <div className="min-h-screen bg-[#121212] text-[#F8F9FA] pb-24 pt-12">
      {/* Top Warning Stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-red-600 via-[#FF5500] to-red-600" />

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-[#181818] border-2 border-red-500/60 p-8 sm:p-10 shadow-2xl space-y-6 text-center"
        >
          {/* Warning Icon */}
          <div className="w-16 h-16 mx-auto rounded-full bg-red-950/70 border-2 border-red-500 flex items-center justify-center text-red-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-red-400 uppercase tracking-widest font-bold">
              Transaction Aborted
            </span>
            <h1 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-neutral-100">
              Mobilization Payment Cancelled
            </h1>
          </div>

          {/* Description */}
          <p className="text-xs font-mono text-neutral-400 leading-relaxed">
            The checkout session was discontinued before finalizing payment authorization. No funds have been captured from your account, and equipment mobilization has been suspended.
          </p>

          {/* Information box */}
          <div className="bg-[#131313] p-4 border border-[#2B2B2B] text-left font-mono text-xs space-y-2 text-neutral-300">
            <div className="flex items-center gap-2 text-neutral-200 font-bold">
              <svg className="w-4 h-4 text-[#FF5500]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Need Assistance or Custom Terms?</span>
            </div>
            <p className="text-neutral-400 text-[11px]">
              If you experienced an issue with your payment method, required a formal purchase order, or want to adjust rental duration parameters, our dispatch desk is standing by 24/7.
            </p>
          </div>

          {/* Navigation Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/equipment"
              className="px-6 py-3.5 bg-[#FF5500] hover:bg-[#E64A00] text-black font-heading font-black text-xs uppercase tracking-widest transition-colors shadow-lg"
            >
              Return to Equipment Fleet
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3.5 border border-[#333333] hover:border-neutral-400 text-neutral-300 font-mono text-xs uppercase tracking-wider transition-colors"
            >
              Contact Dispatch Desk
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center p-8 bg-[#121212] text-[#F8F9FA]">
          <div className="w-12 h-12 rounded-full border-4 border-neutral-800 border-t-[#FF5500] animate-spin" />
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}
