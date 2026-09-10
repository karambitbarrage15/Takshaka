const fs = require("fs");
const path = require("path");

const target = path.resolve("src/components/home/DashboardMockup.tsx");
fs.mkdirSync(path.dirname(target), { recursive: true });

const componentCode = `'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

export function DashboardMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 14, y: -2 });
  const [isHovered, setIsHovered] = useState(false);

  // Smooth mouse tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Subtle tilt: X axis rotates based on Y, Y axis rotates based on X
    const rotateX = 14 - ((y - centerY) / centerY) * 8; // range ~ 6deg to 22deg
    const rotateY = ((x - centerX) / centerX) * 8;       // range ~ -8deg to +8deg
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 14, y: -2 });
  };

  return (
    <div 
      className="relative mx-auto w-full max-w-5xl py-6 md:py-10 px-2 sm:px-4"
      style={{ perspective: '1200px' }}
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px] dark:bg-primary/20" />

      {/* 3D Hardware Tablet Device Frame */}
      <div
        ref={containerRef}
        onMouseMove={(e) => {
          setIsHovered(true);
          handleMouseMove(e);
        }}
        onMouseLeave={handleMouseLeave}
        className="transition-transform duration-500 ease-out"
        style={{
          transform: isHovered
            ? \`scale(1.02) rotateX(\${rotation.x}deg) rotateY(\${rotation.y}deg)\`
            : 'scale(1.0) rotateX(14deg) rotateY(-2deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        <div 
          className="relative mx-auto rounded-[28px] sm:rounded-[36px] border-4 border-zinc-700/70 bg-[#1e1e22] p-2 sm:p-4 md:p-5 shadow-2xl transition-all dark:border-zinc-800 dark:bg-[#141417]"
          style={{
            boxShadow: '0 0 #0000004d, 0 16px 36px -10px rgba(0,0,0,0.6), 0 35px 70px -15px rgba(0,0,0,0.5)',
          }}
        >
          {/* Inner Screen Bezel */}
          <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl bg-[#0c0d10] text-zinc-300 font-mono text-xs select-none">
            
            {/* Window Top Navigation Bar */}
            <div className="flex h-11 items-center justify-between border-b border-zinc-800/80 bg-[#121317] px-4">
              <div className="flex items-center gap-3">
                {/* Traffic lights */}
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="hidden sm:flex items-center gap-1 text-[11px] text-zinc-400">
                  <span className="text-zinc-500">Challenges</span>
                  <span className="text-zinc-600">/</span>
                  <span className="font-semibold text-zinc-200">Parking Lot System</span>
                </div>
              </div>

              {/* Center status indicator */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-800/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Canvas Active
                </span>
              </div>

              {/* Right CTA */}
              <div className="flex items-center gap-2">
                <Link
                  href="/problem/parking-lot"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
                >
                  <span>Submit Architecture</span>
                  <span className="text-xs">⚡</span>
                </Link>
              </div>
            </div>

            {/* Dashboard Workspace Body */}
            <div className="relative flex h-[340px] sm:h-[400px] md:h-[440px] w-full overflow-hidden">
              
              {/* Left Mini Sidebar */}
              <div className="hidden md:flex w-44 flex-col justify-between border-r border-zinc-800/80 bg-[#101115] p-3 text-[11px]">
                <div className="space-y-1">
                  <div className="mb-3 px-2 py-1 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                    Requirements
                  </div>
                  <div className="rounded-md bg-zinc-800/70 px-2.5 py-1.5 font-medium text-zinc-200">
                    Parking Lot Core
                  </div>
                  <div className="rounded-md px-2.5 py-1.5 text-zinc-400 hover:text-zinc-200">
                    Vehicle Hierarchy
                  </div>
                  <div className="rounded-md px-2.5 py-1.5 text-zinc-400 hover:text-zinc-200">
                    Strategy Pattern
                  </div>
                  <div className="rounded-md px-2.5 py-1.5 text-zinc-400 hover:text-zinc-200">
                    Spot Allocation
                  </div>
                </div>

                <div className="border-t border-zinc-800/60 pt-3 text-[10px] text-zinc-500">
                  <div className="flex items-center justify-between px-2">
                    <span>Rubric Score</span>
                    <span className="font-bold text-emerald-400">92/100</span>
                  </div>
                </div>
              </div>

              {/* Main Whiteboard Canvas */}
              <div className="relative flex-1 bg-[#0c0d10] p-4 overflow-hidden">
                {/* Dot matrix grid */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-40"
                  style={{
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)',
                    backgroundSize: '22px 22px',
                  }}
                />

                {/* SVG Animated Connector Lines */}
                <svg className="absolute inset-0 h-full w-full pointer-events-none z-0">
                  <defs>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  {/* Vehicle -> ParkingLot */}
                  <path
                    d="M 120 70 C 180 70, 180 180, 240 180"
                    fill="none"
                    stroke="url(#lineGrad)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="animate-[dashStream_20s_linear_infinite]"
                  />

                  {/* FeeStrategy -> ParkingLot */}
                  <path
                    d="M 120 290 C 180 290, 180 220, 240 220"
                    fill="none"
                    stroke="url(#lineGrad)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />

                  {/* ParkingLot -> ParkingSpot */}
                  <path
                    d="M 430 180 C 490 180, 490 110, 560 110"
                    fill="none"
                    stroke="url(#lineGrad)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />

                  {/* ParkingLot -> Ticket */}
                  <path
                    d="M 430 220 C 490 220, 490 280, 560 280"
                    fill="none"
                    stroke="url(#lineGrad)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                </svg>

                {/* Simulated UML Nodes */}
                <div className="relative z-10 h-full w-full">
                  
                  {/* Node 1: Vehicle (Abstract) */}
                  <div className="absolute left-2 sm:left-6 top-6 w-44 sm:w-48 rounded-xl border border-blue-500/40 bg-zinc-900/90 p-2.5 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-blue-400 font-bold">«abstract»</span>
                      <span className="text-[9px] rounded bg-blue-950 px-1 py-0.5 text-blue-300">Entity</span>
                    </div>
                    <div className="mt-1 font-bold text-zinc-100 text-[11px]">Vehicle</div>
                    <div className="mt-1 space-y-0.5 text-[9.5px] text-zinc-400 font-sans border-t border-zinc-800/60 pt-1">
                      <div>- licensePlate: string</div>
                      <div>- vehicleType: Type</div>
                      <div>+ getRequiredSpots(): int</div>
                    </div>
                  </div>

                  {/* Node 2: FeeStrategy (Interface) */}
                  <div className="absolute left-2 sm:left-6 bottom-8 w-44 sm:w-48 rounded-xl border border-purple-500/40 bg-zinc-900/90 p-2.5 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">«interface»</span>
                      <span className="text-[9px] rounded bg-purple-950 px-1 py-0.5 text-purple-300">Strategy</span>
                    </div>
                    <div className="mt-1 font-bold text-zinc-100 text-[11px]">FeeStrategy</div>
                    <div className="mt-1 space-y-0.5 text-[9.5px] text-zinc-400 font-sans border-t border-zinc-800/60 pt-1">
                      <div>+ calculate(duration: int): double</div>
                    </div>
                  </div>

                  {/* Node 3: ParkingLot (Center Core Controller) */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-56 rounded-xl border-2 border-primary/70 bg-[#16171d] p-3 shadow-xl backdrop-blur-sm ring-1 ring-primary/20">
                    <div className="flex items-center justify-between border-b border-zinc-700/60 pb-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-primary font-bold">«class»</span>
                      <span className="text-[9px] rounded bg-primary/20 px-1.5 py-0.5 text-primary font-semibold">Core Root</span>
                    </div>
                    <div className="mt-1 font-bold text-white text-[12px]">ParkingLot</div>
                    <div className="mt-1.5 space-y-0.5 text-[10px] text-zinc-300 font-sans border-t border-zinc-700/60 pt-1.5">
                      <div>- floors: List&lt;ParkingFloor&gt;</div>
                      <div>- feeStrategy: FeeStrategy</div>
                      <div>+ parkVehicle(v: Vehicle): Ticket</div>
                      <div>+ unpark(ticket: Ticket): Receipt</div>
                    </div>
                  </div>

                  {/* Node 4: ParkingSpot (Entity) */}
                  <div className="absolute right-2 sm:right-6 top-8 w-44 sm:w-48 rounded-xl border border-emerald-500/40 bg-zinc-900/90 p-2.5 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">«class»</span>
                      <span className="text-[9px] rounded bg-emerald-950 px-1 py-0.5 text-emerald-300">Slot</span>
                    </div>
                    <div className="mt-1 font-bold text-zinc-100 text-[11px]">ParkingSpot</div>
                    <div className="mt-1 space-y-0.5 text-[9.5px] text-zinc-400 font-sans border-t border-zinc-800/60 pt-1">
                      <div>- spotId: string</div>
                      <div>- isFree: boolean</div>
                      <div>+ assign(v: Vehicle): void</div>
                    </div>
                  </div>

                  {/* Node 5: Ticket (Value Object) */}
                  <div className="absolute right-2 sm:right-6 bottom-12 w-44 sm:w-48 rounded-xl border border-amber-500/40 bg-zinc-900/90 p-2.5 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">«class»</span>
                      <span className="text-[9px] rounded bg-amber-950 px-1 py-0.5 text-amber-300">Transaction</span>
                    </div>
                    <div className="mt-1 font-bold text-zinc-100 text-[11px]">Ticket</div>
                    <div className="mt-1 space-y-0.5 text-[9.5px] text-zinc-400 font-sans border-t border-zinc-800/60 pt-1">
                      <div>- ticketId: UUID</div>
                      <div>- entryTimestamp: Instant</div>
                      <div>- assignedSpotId: string</div>
                    </div>
                  </div>

                </div>

                {/* Floating Bottom Toolbar */}
                <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 rounded-lg border border-zinc-800 bg-[#121317]/90 px-2 py-1 text-zinc-400 text-[11px]">
                  <span className="cursor-pointer px-1 hover:text-zinc-200">+</span>
                  <span className="cursor-pointer px-1 hover:text-zinc-200">-</span>
                  <span className="cursor-pointer px-1 text-zinc-600">|</span>
                  <span className="text-[9px] text-zinc-400 font-sans">100%</span>
                </div>

                {/* Minimap Thumbnail */}
                <div className="absolute bottom-3 right-3 z-20 hidden sm:block h-14 w-20 rounded-md border border-zinc-800/80 bg-zinc-900/80 p-1">
                  <div className="relative h-full w-full">
                    <div className="absolute left-1 top-1 h-2 w-3 rounded-[1px] bg-blue-500/50" />
                    <div className="absolute left-1 bottom-1 h-2 w-3 rounded-[1px] bg-purple-500/50" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-4 rounded-[1px] bg-primary/70" />
                    <div className="absolute right-1 top-1 h-2 w-3 rounded-[1px] bg-emerald-500/50" />
                    <div className="absolute right-1 bottom-1 h-2 w-3 rounded-[1px] bg-amber-500/50" />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(target, componentCode, "utf-8");
console.log("DashboardMockup.tsx created successfully!");
