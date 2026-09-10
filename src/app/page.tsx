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

      {/* Multi-Column Nodebase-style Footer */}
      <footer className="border-t border-neutral-900/80 bg-black/60 px-6 pt-16 pb-12 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            {/* Column 1: Brand & Bio & Socials (span 6) */}
            <div className="md:col-span-6 space-y-4">
              <Link href="/" className="inline-flex items-center gap-2.5 transition hover:opacity-90">
                <Image src="/logo.png" alt="Takshaka" width={24} height={24} className="h-6 w-auto object-contain" />
                <span className="text-base font-bold tracking-tight text-white">Takshaka</span>
              </Link>

              <p className="max-w-sm text-xs leading-relaxed text-neutral-400">
                Building the next generation of architectural modeling infrastructure. Visual whiteboard workflows for modern software engineers.
              </p>

              {/* Social Icons (GitHub, LinkedIn) */}
              <div className="flex items-center gap-3 pt-1 text-neutral-400">
                <a
                  href="https://github.com/karambitbarrage15/Takshaka.git"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="rounded-md p-1 transition hover:text-white"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/aditya-chaturvedi-521a24277/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="rounded-md p-1 transition hover:text-white"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Product (span 4) */}
            <div className="md:col-span-4 md:col-start-9 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                Product
              </h3>
              <ul className="space-y-2.5 text-xs text-neutral-400">
                <li>
                  <a href="#practice-loop" className="transition hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#challenges" className="transition hover:text-white">
                    Challenges
                  </a>
                </li>
                <li>
                  <Link href="/problem/parking-lot" className="transition hover:text-white">
                    Workflows
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="mt-14 pt-6 border-t border-neutral-900/60 text-xs text-neutral-500">
            <span>© 2026 Takshaka. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
