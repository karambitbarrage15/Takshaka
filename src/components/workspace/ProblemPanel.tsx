'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Problem } from '../../domain/Problem';
import { ThemeToggle } from '../common/ThemeToggle';

interface ProblemPanelProps {
  problem: Problem;
}

export function ProblemPanel({ problem }: ProblemPanelProps) {
  const isIntermediate = problem.id === 'parking-lot';
  const difficulty = isIntermediate ? 'Intermediate' : 'Advanced';
  const estTime = isIntermediate ? '45 min' : '60 min';

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-r border-border bg-card text-card-foreground">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-10 border-b border-border bg-card/95 px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-xs font-semibold text-foreground transition"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted p-0.5 border border-border/80">
              <Image src="/logo.png" alt="Takshaka" width={16} height={16} className="h-4 w-auto object-contain" />
            </div>
            <span className="font-bold tracking-tight">Takshaka</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <ThemeToggle className="h-7 w-7" />
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <span className="text-[13px] leading-none">←</span>
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 space-y-7">
        {/* Title & Meta Badges */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary">
              {difficulty}
            </span>
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 font-medium text-muted-foreground border border-border/70">
              {estTime}
            </span>
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 font-medium text-muted-foreground border border-border/70">
              {problem.requirements.length} Requirements
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground font-serif">
            {problem.title}
          </h1>

          <p className="text-xs leading-relaxed text-muted-foreground">
            {problem.description}
          </p>
        </div>

        {/* Requirements Section */}
        <div className="space-y-3.5 pt-2">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Functional Scope
            </h2>
            <span className="text-[11px] font-medium text-muted-foreground">
              {problem.requirements.length} checkpoints
            </span>
          </div>

          <ol className="space-y-2.5 text-xs leading-relaxed text-foreground">
            {problem.requirements.map((req, idx) => (
              <li
                key={idx}
                className="group flex items-start gap-3 rounded-lg border border-transparent p-2 transition-colors hover:border-border/60 hover:bg-muted/40"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground border border-border/80 group-hover:border-primary/40 group-hover:text-primary">
                  {idx + 1}
                </span>
                <span className="pt-0.5">{req}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Evaluation Rubric */}
        <div className="space-y-3.5 border-t border-border/80 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Evaluation Rubric
            </h2>
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
              Graded Strictly
            </span>
          </div>

          <div className="space-y-2.5">
            {problem.rubric.map((criterion) => {
              const label = criterion.id.replace('req-', '').replace(/-/g, ' ');
              return (
                <div
                  key={criterion.id}
                  className="rounded-lg border border-border bg-card p-3 shadow-2xs transition-colors hover:border-border/80 hover:bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold capitalize text-foreground">
                      {label}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                    {criterion.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
