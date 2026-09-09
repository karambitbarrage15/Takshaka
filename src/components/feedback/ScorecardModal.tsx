'use client';

import React from 'react';
import { Feedback } from '../../domain/Feedback';

export interface ScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  feedback: Feedback | null;
  attemptNumber: number;
  problemTitle: string;
}

export function ScorecardModal({
  isOpen,
  onClose,
  onRetry,
  feedback,
  attemptNumber,
  problemTitle,
}: ScorecardModalProps) {
  if (!isOpen || !feedback) {
    return null;
  }

  const isPassing = feedback.overallScore >= 75;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Attempt #{attemptNumber}
              </span>
              <span className="text-xs text-muted-foreground">LLD Architectural Scorecard</span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-foreground">
              {problemTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* Overall Score Banner */}
          <div
            className={`flex items-center justify-between rounded-xl border p-5 ${
              isPassing
                ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/60 dark:bg-emerald-950/40'
                : 'border-amber-200 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/40'
            }`}
          >
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Architectural Evaluation
              </div>
              <div className="mt-1 text-2xl font-extrabold text-foreground">
                {isPassing ? 'Passing Architecture' : 'Needs Refinement'}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {isPassing
                  ? 'Your design satisfies key SOLID principles and rubric criteria.'
                  : 'Review the suggestions below to improve modularity and decoupling.'}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div
                className={`text-4xl font-black ${
                  isPassing
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {feedback.overallScore}
                <span className="text-sm font-semibold text-muted-foreground">/100</span>
              </div>
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Strengths */}
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                <span>✓</span> Key Strengths
              </h3>
              <ul className="mt-2.5 space-y-1.5">
                {feedback.strengths.length > 0 ? (
                  feedback.strengths.map((s, idx) => (
                    <li
                      key={idx}
                      className="text-xs leading-relaxed text-foreground"
                    >
                      • {s}
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-muted-foreground">None highlighted</li>
                )}
              </ul>
            </div>

            {/* Improvements */}
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                <span>→</span> Areas to Improve
              </h3>
              <ul className="mt-2.5 space-y-1.5">
                {feedback.improvements.length > 0 ? (
                  feedback.improvements.map((imp, idx) => (
                    <li
                      key={idx}
                      className="text-xs leading-relaxed text-foreground"
                    >
                      • {imp}
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-muted-foreground">None required</li>
                )}
              </ul>
            </div>
          </div>

          {/* Rubric Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Rubric Assessment Breakdown
            </h3>
            <div className="mt-3 space-y-3">
              {feedback.rubricEvaluations.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-card p-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-foreground text-xs">
                      {item.criterion}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border">
                        {item.confidence}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                          item.score >= 4
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.score === 3
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {item.score} / 5
                      </span>
                    </div>
                  </div>

                  {/* Evidence */}
                  <div className="mt-2.5 text-xs text-foreground">
                    <span className="font-semibold">Evidence: </span>
                    {item.evidence}
                  </div>

                  {/* Concern */}
                  {item.concern && (
                    <div className="mt-1.5 text-xs text-amber-700 dark:text-amber-300">
                      <span className="font-semibold">Concern: </span>
                      {item.concern}
                    </div>
                  )}

                  {/* Suggestion */}
                  {item.suggestion && (
                    <div className="mt-1.5 text-xs text-primary">
                      <span className="font-semibold">Suggestion: </span>
                      {item.suggestion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border bg-muted/40 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-xs transition hover:bg-muted"
          >
            Inspect Canvas
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition hover:opacity-90"
          >
            <span>↺</span> Try Again (Clone & Iterate)
          </button>
        </div>
      </div>
    </div>
  );
}
