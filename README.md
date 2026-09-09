# LLD Practice Platform

A focused, zero-setup Low-Level Design (LLD) practice and automated evaluation platform. Learners model object-oriented software architectures visually on a lightweight canvas and receive immediate, rubric-driven, structured AI evaluations with actionable feedback.

---

## 1. Project Overview & Value Proposition

### The Problem
Preparing for Low-Level Design (LLD) and machine-coding interviews presents a severe feedback gap:
- **Compiler/sandbox platforms** (e.g., LeetCode, traditional judges) only verify whether code compiles or tests pass, ignoring architectural decisions, encapsulation, coupling, and design patterns.
- **Diagramming tools** (e.g., generic UML editors, LLDCanvas) allow drawing but provide no automated grading or objective evaluation.
- **Mock interviews** (e.g., human mentors, HelloInterview) provide architectural feedback but are expensive, scheduling-constrained, or hidden behind paywalls and login walls.

### The Solution
The LLD Practice Platform bridges this gap by mimicking an in-person technical whiteboard interview:
1. Learners review real-world design requirements and constraints.
2. Learners architect their classes, interfaces, methods, properties, and relationships visually.
3. An automated AI evaluation engine grades the design strictly against an authoritative, multi-criteria rubric.
4. Learners receive a structured scorecard (overall score, strengths, rubric-by-rubric scores with evidence, concerns, and suggestions) and can iterate immediately.

---

## 2. The Core Practice Loop

The platform enforces a rapid, iterative learning cycle:

```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ 1. Choose       │       │ 2. Design       │       │ 3. Submit       │
│ Select problem  │ ────► │ Model classes & │ ────► │ Snapshot graph  │
│ from catalog    │       │ relationships   │       │ to /api/evaluate│
└─────────────────┘       └─────────────────┘       └────────┬────────┘
                                                             │
┌─────────────────┐       ┌─────────────────┐                │
│ 6. Try Again    │       │ 5. Review       │       ┌────────▼────────┐
│ Clone graph to  │ ◄──── │ Inspect rubric  │ ◄──── │ 4. Feedback     │
│ new DRAFT       │       │ evidence & tips │       │ Receive score & │
└─────────────────┘       └─────────────────┘       │ scorecard modal │
                                                    └─────────────────┘
```

1. **Choose**: Select an LLD problem (e.g., *Design a Parking Lot* or *Design an Elevator System*) with explicit functional requirements and constraints.
2. **Design**: In the visual canvas, add class, interface, abstract class, or enum nodes, specify fields and methods, and connect relationships.
3. **Submit**: Click "Submit for Review". The active attempt transitions from `DRAFT` to `EVALUATING`, locking the canvas to prevent race conditions.
4. **Feedback**: The server evaluates the architecture against the problem's rubric using Google Gemini or OpenAI, transitioning the attempt to `COMPLETED`.
5. **Review**: The Scorecard automatically opens, presenting the overall score (0–100), key strengths, and an itemized breakdown for each rubric criterion with concrete evidence cited directly from the candidate's design.
6. **Try Again**: Click "Try Again" to clone the current canvas into a new `DRAFT` attempt (preserving prior work while keeping the completed attempt immutable) or click "+ Start Blank Attempt" to start fresh.

---

## 3. Architecture & Hexagonal (Ports & Adapters) Design

The platform strictly follows **Clean Architecture** and **Ports & Adapters (Hexagonal)** principles. The domain layer has **zero external dependencies** on UI libraries, frameworks, database drivers, or AI SDKs.

