const fs = require("fs");
const path = require("path");

const pageCode = `import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { DashboardMockup } from '../components/home/DashboardMockup';
import { PROBLEMS } from '../data/problems';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 px-6 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Takshaka Logo" width={28} height={28} className="h-7 w-auto object-contain" priority />
            <span className="text-base font-bold tracking-tight text-foreground">Takshaka</span>
          </div>
          
          <nav className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
            <a href="#practice-loop" className="transition hover:text-foreground hidden sm:inline-block">
              Methodology
            </a>
            <a href="#challenges" className="transition hover:text-foreground hidden sm:inline-block">
              Challenges
            </a>
            <ThemeToggle />
            <Link
              href="/problem/parking-lot"
              className="rounded-lg bg-primary px-3.5 py-1.5 font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Start Practice →
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 pt-16 pb-6 sm:pt-20 sm:pb-8 text-center overflow-hidden">
          <div className="mx-auto max-w-4xl">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-primary font-semibold mb-4">
              <span>Low-Level Design Practice Platform</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.12]">
              Architect systems visually. <br />
              <span className="text-primary">Evaluated against authoritative rubrics.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Move past passive reading and syntax debugging. Model domain entities, contracts, 
              and design patterns on an interactive canvas—receive instant, rubric-backed critique with concrete evidence.
            </p>

            {/* Direct Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                href="/problem/parking-lot"
                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Launch Parking Lot Challenge →
              </Link>
              <a
                href="#challenges"
                className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
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

        {/* Methodology / The Practice Loop (Flat, Editorial, NO BOX INSIDE BOX) */}
        <section id="practice-loop" className="border-t border-border px-6 py-20 bg-muted/20">
          <div className="mx-auto max-w-5xl">
            <div className="max-w-xl">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                The Core Loop
              </span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Engineered for real architectural rigor
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                How Takshaka replicates a high-stakes technical whiteboard round.
              </p>
            </div>

            {/* Clean 3-Column Editorial Grid (No nested cards or boxes inside boxes) */}
            <div className="mt-12 grid gap-10 sm:grid-cols-3">
              <div>
                <span className="font-mono text-xs font-bold text-primary">01 / MODEL</span>
                <h3 className="mt-2 text-base font-bold text-foreground">
                  Domain-First Whiteboard
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Compose classes, interfaces, abstract contracts, and enums directly on an interactive canvas with typed UML relationships (Inheritance, Implementation, Strategy injection).
                </p>
              </div>

              <div>
                <span className="font-mono text-xs font-bold text-primary">02 / EVALUATE</span>
                <h3 className="mt-2 text-base font-bold text-foreground">
                  Authoritative Rubric Grading
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Zero hallucinated standards. Your design is judged strictly against the problem&apos;s predefined rubric dimensions, extracting line-by-line evidence from your architecture.
                </p>
              </div>

              <div>
                <span className="font-mono text-xs font-bold text-primary">03 / ITERATE</span>
                <h3 className="mt-2 text-base font-bold text-foreground">
                  Immutable Attempt History
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Every submission is locked and scored. Clone your canvas to refactor coupling, improve separation of concerns, and benchmark your progress across multiple iterations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Challenges Catalog (Single-Surface Flat Cards, NO BOX INSIDE BOX) */}
        <section id="challenges" className="border-t border-border px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                  Available Challenges
                </span>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Benchmark Architectural Problems
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select a challenge to launch the dual-pane requirements and canvas workspace.
                </p>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {PROBLEMS.length} challenges ready
              </span>
            </div>

            {/* Problems Grid - Single clean surface, no boxes inside boxes */}
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {PROBLEMS.map((problem) => (
                <Link
                  key={problem.id}
                  href={\`/problem/\${problem.id}\`}
                  className="group relative flex flex-col justify-between rounded-xl border border-border p-7 transition hover:border-foreground/30 hover:bg-muted/30"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-muted-foreground">
                        {problem.requirements.length} Requirements
                      </span>
                      <span className="text-primary font-semibold">
                        {problem.id === 'parking-lot' ? 'Intermediate' : 'Advanced'}
                      </span>
                    </div>

                    <h3 className="mt-3 text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {problem.title}
                    </h3>

                    <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                      {problem.description}
                    </p>

                    <div className="mt-6 text-[11px] font-mono text-muted-foreground">
                      <span>Evaluates: </span>
                      <span className="text-foreground/80 font-sans font-medium">
                        {problem.rubric.map(r => r.id.replace('req-', '').replace(/-/g, ' ')).join(' · ')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-primary">
                    <span>Open Practice Workspace</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <Image src="/logo.png" alt="Takshaka" width={18} height={18} className="h-4 w-auto object-contain" />
            <span>Takshaka</span>
            <span className="text-muted-foreground font-normal">— Low-Level Design Practice Platform</span>
          </div>
          <div>
            <span>Architectural Modeling & AI Evaluation. Zero Setup Required.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
`;

fs.writeFileSync(path.resolve("src/app/page.tsx"), pageCode, "utf-8");
console.log("src/app/page.tsx updated successfully!");
