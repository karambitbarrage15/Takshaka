'use client';

import React, { useState, useEffect } from 'react';
import { AttemptStatus } from '../../domain/Attempt';

export interface CanvasToolbarProps {
  onAddClass: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  attemptStatus: AttemptStatus;
  attemptNumber: number;
  isLocked: boolean;
  nodeCount: number;
  historyCount: number;
  hasFeedback: boolean;
  onOpenScorecard: () => void;
  onOpenHistory: () => void;
}

export function CanvasToolbar({
  onAddClass,
  onSaveDraft,
  onSubmit,
  saveStatus,
  attemptStatus,
  attemptNumber,
  isLocked,
  nodeCount,
  historyCount,
  hasFeedback,
  onOpenScorecard,
  onOpenHistory,
}: CanvasToolbarProps) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    return stored
      ? stored === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    }
  };

  const isCompleted = attemptStatus === AttemptStatus.COMPLETED;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white/90 px-4 py-2.5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90">
      {/* Left controls: Attempt badge, Add Class, Node count */}
      <div className="flex items-center gap-2.5">
        <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          Attempt #{attemptNumber}
        </span>

        <button
          type="button"
          onClick={onAddClass}
          disabled={isLocked}
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>+</span> Add Class
        </button>

        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {nodeCount} {nodeCount === 1 ? 'class' : 'classes'}
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Save Status Indicator */}
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {saveStatus === 'saving' && (
            <>
              <span className="inline-block h-2 w-2 animate-ping rounded-full bg-amber-400" />
              <span className="text-zinc-500 dark:text-zinc-400">Saving...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-zinc-500 dark:text-zinc-400">Draft saved</span>
            </>
          )}
          {saveStatus === 'unsaved' && (
            <>
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-amber-600 dark:text-amber-400">Unsaved changes</span>
            </>
          )}
        </div>

        {/* Save Draft Button (disabled if completed/locked) */}
        {!isCompleted && (
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isLocked || saveStatus === 'saving'}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Save Draft
          </button>
        )}

        {/* View Scorecard Button (Prominent when completed) */}
        {isCompleted && hasFeedback && (
          <button
            type="button"
            onClick={onOpenScorecard}
            className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
          >
            <span>★</span> View Scorecard
          </button>
        )}

        {/* Submit Architecture Button (hidden if already completed) */}
        {!isCompleted && (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isLocked || nodeCount === 0}
            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit Architecture
          </button>
        )}

        {/* Attempt Status Badge */}
        <div className="border-l border-zinc-200 pl-3 dark:border-zinc-800">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${
              attemptStatus === AttemptStatus.DRAFT
                ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                : attemptStatus === AttemptStatus.EVALUATING
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 animate-pulse'
                : attemptStatus === AttemptStatus.COMPLETED
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                : 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
            }`}
          >
            {attemptStatus}
          </span>
        </div>

        {/* History Drawer Button */}
        <div className="border-l border-zinc-200 pl-3 dark:border-zinc-800">
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <span>📜</span> History ({historyCount})
          </button>
        </div>

        {/* Theme Toggle */}
        <div className="border-l border-zinc-200 pl-3 dark:border-zinc-800">
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            {isDark ? (
              <svg
                className="h-4 w-4 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4 text-zinc-600 dark:text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
