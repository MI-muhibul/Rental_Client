'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';

interface ConfirmedBooking {
  _id?: string;
  id?: string;
  equipmentId?: string | { _id: string; name?: string; image?: string; location?: string; category?: string };
  equipment?: {
    _id?: string;
    name?: string;
    image?: string;
    category?: string;
    location?: string;
    price?: number;
    rentalType?: string;
  };
  startDate?: string;
  endDate?: string;
  duration?: number;
  quantity?: number;
  totalPrice?: number;
  total?: number;
  status?: string;
  paymentStatus?: string;
  phone?: string;
  address?: string;
  notes?: string;
  transactionId?: string;
  stripeSessionId?: string;
  createdAt?: string;
}

interface PaymentRecord {
  _id?: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  date?: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id') || searchParams.get('sessionId') || '';

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<ConfirmedBooking | null>(null);
  const [payment, setPayment] = useState<PaymentRecord | null>(null);

  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    async function verifyAndConfirmPayment() {
      if (!sessionId) {
        if (isMounted) {
          setError('Missing session_id parameter in checkout return callback.');
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL.replace(/\/$/, '')}/payments/confirm?session_id=${encodeURIComponent(sessionId)}`,
          {
            credentials: 'include',
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.message || 'Payment confirmation failed');
        }

        if (isMounted) {
          setBooking(data.booking || null);
          setPayment(data.payment || null);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : 'Unable to verify payment confirmation.';
          setError(message);
          setBooking(null);
          setPayment(null);
          setLoading(false);
        }
      }
    }

    verifyAndConfirmPayment();

    return () => {
      isMounted = false;
    };
  }, [sessionId, retryCount]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-[#F8F9FA]">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-[#2A2A2A] border-t-[#FF5500] animate-spin" />
          <div className="absolute font-heading font-black text-xs text-[#FF5500]">HR</div>
        </div>
        <h2 className="font-heading font-black text-xl uppercase tracking-wider text-neutral-100">
          Confirming Stripe Transaction...
        </h2>
        <p className="font-mono text-xs text-neutral-400 mt-2">
          Verifying cryptographic payment intent with Stripe & registering fleet mobilization records
        </p>
      </div>
    );
  }

  // Error State
  if (error && !booking) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-[#F8F9FA]">
        <div className="max-w-md w-full bg-[#181818] border-2 border-red-500/60 p-8 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-950/60 border border-red-500/50 flex items-center justify-center text-red-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="font-heading font-black text-xl uppercase tracking-wider text-neutral-100">
            Payment Verification Warning
          </h2>
          <p className="font-mono text-xs text-neutral-400">{error}</p>
          <div className="pt-4 flex flex-col gap-2">
            {sessionId && (
              <button
                type="button"
                onClick={() => setRetryCount((c) => c + 1)}
                className="py-3 px-6 bg-[#FF5500] hover:bg-[#E64A00] text-black font-heading font-black text-xs uppercase tracking-widest transition-colors"
              >
                Retry Verification
              </button>
            )}
            <Link
              href="/dashboard"
              className="py-3 px-6 border border-[#FF5500] text-[#FF5500] hover:bg-[#FF5500]/10 font-heading font-black text-xs uppercase tracking-widest transition-colors"
            >
              Check My Dashboard
            </Link>
            <Link
              href="/equipment"
              className="py-2.5 px-6 border border-neutral-700 hover:border-neutral-500 text-neutral-300 font-mono text-xs uppercase"
            >
              Return to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const equipmentInfo = booking?.equipment || (typeof booking?.equipmentId === 'object' ? booking.equipmentId : null);
  const orderRef = booking?._id ? `#HR-${booking._id.toString().substring(booking._id.toString().length - 6).toUpperCase()}` : '#HR-CONFIRMED';
  const totalPaid = payment?.amount !== undefined ? payment.amount : (booking?.totalPrice || booking?.total || 0);
  const currency = payment?.currency || 'USD';

  return (
    <div className="min-h-screen bg-[#121212] text-[#F8F9FA] pb-24 pt-8">
      {/* Top safety stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-[#FF5500] to-emerald-500" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Header Banner */}
          <div className="bg-[#181818] border-2 border-emerald-500 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-bold block">
                    Stripe Payment Authorized & Verified
                  </span>
                  <h1 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-neutral-100">
                    Mobilization Order Confirmed
                  </h1>
                </div>
              </div>

              <div className="text-left sm:text-right font-mono">
                <span className="text-[11px] text-neutral-400 block uppercase">Order Reference</span>
                <span className="text-lg font-bold text-[#FF5500] font-heading">{orderRef}</span>
              </div>
            </div>

            <p className="mt-4 text-xs font-mono text-neutral-300 max-w-2xl border-t border-[#2A2A2A] pt-4">
              Your equipment mobilization order has been confirmed. The fleet logistics team has been notified to inspect and prep the machinery for dispatch.
            </p>
          </div>

          {/* Detailed Order Summary Card */}
          <div className="bg-[#181818] border border-[#2A2A2A] divide-y divide-[#262626] shadow-xl">
            {/* Section 1: Equipment Specification */}
            <div className="p-6">
              <h3 className="font-mono text-xs font-bold text-[#FF5500] uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Reserved Machinery Asset
              </h3>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {equipmentInfo?.image && (
                  <div className="relative w-28 h-20 bg-[#131313] border border-[#333333] flex-shrink-0 overflow-hidden">
                    <Image
                      src={equipmentInfo.image}
                      alt={equipmentInfo?.name || 'Equipment'}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <div className="font-heading font-black text-lg uppercase text-neutral-100">
                    {equipmentInfo?.name || 'Industrial Heavy Fleet Asset'}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-neutral-400">
                    {equipmentInfo?.category && (
                      <span>Class: <strong className="text-neutral-200">{equipmentInfo.category}</strong></span>
                    )}
                    {equipmentInfo?.location && (
                      <span>Yard: <strong className="text-neutral-200">{equipmentInfo.location}</strong></span>
                    )}
                    <span>Units Reserved: <strong className="text-[#FF5500]">{booking?.quantity || 1}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Deployment Timeline & Logistics */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3 font-mono text-xs">
                <h4 className="font-bold text-neutral-300 uppercase tracking-wider text-[11px]">
                  Mobilization Schedule
                </h4>
                <div className="bg-[#131313] p-3 border border-[#252525] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Mobilization Date:</span>
                    <span className="text-neutral-200 font-bold">
                      {booking?.startDate ? new Date(booking.startDate).toLocaleDateString() : 'Immediate'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Demobilization Date:</span>
                    <span className="text-neutral-200 font-bold">
                      {booking?.endDate ? new Date(booking.endDate).toLocaleDateString() : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Rental Duration:</span>
                    <span className="text-[#FF5500] font-bold">
                      {booking?.duration ? `${booking.duration} Days` : 'Multi-day lease'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <h4 className="font-bold text-neutral-300 uppercase tracking-wider text-[11px]">
                  Site Contact & Destination
                </h4>
                <div className="bg-[#131313] p-3 border border-[#252525] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Jobsite Address:</span>
                    <span className="text-neutral-200 text-right font-medium max-w-[200px] truncate">
                      {booking?.address || 'Houston Central Yard Terminal'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Site Contact Phone:</span>
                    <span className="text-neutral-200 font-bold">{booking?.phone || '+1 (555) 749-0192'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Dispatch Status:</span>
                    <span className="text-emerald-400 font-bold uppercase">{booking?.status || 'Confirmed'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Financial & Stripe Settlement */}
            <div className="p-6 font-mono text-xs space-y-3">
              <h4 className="font-bold text-neutral-300 uppercase tracking-wider text-[11px]">
                Payment Settlement Record
              </h4>
              <div className="bg-[#131313] p-4 border border-[#252525] space-y-2">
                <div className="flex justify-between text-neutral-400">
                  <span>Stripe Transaction ID:</span>
                  <span className="text-neutral-300 font-mono select-all">
                    {payment?.transactionId || booking?.transactionId || sessionId}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Settlement Status:</span>
                  <span className="text-emerald-400 font-bold uppercase">PAID (STRIPE ESCROW)</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-[#262626]">
                  <span className="font-heading font-black text-sm uppercase text-neutral-200">
                    Total Amount Settled:
                  </span>
                  <span className="font-heading font-black text-2xl text-[#FF5500]">
                    ${Number(totalPaid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes if provided */}
            {booking?.notes && (
              <div className="p-6 font-mono text-xs">
                <span className="text-neutral-500 uppercase text-[10px] block mb-1">Operational Notes:</span>
                <p className="text-neutral-300 bg-[#131313] p-3 border border-[#252525]">{booking.notes}</p>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <Link
              href="/equipment"
              className="w-full sm:w-auto px-6 py-3.5 border-2 border-[#2E2E2E] hover:border-neutral-400 text-neutral-300 font-mono text-xs uppercase tracking-wider text-center transition-colors"
            >
              &larr; Return to Fleet Catalog
            </Link>

            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-3.5 bg-[#1B1B1B] hover:bg-[#252525] border border-neutral-700 text-neutral-200 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                Print Manifest
              </button>
              <Link
                href="/dashboard"
                className="px-8 py-3.5 bg-[#FF5500] hover:bg-[#E64A00] text-black font-heading font-black text-xs uppercase tracking-widest shadow-xl transition-colors text-center"
              >
                Go to My Dashboard &rarr;
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center p-8 bg-[#121212] text-[#F8F9FA]">
          <div className="w-12 h-12 rounded-full border-4 border-neutral-800 border-t-[#FF5500] animate-spin" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