```text
                             ┌───────────────────────────────────┐
                             │       UI / Presentation Layer     │
                             │  (Next.js Pages, React Flow, UI)  │
                             └─────────────────┬─────────────────┘
                                               │
                                               ▼
                             ┌───────────────────────────────────┐
                             │        Application Layer          │
                             │     (PracticeSessionService)      │
                             └────────┬─────────────────┬────────┘
                                      │                 │
             ┌────────────────────────┘                 └────────────────────────┐
             ▼                                                                   ▼
┌───────────────────────────┐                                       ┌───────────────────────────┐
│     Secondary Port        │                                       │      Secondary Port       │
│    AttemptRepository      │                                       │         Evaluator         │
└────────────▲──────────────┘                                       └────────────▲──────────────┘
             │                                                                   │
┌────────────┴──────────────┐                                       ┌────────────┴──────────────┐
│  Infrastructure Adapter   │                                       │  Infrastructure Adapter   │
│LocalStorageAttemptRepo    │                                       │    AIEvaluator (Gemini)   │
└───────────────────────────┘                                       │    AIEvaluator (OpenAI)   │
                                                                    └───────────────────────────┘
```

### Layer Responsibilities & Boundaries

- **Domain Layer (`src/domain/`)**:
  - `Attempt`: Aggregate root managing the attempt lifecycle and enforcing state transitions.
  - `Submission`: Value object holding candidate design data (`format`, `content`, `submittedAt`).
  - `Feedback`: Value object holding evaluation results (`overallScore`, `rubricEvaluations`, `strengths`, `improvements`).
  - `Problem`: Domain entity containing problem requirements, hints, difficulty, and rubrics.
  - `Evaluator`: Outbound port interface (`evaluate(problem, submission): Promise<Feedback>`).
  - `AttemptRepository`: Outbound port interface (`save`, `getById`, `listByProblemId`).
  - `Errors`: Domain error definitions (`DomainError`, `IllegalStateError`, `ValidationError`).
  - *Dependency Rule*: Imports standard TypeScript primitives only. No React, Next.js, `@xyflow`, or AI vendor packages.

- **Application Layer (`src/application/`)**:
  - `PracticeSessionService`: Orchestrates use cases (`startAttempt`, `saveDraft`, `submitAttempt`, `retryAttempt`, `getAttemptHistory`).
  - Enforces aggregate invariants across asynchronous workflows and repository interactions.

- **Infrastructure Layer (`src/infrastructure/`)**:
  - `LocalStorageAttemptRepository`: Implements `AttemptRepository` using browser `localStorage` with SSR detection, JSON schema validation, and graceful fallback.
  - `AIEvaluator`: Implements `Evaluator` using server-side Gemini 1.5 Flash or OpenAI GPT-4o-mini with prompt construction, rubric injection, and JSON scorecard extraction.

- **UI / Presentation Layer (`src/components/`, `src/app/`)**:
  - React Flow Canvas with custom `ClassNode` and `CanvasToolbar`.
  - `src/components/canvas/mapper.ts`: Anti-Corruption Layer converting React Flow graph objects to and from domain `Submission` models.
  - `ScorecardModal` for presenting rubric evaluations and evidence.
  - `HistoryDrawer` for chronologically ordered attempts, inspection of completed attempts, and blank/retry actions.

---

## 4. Change Tests: Validating Extensibility

The architecture was intentionally designed to pass two foundational change tests without refactoring domain models or persistence layers:

### Change Test A: Evolving Submission Formats
- **Scenario**: Adding support for raw code submissions (e.g., Java/TypeScript code files) or text-based design notations alongside visual diagrams.
- **Architectural Proof**:
  - The domain `Submission` model is an abstract value object parameterized by `format: SubmissionFormat` and `content: unknown`.
  - The React Flow workspace connects to the domain strictly through `src/components/canvas/mapper.ts` (the adapter).
  - To support code submissions, we simply add a new adapter (e.g., `MonacoEditorMapper`) producing `{ format: 'CODE_JAVA', content: rawCodeString }`.
  - The domain `Attempt` aggregate, state machine, repository, and session service remain **100% unchanged**.

