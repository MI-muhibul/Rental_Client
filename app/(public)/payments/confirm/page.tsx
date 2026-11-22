'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PaymentsConfirmRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const sessionId = searchParams.get('session_id') || searchParams.get('sessionId') || '';
    if (sessionId) {
      router.replace(`/payment/success?session_id=${encodeURIComponent(sessionId)}`);
    } else {
      router.replace('/payment/success');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-[#121212] text-[#F8F9FA]">
      <div className="w-12 h-12 rounded-full border-4 border-neutral-800 border-t-[#FF5500] animate-spin mb-4" />
      <div className="font-mono text-xs text-neutral-400">Routing to Payment Manifest...</div>
    </div>
  );
}

export default function PaymentsConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center p-8 bg-[#121212] text-[#F8F9FA]">
          <div className="w-12 h-12 rounded-full border-4 border-neutral-800 border-t-[#FF5500] animate-spin" />
        </div>
      }
    >
      <PaymentsConfirmRedirect />
    </Suspense>
  );
}
