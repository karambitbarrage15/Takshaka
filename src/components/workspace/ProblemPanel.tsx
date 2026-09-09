'use client';

import React from 'react';
import Link from 'next/link';
import { Problem } from '../../domain/Problem';

interface ProblemPanelProps {
  problem: Problem;
}

export function ProblemPanel({ problem }: ProblemPanelProps) {
  return (
    <aside className="flex h-full flex-col overflow-y-auto border-r border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Navigation & Header */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {problem.title}
        </h1>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Problem Overview
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {problem.description}
        </p>
      </div>

      {/* Requirements */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Functional Requirements
        </h2>
        <ul className="mt-2 space-y-2">
          {problem.requirements.map((req, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300"
            >
              <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Evaluation Rubric */}
      <div className="mt-auto border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Evaluation Rubric Criteria
        </h2>
        <div className="mt-3 space-y-2.5">
          {problem.rubric.map((criterion) => (
            <div
              key={criterion.id}
              className="rounded-md border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/60"
            >
              <div className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                {criterion.id.replace('req-', '').replace(/-/g, ' ').toUpperCase()}
              </div>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                {criterion.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