### Change Test B: Swapping the Evaluator Implementation
- **Scenario**: Replacing LLM evaluation with deterministic static analysis, human mentor reviews, or mock offline evaluators for testing.
- **Architectural Proof**:
  - `Evaluator` is a pure TypeScript interface in `src/domain/Evaluator.ts`.
  - `PracticeSessionService` and `/api/evaluate` depend exclusively on the `Evaluator` interface, never on concrete vendor implementations.
  - In our test suite, `MockEvaluator` is injected with zero modification to production code.
  - To implement human review or rule-based linters, create `HumanReviewEvaluator implements Evaluator` or `RuleBasedEvaluator implements Evaluator` and bind it at runtime. The domain aggregate and use cases require **zero changes**.

---

## 5. Domain State Machine

The `Attempt` aggregate root encapsulates a strict state machine:

```text
             ┌────────────────────────┐
             │         DRAFT          │
             └───────────┬────────────┘
                         │ .submit()
                         ▼
             ┌────────────────────────┐
             │       EVALUATING       │
             └───────┬────────┬───────┘
                     │        │
   .complete(feedback)│        │ .fail(reason)
                     │        │
                     ▼        ▼
       ┌────────────────┐  ┌────────────────┐
       │   COMPLETED    │  │     FAILED     │
       └────────────────┘  └───────┬────────┘
                                   │ .submit() (retry submission)
                                   ▼
                             ┌────────────┐
                             │ EVALUATING │
                             └────────────┘
```

- **Guards & Invariants**:
  - Direct transition `DRAFT` $\rightarrow$ `COMPLETED` is blocked (`IllegalStateError`).
  - `COMPLETED` attempts are **strictly immutable**. Any call to `.submit()`, `.updateContent()`, or `.complete()` on a completed attempt throws an error.
  - Calling `.submit()` while already in `EVALUATING` throws `IllegalStateError` (prevents double-submission).
  - `FAILED` attempts allow resubmission on the same attempt to recover from network drops or provider timeouts.
  - **Retry Semantics**: "Try Again" on a completed attempt creates a **new `DRAFT` attempt** with cloned content. The original completed attempt is preserved immutably in history.

---

## 6. React Flow Canvas & Mapper Architecture

To keep the visual design experience intuitive while strictly respecting the 2-day scope:
- **Node Structure**: Exactly one custom node type (`ClassNode`) rendering:
  - Class Name input
  - Class Type selector (`class`, `interface`, `abstract class`, `enum`)
  - Properties textarea (attributes and fields)
  - Methods textarea (functions and signatures)
  - Connection handles (Top, Bottom, Left, Right)
- **Edge Relationships**: Directed connection lines representing interactions, dependencies, inheritance, or composition.
- **Anti-Corruption Layer (`src/components/canvas/mapper.ts`)**:
  - `flowToSubmission(nodes, edges)`: Sanitizes and serializes React Flow state into a clean domain `Submission` payload.
  - `submissionToFlow(submission)`: Reconstructs React Flow nodes and edges from stored domain submissions, providing safe defaults for empty or newly created attempts.

---

## 7. AI Evaluation Pipeline

- **Stateless Server Pipeline**: Evaluation is performed exclusively on the server (`/api/evaluate`) via `src/infrastructure/AIEvaluator.ts`.
- **Supported Providers**:
  - Google Gemini (`gemini-1.5-flash`) via `GEMINI_API_KEY` or `GOOGLE_API_KEY`
  - OpenAI (`gpt-4o-mini`) via `OPENAI_API_KEY`
- **Zero Hallucination Rubric**:
  - The model prompt injects the problem's predefined rubric criteria directly from `src/data/problems.ts`.
  - The model is instructed to evaluate each rubric criterion individually and return concrete evidence, concerns, suggestions, and a score (1–5).
  - Outputs are validated against a strict JSON schema before being returned as domain `Feedback`.
- **Security**: No API keys or vendor client SDKs are bundled into client-facing JavaScript.

---

## 8. Persistence Strategy

