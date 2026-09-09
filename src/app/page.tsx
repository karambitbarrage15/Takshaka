import Link from 'next/link';
import { PROBLEMS } from '../data/problems';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Top Header */}
      <header className="border-b border-zinc-200 bg-white px-8 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-sm">
              L
            </div>
            <span className="text-base font-bold tracking-tight">LLD Practice Platform</span>
          </div>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            Phase 6E Workspace MVP
          </span>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-5xl px-8 py-12">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Master Low-Level Design by Practicing Visually
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
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
                className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
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
                    <span className="text-xs text-zinc-400 font-mono">#{problem.id}</span>
                  </div>

                  <h2 className="mt-3 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    {problem.title}
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {problem.description}
                  </p>

                  <div className="mt-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Core Concepts Tested:
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {problem.rubric.map((r) => (
                        <span
                          key={r.id}
                          className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          {r.id.replace('req-', '').replace(/-/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800/80">
                  <Link
                    href={`/problem/${problem.id}`}
                    className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500"
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
