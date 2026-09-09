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
    return stored === 'dark';
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
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/90 px-4 py-2.5 backdrop-blur-sm text-card-foreground">
      {/* Left controls: Attempt badge, Add Class, Node count */}
      <div className="flex items-center gap-2.5">
        <span className="rounded-md bg-muted px-2 py-1 text-xs font-bold text-foreground border border-border">
          Attempt #{attemptNumber}
        </span>

        <button
          type="button"
          onClick={onAddClass}
          disabled={isLocked}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>+</span> Add Class
        </button>

        <span className="text-xs text-muted-foreground">
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
              <span className="text-muted-foreground">Saving...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Draft saved</span>
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
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
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
            className="flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit Architecture
          </button>
        )}

        {/* Attempt Status Badge */}
        <div className="border-l border-border pl-3">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${
              attemptStatus === AttemptStatus.DRAFT
                ? 'bg-muted text-foreground border border-border'
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
        <div className="border-l border-border pl-3">
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition hover:bg-muted"
          >
            <span>📜</span> History ({historyCount})
          </button>
        </div>

        {/* Theme Toggle */}
        <div className="border-l border-border pl-3">
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-sm transition hover:bg-muted"
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
                className="h-4 w-4 text-muted-foreground"
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