- **Browser `localStorage`**: Stored under the key `lld_practice_attempts`.
- **Zero Database Overhead**: Avoids complex external database setups, connection pooling, and credential requirements for a standalone practice tool.
- **Resilience**:
  - Automatic detection of server-side rendering (SSR) environments.
  - Robust error trapping for `QuotaExceededError` and malformed local JSON.
  - Automatic schema rehydration to domain `Attempt`, `Submission`, and `Feedback` instances.

---

## 9. Deliverables Index

Authoritative specification, design, and analysis documents:

| Document | Description |
|---|---|
| [`docs/research-notes.md`](docs/research-notes.md) | In-depth competitive analysis of LLDCanvas, HelloInterview, and LLD Arena with feature matrix and MVP trade-offs. |
| [`docs/domain-design.md`](docs/domain-design.md) | Domain models, entity boundaries, aggregate roots, ports & adapters, state transitions, and API contracts. |
| [`docs/mvp-spec.md`](docs/mvp-spec.md) | 2-day MVP specification, scope definitions, feature priority, risks, and mitigations. |
| [`docs/user-flow.md`](docs/user-flow.md) | Complete user journey, screen wireframes, state progression, and interaction design. |
| [`AI_USAGE.md`](AI_USAGE.md) | Detailed documentation on prompt engineering, structured JSON outputs, model constraints, and evaluation safety. |

---

## 10. Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Visual Canvas**: [@xyflow/react (React Flow 12)](https://reactflow.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) (strict mode)
- **Testing**: [Vitest 4](https://vitest.dev/)
- **Linting**: ESLint 9

---

## 11. Quickstart & Setup

### Prerequisites
- Node.js 20+ installed
- npm or yarn

### 1. Installation
```bash
git clone <repository-url>
cd lld-practice-platform
npm install
```

### 2. Environment Configuration
Copy the sample environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` to configure your preferred AI provider key:
```env
# Google Gemini (recommended)
GEMINI_API_KEY=your_gemini_api_key_here

# OR OpenAI
# OPENAI_API_KEY=your_openai_api_key_here
```

*(Note: The application will launch and allow visual modeling without an API key. An API key is only required when submitting a design for automated AI evaluation).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 12. Verification & Testing

The project includes an extensive automated test suite covering domain entities, state machines, application services, persistence adapters, and UI mappers.

```bash
# Run unit & integration tests
npx vitest run

# Run TypeScript type check
npx tsc --noEmit

# Run linter
npm run lint

# Run production build
npm run build
```

### Test Coverage Summary
- **Domain Invariants**: Attempt state transitions, immutability of completed attempts, invalid submissions.
- **Repository Operations**: Save, retrieve, list, corrupt data recovery, quota handling.
- **Application Services**: PracticeSessionService orchestration, draft debouncing, retry cloning.
- **React Flow Mapper**: Bidirectional conversion between React Flow graphs and domain submissions.
- **API & Evaluator**: Route handling, payload validation, rubric adherence, AI response parsing.

---

## 13. Scope Boundaries & Intentional Trade-offs

To deliver an exceptional, production-grade core loop within the 2-day limit, several features were intentionally scoped out:

1. **Local-First Persistence (`localStorage`) vs Remote Database**:
   - *Rationale*: Avoids complex user authentication, connection pools, and database hosting while giving the learner zero-friction, instantaneous state saves and history tracking.
2. **Constrained Node System vs Full UML Specification**:
   - *Rationale*: Full UML (composition diamonds, dependency dashed lines, aggregation hollow diamonds) introduces steep UI friction during quick whiteboarding. One versatile `ClassNode` and directed edges provide 95% of the design expressiveness with 5% of the interaction overhead.
3. **Architectural Evaluation vs Code Compilation**:
   - *Rationale*: Machine coding interviews fail candidates on structural flaws, tight coupling, and SRP violations, not missing semicolons. Evaluating architecture via structured LLM rubrics provides far higher educational signal than sandboxed `javac` execution.
4. **Desktop-First Visual Workspace**:
   - *Rationale*: Multi-class visual architecture diagrams require adequate screen real estate. Mobile viewports display a clean responsive notification recommending a desktop or tablet screen.

