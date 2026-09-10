'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export function DashboardMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [scrollTilt, setScrollTilt] = useState(12);
  const [isHovered, setIsHovered] = useState(false);

  // Track scroll position to tilt more as user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far the component has scrolled into/past view
      // 0 when top enters view, 1 when middle/bottom is scrolled
      const topOffset = rect.top;
      const scrollRatio = Math.max(0, Math.min(1.2, (windowHeight - topOffset) / windowHeight));
      
      // Starts at 10deg, tilts more as scrolled down up to 26deg
      const dynamicTilt = 10 + scrollRatio * 16;
      setScrollTilt(dynamicTilt);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth mouse cursor tracking (tilts to the direction of the cursor)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Y position influences X rotation, X position influences Y rotation
    const tiltX = -((y - centerY) / centerY) * 10;
    const tiltY = ((x - centerX) / centerX) * 12;
    
    setMouseOffset({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMouseOffset({ x: 0, y: 0 });
  };

  const totalRotateX = scrollTilt + mouseOffset.x;
  const totalRotateY = mouseOffset.y;

  return (
    <div 
      className="relative mx-auto w-full max-w-6xl py-4 sm:py-8 px-2 sm:px-4"
      style={{ perspective: '1400px' }}
    >
      {/* Subtle ambient light aura */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-80 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[130px] dark:bg-primary/25" />

      {/* 3D Hardware Tablet Device Frame */}
      <div
        ref={containerRef}
        onMouseMove={(e) => {
          setIsHovered(true);
          handleMouseMove(e);
        }}
        onMouseLeave={handleMouseLeave}
        className="transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: `scale(${isHovered ? 1.02 : 1.0}) rotateX(${totalRotateX}deg) rotateY(${totalRotateY}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <div 
          className="relative mx-auto rounded-[28px] sm:rounded-[36px] border-4 border-zinc-700/80 bg-[#1e1e24] p-2 sm:p-3.5 md:p-4.5 shadow-2xl transition-all dark:border-zinc-800 dark:bg-[#121316]"
          style={{
            boxShadow: '0 0 #0000004d, 0 20px 45px -12px rgba(0,0,0,0.65), 0 45px 85px -18px rgba(0,0,0,0.55)',
          }}
        >
          {/* Inner Screen */}
          <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl bg-[#0e1015] text-zinc-300 font-sans text-xs select-none">
            
            {/* Top Bar (Matching Image 1: Takshaka workspace header) */}
            <div className="flex h-12 items-center justify-between border-b border-zinc-800/80 bg-[#14161d] px-3 sm:px-4">
              
              {/* Left branding & back */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 bg-primary rounded-xs transform -skew-x-12 flex items-center justify-center font-bold text-white text-[9px]">
                    T
                  </div>
                  <span className="font-bold text-zinc-100 text-xs hidden xs:inline">Takshaka</span>
                </div>

                <div className="h-3 w-px bg-zinc-700/60 hidden sm:block" />

                <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline flex items-center gap-1">
                  <span>←</span> Dashboard
                </span>
              </div>

              {/* Center controls & counters (Matching Image 1) */}
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 font-mono text-[10px] text-zinc-300 border border-zinc-700/60">
                  Attempt #3
                </span>
                
                <span className="hidden md:inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/30">
                  + Add Class
                </span>

                <span className="font-mono text-[10px] text-zinc-400 hidden sm:inline">
                  6 classes
                </span>

                <span className="hidden lg:flex items-center gap-1 text-[10px] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Draft saved
                </span>
              </div>

              {/* Right actions: Submit, DRAFT badge, History */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/problem/parking-lot"
                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground shadow-sm transition hover:opacity-90"
                >
                  <span>Submit Architecture</span>
                </Link>

                <span className="rounded-md border border-zinc-700 bg-zinc-800/70 px-2 py-0.5 font-mono text-[10px] text-zinc-300">
                  DRAFT
                </span>

                <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 text-[10px] text-zinc-400">
                  📜 History (3)
                </span>
              </div>
            </div>

            {/* Dashboard Dual-Pane Workspace (Matching Image 1 Layout) */}
            <div className="relative flex h-[420px] sm:h-[480px] md:h-[530px] w-full overflow-hidden">
              
              {/* Left Pane: Requirements & Problem Overview (Matching Image 1) */}
              <div className="hidden md:flex w-64 flex-col justify-between border-r border-zinc-800/80 bg-[#12141a] p-3.5 text-[11px] overflow-hidden">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-bold text-zinc-100 text-sm tracking-tight">
                      Design a Parking Lot
                    </h4>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono font-semibold">
                      Problem Overview
                    </span>
                    <p className="mt-1 text-[10.5px] leading-relaxed text-zinc-400">
                      Multi-floor parking lot management handling diverse vehicle types, spot allocation, and fee strategies.
                    </p>
                  </div>

                  <div className="border-t border-zinc-800/80 pt-2.5">
                    <span className="text-[9px] uppercase tracking-wider text-primary font-mono font-bold">
                      Functional Requirements
                    </span>
                    <ul className="mt-1.5 space-y-1.5 text-[10px] text-zinc-400">
                      <li className="flex items-start gap-1.5">
                        <span className="text-primary font-bold">•</span>
                        <span>Multi-floor spot sizes (Small, Medium, Large)</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-primary font-bold">•</span>
                        <span>Vehicle hierarchy: Motorcycle, Car, Truck</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-primary font-bold">•</span>
                        <span>Decoupled fee calculation via Strategy Pattern</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-primary font-bold">•</span>
                        <span>Ticket issuance with timestamp on entry</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border-t border-zinc-800/80 pt-2">
                    <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-mono font-bold">
                      Rubric Criteria
                    </span>
                    <div className="mt-1 flex items-center justify-between rounded-md bg-emerald-950/30 border border-emerald-800/40 px-2 py-1 text-[10px]">
                      <span className="text-zinc-300">Vehicle Polymorphism</span>
                      <span className="font-mono font-bold text-emerald-400">5 / 5</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-800/60 pt-2 text-[10px] text-zinc-500 font-mono flex items-center justify-between">
                  <span>Interactive Canvas</span>
                  <span className="text-emerald-400">Active</span>
                </div>
              </div>

              {/* Right Pane: Main Architectural Whiteboard Canvas */}
              <div className="relative flex-1 bg-[#0b0c10] p-4 overflow-hidden">
                {/* Dot Matrix Grid */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-45"
                  style={{
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.22) 1px, transparent 1px)',
                    backgroundSize: '22px 22px',
                  }}
                />

                {/* SVG Connecting Relationships with UML styles */}
                <svg className="absolute inset-0 h-full w-full pointer-events-none z-0">
                  <defs>
                    {/* Gradient for connectors */}
                    <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0.85" />
                    </linearGradient>

                    {/* UML Triangle Marker for Inheritance (extends) */}
                    <marker id="inheritanceMarker" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.5" />
                    </marker>

                    {/* UML Diamond Marker for Aggregation/Composition */}
                    <marker id="compositionMarker" viewBox="0 0 12 12" refX="12" refY="6" markerWidth="8" markerHeight="8" orient="auto">
                      <polygon points="6,0 12,6 6,12 0,6" fill="#f97316" stroke="#f97316" strokeWidth="1" />
                    </marker>

                    {/* UML Arrow for Association */}
                    <marker id="arrowMarker" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#a855f7" />
                    </marker>
                  </defs>

                  {/* 1. Car -> Vehicle (Inheritance) */}
                  <path
                    d="M 115 155 L 115 115"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="1.5"
                    markerEnd="url(#inheritanceMarker)"
                  />

                  {/* 2. Motorcycle -> Vehicle (Inheritance) */}
                  <path
                    d="M 195 155 C 195 135, 140 135, 140 115"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="1.5"
                    markerEnd="url(#inheritanceMarker)"
                  />

                  {/* 3. ParkingLot -> Vehicle (Association) */}
                  <path
                    d="M 280 230 C 200 230, 160 115, 160 115"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />

                  {/* 4. HourlyFeeStrategy -> FeeStrategy (Implementation) */}
                  <path
                    d="M 140 435 L 140 375"
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    markerEnd="url(#inheritanceMarker)"
                  />

                  {/* 5. ParkingLot -> FeeStrategy (Strategy Injection) */}
                  <path
                    d="M 280 280 C 210 280, 180 320, 180 320"
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="1.5"
                    markerEnd="url(#arrowMarker)"
                  />

                  {/* 6. ParkingLot -> ParkingSpot (Composition) */}
                  <path
                    d="M 450 230 C 490 230, 490 120, 520 120"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="1.5"
                  />

                  {/* 7. ParkingLot -> Ticket (Creates) */}
                  <path
                    d="M 450 270 C 490 270, 490 350, 520 350"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    markerEnd="url(#arrowMarker)"
                  />
                </svg>

                {/* Simulated UML Nodes (4-5 classes, subclasses, and interfaces) */}
                <div className="relative z-10 h-full w-full font-mono">

                  {/* ── TOP-LEFT: Vehicle Hierarchy (Superclass + Subclasses) ── */}
                  
                  {/* Superclass: Vehicle (Abstract) */}
                  <div className="absolute left-2 sm:left-6 top-3 w-40 sm:w-44 rounded-lg border border-blue-500/50 bg-[#121622]/95 p-2 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
                      <span className="text-[9px] uppercase tracking-wider text-blue-400 font-bold">«abstract»</span>
                      <span className="text-[8px] rounded bg-blue-950/80 px-1 py-0.5 text-blue-300">Superclass</span>
                    </div>
                    <div className="mt-1 font-bold text-zinc-100 text-[11px]">Vehicle</div>
                    <div className="mt-1 space-y-0.5 text-[9px] text-zinc-400 font-sans border-t border-zinc-800/60 pt-1">
                      <div>- licensePlate: string</div>
                      <div>+ getRequiredSpots(): int</div>
                    </div>
                  </div>

                  {/* Subclass 1: Car (extends Vehicle) */}
                  <div className="absolute left-2 sm:left-4 top-40 w-28 sm:w-32 rounded-md border border-blue-400/40 bg-[#11141e]/90 p-1.5 shadow-md">
                    <div className="flex items-center justify-between text-[8px] text-blue-300 border-b border-zinc-800/80 pb-0.5">
                      <span>«class»</span>
                      <span className="text-[7.5px] text-zinc-400 font-mono">extends</span>
                    </div>
                    <div className="font-bold text-white text-[10px] mt-0.5">Car</div>
                    <div className="text-[8.5px] text-zinc-400 font-sans mt-0.5">
                      + spots = 1
                    </div>
                  </div>

                  {/* Subclass 2: Motorcycle (extends Vehicle) */}
                  <div className="absolute left-32 sm:left-38 top-40 w-32 sm:w-36 rounded-md border border-blue-400/40 bg-[#11141e]/90 p-1.5 shadow-md">
                    <div className="flex items-center justify-between text-[8px] text-blue-300 border-b border-zinc-800/80 pb-0.5">
                      <span>«class»</span>
                      <span className="text-[7.5px] text-zinc-400 font-mono">extends</span>
                    </div>
                    <div className="font-bold text-white text-[10px] mt-0.5">Motorcycle</div>
                    <div className="text-[8.5px] text-zinc-400 font-sans mt-0.5">
                      + spots = 1 (Compact)
                    </div>
                  </div>


                  {/* ── BOTTOM-LEFT: Strategy Pattern (Interface + Implementation) ── */}
                  
                  {/* Interface: FeeStrategy */}
                  <div className="absolute left-2 sm:left-6 bottom-24 w-42 sm:w-46 rounded-lg border border-purple-500/50 bg-[#161222]/95 p-2 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
                      <span className="text-[9px] uppercase tracking-wider text-purple-400 font-bold">«interface»</span>
                      <span className="text-[8px] rounded bg-purple-950/80 px-1 py-0.5 text-purple-300">Strategy</span>
                    </div>
                    <div className="mt-1 font-bold text-zinc-100 text-[11px]">FeeStrategy</div>
                    <div className="mt-1 space-y-0.5 text-[9px] text-zinc-400 font-sans border-t border-zinc-800/60 pt-1">
                      <div>+ calculate(hours: int): float</div>
                    </div>
                  </div>

                  {/* Subclass/Implementation: HourlyFeeStrategy (implements FeeStrategy) */}
                  <div className="absolute left-2 sm:left-6 bottom-4 w-44 sm:w-48 rounded-md border border-purple-400/40 bg-[#14101e]/90 p-1.5 shadow-md">
                    <div className="flex items-center justify-between text-[8px] text-purple-300 border-b border-zinc-800/80 pb-0.5">
                      <span>«class»</span>
                      <span className="text-[7.5px] text-zinc-400 font-mono">implements</span>
                    </div>
                    <div className="font-bold text-white text-[10px] mt-0.5">HourlyFeeStrategy</div>
                    <div className="text-[8.5px] text-zinc-400 font-sans mt-0.5">
                      <div>- hourlyRate: float</div>
                      <div>+ calculate(hours): float</div>
                    </div>
                  </div>


                  {/* ── CENTER: Core Aggregate Controller (ParkingLot) ── */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-56 rounded-xl border-2 border-primary bg-[#18151f]/95 p-3 shadow-2xl backdrop-blur-md ring-2 ring-primary/20">
                    <div className="flex items-center justify-between border-b border-zinc-700/80 pb-1.5">
                      <span className="text-[9.5px] uppercase tracking-wider text-primary font-bold">«class»</span>
                      <span className="text-[8.5px] rounded bg-primary/25 px-1.5 py-0.5 text-primary font-semibold">Aggregate Root</span>
                    </div>
                    <div className="mt-1 font-bold text-white text-[12px]">ParkingLot</div>
                    <div className="mt-1.5 space-y-1 text-[9.5px] text-zinc-300 font-sans border-t border-zinc-700/60 pt-1.5">
                      <div>- spots: List&lt;ParkingSpot&gt;</div>
                      <div>- feeStrategy: FeeStrategy</div>
                      <div className="border-t border-zinc-800/80 pt-1 text-zinc-200">
                        <div>+ park(v: Vehicle): Ticket</div>
                        <div>+ unpark(ticket: Ticket): float</div>
                      </div>
                    </div>
                  </div>


                  {/* ── RIGHT: Supporting Classes (ParkingSpot & Ticket) ── */}
                  
                  {/* Entity: ParkingSpot */}
                  <div className="absolute right-2 sm:right-6 top-8 w-40 sm:w-46 rounded-lg border border-emerald-500/50 bg-[#111a16]/95 p-2 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
                      <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">«class»</span>
                      <span className="text-[8px] rounded bg-emerald-950/80 px-1 py-0.5 text-emerald-300">Slot Entity</span>
                    </div>
                    <div className="mt-1 font-bold text-zinc-100 text-[11px]">ParkingSpot</div>
                    <div className="mt-1 space-y-0.5 text-[9px] text-zinc-400 font-sans border-t border-zinc-800/60 pt-1">
                      <div>- spotId: string</div>
                      <div>- isOccupied: boolean</div>
                      <div>+ assign(v: Vehicle): void</div>
                    </div>
                  </div>

                  {/* Transaction: Ticket */}
                  <div className="absolute right-2 sm:right-6 bottom-16 w-40 sm:w-46 rounded-lg border border-amber-500/50 bg-[#1a1711]/95 p-2 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
                      <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold">«class»</span>
                      <span className="text-[8px] rounded bg-amber-950/80 px-1 py-0.5 text-amber-300">Transaction</span>
                    </div>
                    <div className="mt-1 font-bold text-zinc-100 text-[11px]">Ticket</div>
                    <div className="mt-1 space-y-0.5 text-[9px] text-zinc-400 font-sans border-t border-zinc-800/60 pt-1">
                      <div>- ticketId: UUID</div>
                      <div>- entryTime: Instant</div>
                      <div>- spotId: string</div>
                    </div>
                  </div>

                </div>

                {/* Floating Bottom Toolbar (Matching Image 1 bottom left) */}
                <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 rounded-md border border-zinc-800 bg-[#12141a]/95 px-2 py-1 text-zinc-400 text-[10px] font-mono shadow-md">
                  <span className="cursor-pointer px-1 hover:text-zinc-200">+</span>
                  <span className="cursor-pointer px-1 hover:text-zinc-200">-</span>
                  <span className="text-zinc-600">|</span>
                  <span className="text-[9px] text-zinc-400">100%</span>
                </div>

                {/* Minimap Thumbnail (Bottom Right) */}
                <div className="absolute bottom-3 right-3 z-20 hidden sm:block h-14 w-22 rounded-md border border-zinc-800 bg-[#12141a]/90 p-1 shadow-md">
                  <div className="relative h-full w-full">
                    {/* Vehicle */}
                    <div className="absolute left-1 top-1 h-2 w-3 rounded-[1px] bg-blue-500/60" />
                    {/* Car & Bike */}
                    <div className="absolute left-1 top-4 h-1.5 w-2 rounded-[1px] bg-blue-400/50" />
                    <div className="absolute left-4 top-4 h-1.5 w-2 rounded-[1px] bg-blue-400/50" />
                    {/* ParkingLot */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-4.5 rounded-[1px] bg-primary/80 ring-1 ring-primary/40" />
                    {/* FeeStrategy */}
                    <div className="absolute left-1 bottom-1 h-2 w-3 rounded-[1px] bg-purple-500/60" />
                    {/* ParkingSpot */}
                    <div className="absolute right-1 top-1.5 h-2 w-3 rounded-[1px] bg-emerald-500/60" />
                    {/* Ticket */}
                    <div className="absolute right-1 bottom-2 h-2 w-3 rounded-[1px] bg-amber-500/60" />
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
