import Link from 'next/link';
import { PROBLEMS } from '../data/problems';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Top Header */}
      <header className="border-b border-border bg-card px-8 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground shadow-sm">
              T
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">Takshaka</span>
          </div>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground border border-border">
            Interactive Practice Platform
          </span>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-5xl px-8 py-12">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Master Low-Level Design by Practicing Visually
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Select an architectural problem, design your domain classes and relationships visually on the
            canvas, and prepare for machine coding and system design interviews.
          </p>
        </div>

        {/* Problem Cards */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {PROBLEMS.map((problem) => {
            const isMedium = problem.id === 'parking-lot';
            return (
              <div
                key={problem.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/50 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                        isMedium
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                      }`}
                    >
                      {isMedium ? 'Medium' : 'Hard'}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">#{problem.id}</span>
                  </div>

                  <h2 className="mt-3 text-lg font-bold text-card-foreground">
                    {problem.title}
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {problem.description}
                  </p>

                  <div className="mt-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Core Concepts Tested:
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {problem.rubric.map((r) => (
                        <span
                          key={r.id}
                          className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border"
                        >
                          {r.id.replace('req-', '').replace(/-/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-border pt-4">
                  <Link
                    href={`/problem/${problem.id}`}
                    className="flex w-full items-center justify-center rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
                  >
                    Open Practice Workspace →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
