'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/useToast';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';

export interface BookNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: {
    _id: string;
    id?: string;
    name: string;
    price: number;
    pricePerDay?: number;
    rentalType: string;
    quantity: number;
    location: string;
    image?: string;
    category?: string;
  };
  initialQuantity?: number;
}

interface QuoteResponse {
  available: boolean;
  total?: number;
  duration?: number;
  unit?: string;
  error?: string;
  requestedQuantity?: number;
  availableQuantity?: number;
}

export const BookNowModal: React.FC<BookNowModalProps> = ({
  isOpen,
  onClose,
  equipment,
  initialQuantity = 1,
}) => {
  const { notifyError, notifySuccess } = useToast();

  const equipmentId = equipment._id || equipment.id || '';

  // Form Fields
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });

  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Quote State
  const [quoteLoading, setQuoteLoading] = useState<boolean>(false);
  const [quoteData, setQuoteData] = useState<QuoteResponse | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Today ISO string for date inputs min attribute
  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Local calculation fallback
  const localFallbackQuote = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    const days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));

    const rate = equipment.price || equipment.pricePerDay || 100;
    const qty = Math.max(1, quantity);

    let baseTotal = days * rate * qty;
    if (equipment.rentalType === 'weekly') {
      const weeks = Math.max(1, Math.ceil(days / 7));
      baseTotal = weeks * rate * qty;
    } else if (equipment.rentalType === 'monthly') {
      const months = Math.max(1, Math.ceil(days / 30));
      baseTotal = months * rate * qty;
    }

    return {
      days,
      baseTotal,
      deposit: Math.round(rate * 0.5),
    };
  }, [startDate, endDate, quantity, equipment]);

  // Debounced quote fetcher
  const fetchQuote = useCallback(
    async (sDate: string, eDate: string, qty: number) => {
      if (!equipmentId || !sDate || !eDate) return;

      const start = new Date(sDate);
      const end = new Date(eDate);

      if (end < start) {
        setQuoteError('End date cannot precede mobilization start date.');
        setQuoteData(null);
        return;
      }

      setQuoteLoading(true);
      setQuoteError(null);

      try {
        const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/bookings/quote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            equipmentId,
            startDate: sDate,
            endDate: eDate,
            quantity: qty,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setQuoteError(data.error || 'Inventory unavailable for selected timeframe');
          setQuoteData(null);
        } else {
          setQuoteData(data);
          setQuoteError(null);
        }
      } catch {
        // Fallback: estimate locally so user is never stranded
        setQuoteData({
          available: true,
          total: localFallbackQuote.baseTotal,
          duration: localFallbackQuote.days,
          unit: 'days',
        });
        setQuoteError(null);
      } finally {
        setQuoteLoading(false);
      }
    },
    [equipmentId, localFallbackQuote]
  );

  // Re-fetch quote whenever dates or quantity change
  useEffect(() => {
    if (!isOpen) return;

    const handler = setTimeout(() => {
      fetchQuote(startDate, endDate, quantity);
    }, 250);

    return () => clearTimeout(handler);
  }, [isOpen, startDate, endDate, quantity, fetchQuote]);

  // Handle Form Submission
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      notifyError('Start date cannot be in the past.');
      return;
    }

    if (end < start) {
      notifyError('End date cannot precede the start date.');
      return;
    }

    // 2. Validate quantity
    if (quantity < 1) {
      notifyError('Quantity must be at least 1 unit.');
      return;
    }

    if (equipment.quantity && quantity > equipment.quantity) {
      notifyError(`Requested quantity (${quantity}) exceeds available stock (${equipment.quantity}).`);
      return;
    }

    // 3. Validate contact info
    if (!phone.trim()) {
      notifyError('Site contact phone number is required.');
      return;
    }

    if (!address.trim()) {
      notifyError('Jobsite deployment address is required.');
      return;
    }

    if (quoteError) {
      notifyError(quoteError);
      return;
    }

    setSubmitting(true);

    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/payments/checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        credentials: 'include',
        body: JSON.stringify({
          equipmentId,
          startDate,
          endDate,
          quantity,
          phone: phone.trim(),
          address: address.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to initiate checkout session');
      }

      if (data.url) {
        notifySuccess('Redirecting to Stripe secure payment checkout...');
        window.location.href = data.url;
        return;
      } else {
        throw new Error('No checkout URL returned from payment provider.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to connect to Stripe checkout';
      notifyError(message);
      setSubmitting(false);
    }
  };

  const activeTotal = quoteData?.total !== undefined ? quoteData.total : localFallbackQuote.baseTotal;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.2 }}
            className="bg-[#181818] border-2 border-[#FF5500] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto text-[#F8F9FA]"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="border-b border-[#2E2E2E] pb-4 mb-6">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#FF5500]/10 border border-[#FF5500]/40 text-[#FF5500] text-[10px] font-mono uppercase tracking-widest font-bold">
                Mobilization Order Terminal
              </div>
              <h2 className="font-heading font-black text-xl sm:text-2xl uppercase tracking-tight text-neutral-100 mt-2">
                Deploy: {equipment.name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-400 mt-1">
                <span>Yard: {equipment.location}</span>
                <span>•</span>
                <span className="text-[#FF5500] font-bold">
                  Rate: ${equipment.price} / {equipment.rentalType}
                </span>
                <span>•</span>
                <span>Stock: {equipment.quantity} units</span>
              </div>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleProceedToPayment} className="space-y-5">
              {/* Dates & Quantity Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Start Date */}
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                    Start Date <span className="text-[#FF5500]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={todayIso}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#131313] border border-[#333333] px-3 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                    End Date <span className="text-[#FF5500]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={startDate || todayIso}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#131313] border border-[#333333] px-3 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500]"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                    Quantity <span className="text-[#FF5500]">*</span>
                  </label>
                  <div className="flex items-center border border-[#333333] bg-[#131313]">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 text-neutral-400 hover:text-white font-mono font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={equipment.quantity || 99}
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          setQuantity(Math.max(1, Math.min(equipment.quantity || 99, val)));
                        }
                      }}
                      className="w-full text-center bg-transparent border-0 font-mono font-bold text-xs text-neutral-100 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(equipment.quantity || 99, q + 1))}
                      className="px-3 py-2 text-neutral-400 hover:text-white font-mono font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact Information: Phone & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                    Site Contact Phone <span className="text-[#FF5500]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#131313] border border-[#333333] px-3.5 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500] placeholder-neutral-600"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                    Jobsite Deployment Address <span className="text-[#FF5500]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 742 Evergreen Terrace, Sector 4"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#131313] border border-[#333333] px-3.5 py-2.5 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500] placeholder-neutral-600"
                  />
                </div>
              </div>

              {/* Operational Notes */}
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1.5">
                  Operational & Logistics Notes <span className="text-neutral-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Gate access code, staging area restrictions, certified operator requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#131313] border border-[#333333] p-3 text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#FF5500] placeholder-neutral-600 resize-none"
                />
              </div>

              {/* Quote & Availability Status Box */}
              <div className="bg-[#131313] border border-[#2E2E2E] p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#252525] pb-2">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">
                    Live Rental Calculation
                  </span>
                  {quoteLoading && (
                    <span className="text-[10px] text-[#FF5500] flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
                      Querying Fleet Inventory...
                    </span>
                  )}
                </div>

                {quoteError ? (
                  <div className="p-2.5 bg-red-950/40 border border-red-500/40 text-red-400 text-xs flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{quoteError}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-neutral-400">
                      <span>Deployment Duration:</span>
                      <span className="text-neutral-200 font-bold">
                        {quoteData?.duration || localFallbackQuote.days} {quoteData?.unit || 'days'}
                      </span>
                    </div>

                    <div className="flex justify-between text-neutral-400">
                      <span>Machinery Fleet Rate:</span>
                      <span className="text-neutral-200">
                        ${equipment.price} × {quantity} unit(s)
                      </span>
                    </div>

                    <div className="flex justify-between text-neutral-400">
                      <span>Refundable Yard Deposit:</span>
                      <span className="text-emerald-400 font-bold">
                        ${localFallbackQuote.deposit.toLocaleString()} (Authorization Hold)
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-2 border-t border-[#333333] font-heading">
                      <span className="text-sm font-black uppercase text-neutral-100">
                        Estimated Rental Total:
                      </span>
                      <span className="text-2xl font-black text-[#FF5500]">
                        ${activeTotal.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || !!quoteError || quoteLoading}
                  className={`w-full py-4 px-6 flex items-center justify-center gap-3 font-heading font-black text-sm uppercase tracking-widest transition-all shadow-xl ${
                    submitting || !!quoteError || quoteLoading
                      ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                      : 'bg-[#FF5500] hover:bg-[#E64A00] text-black hover:shadow-[#FF5500]/25 active:translate-y-0.5 cursor-pointer'
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Initiating Stripe Secure Checkout...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span>Pay & Mobilize Asset with Stripe</span>
                    </>
                  )}
                </button>
              </div>

              {/* Security Footnote */}
              <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-neutral-500 pt-1">
                <svg className="w-3.5 h-3.5 text-[#FF5500]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>256-Bit Encrypted Payment Processing Powered by Stripe</span>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookNowModal;
