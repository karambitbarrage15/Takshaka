import Link from 'next/link';
import Image from 'next/image';
import { DashboardMockup } from '../components/home/DashboardMockup';
import { SpotlightCard } from '../components/home/SpotlightCard';
import DarkVeil from '../components/home/DarkVeil';
import { PROBLEMS } from '../data/problems';

export default function HomePage() {
  return (
    <div className="dark min-h-screen bg-black font-sans text-neutral-100 flex flex-col selection:bg-primary/30 selection:text-white">
      {/* Top Header (Nodebase style with centered navigation, pure dark, no theme toggle) */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-800/80 bg-black/80 px-6 py-3.5 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between relative">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
            <Image src="/logo.png" alt="Takshaka Logo" width={28} height={28} className="h-7 w-auto object-contain" priority />
            <span className="text-base font-bold tracking-tight text-white">Takshaka</span>
          </Link>
          
          {/* Center: Centered Nav Links (like Nodebase) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400 absolute left-1/2 -translate-x-1/2">
            <a href="#practice-loop" className="transition hover:text-white">
              Methodology
            </a>
            <a href="#challenges" className="transition hover:text-white">
              Challenges
            </a>
            <a
              href="https://github.com/karambitbarrage15/Takshaka.git"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              GitHub
            </a>
          </nav>

          {/* Right: Primary Action Button (no theme toggle) */}
          <div className="flex items-center gap-3">
            <Link
              href="/problem/parking-lot"
              className="rounded-lg bg-primary px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-98"
            >
              Start Practice
            </Link>
          </div>
        </div>
      </header>

      {/* Full-Page Continuous Moving Red Veil Motion Background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <DarkVeil speed={0.65} warpAmount={0.5} color={[0.98, 0.22, 0.1]} />
        {/* Exact Nodebase vignette masks */}
        <div className="absolute inset-0 bg-neutral-950/20 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black pointer-events-none" />
      </div>

      <main className="flex-1 relative z-10 bg-transparent">
        {/* Hero Section */}
        <section className="relative px-6 pt-16 pb-6 sm:pt-20 sm:pb-8 text-center overflow-hidden">
          <div className="mx-auto max-w-4xl relative z-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Architect systems <span className="text-primary">visually</span>.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-neutral-400 sm:text-lg">
              Move past passive reading and syntax debugging. Model domain entities, contracts, 
              and design patterns on an interactive canvas—receive instant, rubric-backed critique with concrete evidence.
            </p>

            {/* Direct Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                href="/problem/parking-lot"
                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              >
                Launch Parking Lot Challenge →
              </Link>
              <a
                href="#challenges"
                className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-5 py-3 text-sm font-semibold text-neutral-200 transition hover:bg-neutral-800 hover:text-white"
              >
                Browse All Challenges
              </a>
            </div>
          </div>

          {/* 3D Hardware Motion Dashboard Mockup */}
          <div className="mt-8 sm:mt-12">
            <DashboardMockup />
          </div>
        </section>

        {/* Methodology / The Practice Loop (Translucent so red motion shows through) */}
        <section id="practice-loop" className="border-t border-neutral-900/80 px-6 py-20 bg-black/40 backdrop-blur-[2px]">
          <div className="mx-auto max-w-5xl">
            <div className="max-w-xl">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                The Core Loop
              </span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Engineered for real architectural rigor
              </h2>
              <p className="mt-2 text-sm text-neutral-400">
                How Takshaka replicates a high-stakes technical whiteboard round.
              </p>
            </div>

            {/* 3 Distinct Spotlight Boxes with Cursor-Following Border Glow */}
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {/* Box 1 */}
              <SpotlightCard className="p-6 sm:p-7">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Domain-First Whiteboard
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-neutral-400">
                  Compose classes, interfaces, abstract contracts, and enums directly on an interactive canvas with typed UML relationships (Inheritance, Implementation, Strategy injection).
                </p>
              </SpotlightCard>

              {/* Box 2 */}
              <SpotlightCard className="p-6 sm:p-7">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Authoritative Rubric Grading
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-neutral-400">
                  Zero hallucinated standards. Your design is judged strictly against the problem&apos;s predefined rubric dimensions, extracting line-by-line evidence from your architecture.
                </p>
              </SpotlightCard>

              {/* Box 3 */}
              <SpotlightCard className="p-6 sm:p-7">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Immutable Attempt History
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-neutral-400">
                  Every submission is locked and scored. Clone your canvas to refactor coupling, improve separation of concerns, and benchmark your progress across multiple iterations.
                </p>
              </SpotlightCard>
            </div>
          </div>
        </section>

        {/* Challenges Catalog (Translucent so red motion shows through) */}
        <section id="challenges" className="border-t border-neutral-900/80 px-6 py-20 bg-transparent">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                  Available Challenges
                </span>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Benchmark Architectural Problems
                </h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Select a challenge to launch the dual-pane requirements and canvas workspace.
                </p>
              </div>
              <span className="text-xs font-mono text-neutral-500">
                {PROBLEMS.length} challenges ready
              </span>
            </div>

            {/* Problems Grid - Single clean surface, no boxes inside boxes */}
            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              {PROBLEMS.map((problem) => {
                const isIntermediate = problem.id === 'parking-lot';
                const badgeLabel = isIntermediate ? 'Intermediate' : 'Advanced';
                return (
                  <div key={problem.id} className="relative pt-3">
                    {/* Centered pill badge straddling the top border */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                      <span className="inline-flex items-center rounded-full bg-primary px-3.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md ring-2 ring-black">
                        {badgeLabel}
                      </span>
                    </div>

                    <SpotlightCard className="p-7 pt-9">
                      <Link
                        href={`/problem/${problem.id}`}
                        className="group flex flex-col justify-between h-full"
                      >
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                            {problem.title}
                          </h3>

                        <p className="mt-2.5 text-xs leading-relaxed text-neutral-400">
                          {problem.description}
                        </p>

                        <p className="mt-5 text-xs leading-relaxed text-neutral-400">
                          <span className="font-semibold text-neutral-300">Evaluates: </span>
                          {isIntermediate
                            ? 'Vehicle abstraction, parking spot encapsulation, lot cohesion, and decoupled fee strategy.'
                            : 'Elevator state modeling, request abstraction, dispatch strategy, and system coordination.'}
                        </p>
                      </div>

                      <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-primary">
                        <span>Open Practice Workspace</span>
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </div>
                    </Link>
                  </SpotlightCard>
                </div>
              );
            })}
            </div>
          </div>
        </section>
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="border-t border-neutral-900/80 bg-black/50 backdrop-blur-sm px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row text-xs text-neutral-500">
          <div className="flex items-center gap-2 font-medium text-neutral-300">
            <Image src="/logo.png" alt="Takshaka" width={18} height={18} className="h-4 w-auto object-contain" />
            <span>Takshaka</span>
            <span className="text-neutral-500 font-normal">— Low-Level Design Practice Platform</span>
          </div>
          <div>
            <span>Architectural Modeling & AI Evaluation. Zero Setup Required.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
