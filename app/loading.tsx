import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-8 bg-base-100">
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer rotating machined ring with safety orange indicator */}
        <div className="w-18 h-18 rounded-full border-4 border-base-300 border-t-primary border-r-primary/40 animate-spin" />
        
        {/* Pulsing hazard core */}
        <div className="absolute w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
          <span className="w-3 h-3 rounded-full bg-primary" />
        </div>
      </div>

      <div className="inline-flex items-center gap-2 mb-2">
        <span className="hazard-badge">FLEET TELEMETRY</span>
      </div>

      <div className="font-heading font-black text-lg uppercase tracking-wider text-white">
        Loading System Telemetry...
      </div>
      
      <div className="text-xs font-mono text-gray-500 mt-1">
        Synchronizing machinery fleet data // please standby
      </div>
    </div>
  );
}
