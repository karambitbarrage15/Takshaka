'use client';

import React from 'react';
import { Attempt, AttemptStatus } from '../../domain/Attempt';

export interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  attempts: Attempt[];
  activeAttemptId: string | null;
  onSelectAttempt: (attemptId: string) => void;
  onStartBlankAttempt: () => void;
}

export function HistoryDrawer({
  isOpen,
  onClose,
  attempts,
  activeAttemptId,
  onSelectAttempt,
  onStartBlankAttempt,
}: HistoryDrawerProps) {
  if (!isOpen) {
    return null;
  }

  // 1. Sort chronologically ascending to establish immutable Attempt #1, #2, ...
  const chronologicalAttempts = [...attempts].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  // 2. Map with persistent attempt numbers, then display newest first
  const displayItems = chronologicalAttempts
    .map((attempt, index) => ({
      attempt,
      attemptNumber: index + 1,
    }))
    .reverse();

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs"
    >
      <div className="flex h-full w-full max-w-sm flex-col border-l border-border bg-card text-card-foreground shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Attempt History
            </h2>
            <p className="text-xs text-muted-foreground">
              {attempts.length} {attempts.length === 1 ? 'attempt' : 'attempts'} recorded
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close history"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Action: Start Blank Attempt */}
        <div className="border-b border-border p-4">
          <button
            type="button"
            onClick={onStartBlankAttempt}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-primary/50 bg-primary/10 py-2 text-xs font-semibold text-primary shadow-xs transition hover:bg-primary/20"
          >
            <span>+</span> Start Blank Attempt
          </button>
        </div>

        {/* Attempt List */}
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {displayItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No attempts yet. Start designing on the canvas.
            </div>
          ) : (
            displayItems.map(({ attempt, attemptNumber }) => {
              const isActive = attempt.id === activeAttemptId;
              const hasScore = attempt.status === AttemptStatus.COMPLETED && attempt.feedback;

              return (
                <div
                  key={attempt.id}
                  onClick={() => onSelectAttempt(attempt.id)}
                  className={`group relative flex cursor-pointer flex-col rounded-xl border p-3.5 transition ${
                    isActive
                      ? 'border-primary bg-primary/10 shadow-xs'
                      : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        Attempt #{attemptNumber}
                      </span>
                      {isActive && (
                        <span className="rounded-full bg-primary px-1.5 py-0.2 text-[9px] font-bold text-primary-foreground uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                        attempt.status === AttemptStatus.DRAFT
                          ? 'bg-muted text-foreground border border-border'
                          : attempt.status === AttemptStatus.EVALUATING
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                          : attempt.status === AttemptStatus.COMPLETED
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {attempt.status}
                    </span>
                  </div>

                  {/* Score & Timestamp */}
                  <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono text-[11px]">
                      {attempt.createdAt.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      •{' '}
                      {attempt.createdAt.toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>

                    {hasScore && (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {attempt.feedback!.overallScore} / 100
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
