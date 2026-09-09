import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { PROBLEMS } from '../data/problems';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 px-6 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Takshaka Logo" width={28} height={28} className="h-7 w-auto object-contain" priority />
            <span className="text-base font-bold tracking-tight text-foreground">Takshaka</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
            <a
              href="#challenges"
              className="transition hover:text-foreground hidden sm:inline-block"
            >
              Challenges
            </a>
            <a
              href="#how-it-works"
              className="transition hover:text-foreground hidden sm:inline-block"
            >
              How It Works
            </a>
            <ThemeToggle />
            <Link
              href="/problem/parking-lot"
              className="rounded-lg bg-primary px-3.5 py-1.5 font-semibold text-primary-foreground shadow-xs transition hover:opacity-90"
            >
              Start Practice →
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Master Low-Level Design <br className="hidden sm:inline" />
              by <span className="text-primary underline decoration-primary/30 underline-offset-8">Practicing Visually</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Say goodbye to passive reading. Model object-oriented domain architectures on a reactive canvas, 
              receive instant AI rubric-driven evaluations, and iterate toward production-grade interview readiness.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/problem/parking-lot"
                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90 hover:shadow-lg"
              >
                Launch Parking Lot Challenge →
              </Link>
              <a
                href="#challenges"
                className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-2xs transition hover:bg-muted"
              >
                Browse All Challenges
              </a>
            </div>

            {/* Micro value badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 border-y border-border/60 py-4 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="text-primary font-bold">✓</span> UML Whiteboard Canvas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-primary font-bold">✓</span> Gemini AI Rubric Evaluation
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-primary font-bold">✓</span> Actionable Scorecards
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-primary font-bold">✓</span> Multi-Attempt History & Retry
              </span>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="border-t border-border bg-card/40 px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
                The Learning Loop
              </h2>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                How Takshaka Sharpens Your LLD Skills
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Three focused steps engineered to simulate real FAANG / Tier-1 machine coding rounds.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {/* Step 1 */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                  01
                </div>
                <h4 className="mt-4 text-base font-bold text-foreground">
                  Model on the Canvas
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Add Classes, Abstract Classes, Interfaces, and Enums. Drag typed UML relationships like 
                  Inheritance, Implementation, Aggregation, and Composition.
                </p>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                  02
                </div>
                <h4 className="mt-4 text-base font-bold text-foreground">
                  Rubric AI Analysis
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Click Submit to invoke Google Gemini. Your design is judged on functional requirements, 
                  separation of concerns, design pattern usage, and extensibility.
                </p>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                  03
                </div>
                <h4 className="mt-4 text-base font-bold text-foreground">
                  Iterate & Master
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Review your 0–100 scorecard, granular evidence, and architectural critiques. Clone your draft, 
                  refactor bottlenecks, and watch your score rise.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Challenges Catalog */}
        <section id="challenges" className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
                  Practice Whiteboards
                </h2>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Featured Architectural Challenges
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select a challenge to launch the interactive dual-pane workspace.
                </p>
              </div>
              <span className="text-xs font-medium text-muted-foreground font-mono">
                {PROBLEMS.length} challenges available
              </span>
            </div>

            {/* Problem Cards */}
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {PROBLEMS.map((problem) => {
                return (
                  <div
                    key={problem.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-7 shadow-xs transition hover:border-primary/50 hover:shadow-md"
                  >
                    <div>
                      <h4 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                        {problem.title}
                      </h4>
                      <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                        {problem.description}
                      </p>

                      {/* Requirements count */}
                      <div className="mt-4 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          • {problem.requirements.length} Requirements
                        </span>
                        <span>• Dynamic AI Grading</span>
                      </div>

                      {/* Concepts Tested */}
                      <div className="mt-4">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Key Dimensions Evaluated:
                        </span>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {problem.rubric.map((r) => (
                            <span
                              key={r.id}
                              className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-foreground"
                            >
                              {r.id.replace('req-', '').replace(/-/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-7 border-t border-border pt-4">
                      <Link
                        href={`/problem/${problem.id}`}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-xs transition hover:opacity-90 group-hover:shadow-sm"
                      >
                        Open Practice Workspace <span>→</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Takshaka" width={20} height={20} className="h-5 w-auto object-contain" />
            <span className="text-sm font-bold text-foreground">Takshaka</span>
            <span className="text-xs text-muted-foreground">— LLD Practice Platform</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Architectural Domain Modeling & AI Evaluation. Built for engineering excellence.
          </p>
        </div>
      </footer>
    </div>
  );
}
