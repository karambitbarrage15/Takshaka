'use client';

import React from 'react';
import Link from 'next/link';
import { Problem } from '../../domain/Problem';

interface ProblemPanelProps {
  problem: Problem;
}

export function ProblemPanel({ problem }: ProblemPanelProps) {
  return (
    <aside className="flex h-full flex-col overflow-y-auto border-r border-border bg-card p-6 text-card-foreground">
      {/* Navigation & Header */}
      <div className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-foreground transition hover:opacity-80"
          >
            <img src="/logo.png" alt="Takshaka" className="h-5 w-auto object-contain" />
            <span className="font-bold tracking-tight">Takshaka</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-medium text-primary hover:underline"
          >
            ← Dashboard
          </Link>
        </div>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-foreground">
          {problem.title}
        </h1>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Problem Overview
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground">
          {problem.description}
        </p>
      </div>

      {/* Requirements */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Functional Requirements
        </h2>
        <ul className="mt-2 space-y-2">
          {problem.requirements.map((req, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-xs leading-relaxed text-foreground"
            >
              <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Evaluation Rubric */}
      <div className="mt-auto border-t border-border pt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Evaluation Rubric Criteria
        </h2>
        <div className="mt-3 space-y-2.5">
          {problem.rubric.map((criterion) => (
            <div
              key={criterion.id}
              className="rounded-md border border-border bg-muted/40 p-2.5"
            >
              <div className="text-[11px] font-semibold text-foreground">
                {criterion.id.replace('req-', '').replace(/-/g, ' ').toUpperCase()}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {criterion.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
