'use client';

import React, { useRef, useState } from 'react';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export function SpotlightCard({
  children,
  className = '',
  glowColor = 'rgba(234, 88, 12, 0.55)', // subtle primary orange/red border glow
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: -100, y: -100 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative rounded-2xl border border-neutral-800/80 bg-neutral-950/50 backdrop-blur-sm transition-all duration-300 ${className}`}
      {...props}
    >
      {/* 1px Cursor-Following Border Glow (Only illuminates the border edge nearest to cursor) */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-200 z-10"
        style={{
          opacity,
          background: `radial-gradient(180px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 100%)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          mask: 'linear-gradient(#fff 0 0) content-box exclude, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          padding: '1px',
        }}
      />

      {/* Subtle interior cursor reflection */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 z-0 overflow-hidden"
        style={{
          opacity,
          background: `radial-gradient(280px circle at ${position.x}px ${position.y}px, rgba(234, 88, 12, 0.05), transparent 80%)`,
        }}
      />

      <div className="relative z-20 h-full w-full">
        {children}
      </div>
    </div>
  );
}
