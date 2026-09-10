# Takshaka — Low-Level Design (LLD) Practice Platform
# README + AI Usage Documentation

> **Live Working Prototype**: [https://takshaka-platform.vercel.app/](https://takshaka-platform.vercel.app/)  
> **GitHub Repository**: [https://github.com/karambitbarrage15/Takshaka.git](https://github.com/karambitbarrage15/Takshaka.git)  
> **Deliverable**: Combined README + AI_USAGE.md (Submission Field 4)

---

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

### Test Coverage Summary (83 Automated Tests across 8 Suites)
- **Domain Invariants (`src/tests/domain/Attempt.test.ts` — 19 tests)**:
  - Attempt creation defaults to `DRAFT`.
  - State machine transitions (`DRAFT` $\rightarrow$ `EVALUATING` $\rightarrow$ `COMPLETED` / `FAILED`).
  - Guards against invalid direct transitions (`DRAFT` $\rightarrow$ `COMPLETED`, `FAILED` $\rightarrow$ `COMPLETED`).
  - Duplicate evaluation protection (`EVALUATING` $\rightarrow$ `EVALUATING`).
  - Immutable completed attempts (cannot re-evaluate, fail, or update submission).
  - Deep clone isolation on retry (mutating new draft does not corrupt original completed attempt).
- **Repository Operations (`src/tests/infrastructure/LocalStorageAttemptRepository.test.ts` — 10 tests)**:
  - Authentic domain rehydration with behaviors and dates preserved.
  - Safe handling of missing, corrupt, or non-JSON storage strings.
  - Rehydration sanitization dropping corrupted records with invalid enum types (`NodeType`).
  - Browser storage full (`QuotaExceededError` on `setItem`) swallowed gracefully.
  - Chronological sort order preservation (`createdAt` ascending).
  - Server-Side Rendering (SSR) safety (`window === undefined` no-op).
- **Application Services (`src/tests/application/PracticeSessionService.test.ts` — 15 tests)**:
  - Full practice loop orchestration (`startAttempt`, `saveDraft`, `submitAttempt`, `completeAttempt`, `failAttempt`, `retryAttempt`).
  - Resubmission of failed attempts resetting error states.
  - Multi-attempt problem isolation and draft modification persistence.
  - Guarding against nonexistent attempt IDs (`AttemptNotFoundError`).
- **Canvas Mapper (`src/tests/components/canvas/mapper.test.ts` — 6 tests)**:
  - Bidirectional serialization between React Flow graph nodes/edges and domain `Submission`.
  - Graceful handling of empty, null, or undefined submission content.
  - Safe defaulting for missing node properties (`name`, `type`, `properties`, `methods`).
- **AI Evaluator (`src/tests/infrastructure/AIEvaluator.test.ts` — 11 tests)**:
  - Rubric criteria, problem description, and requirements injected into prompt.
  - Structured output parsing, markdown fence stripping, and JSON schema validation.
  - Rejection of out-of-bounds scores ($<0$ or $>100$) and missing required fields.
  - Confidence string defaulting to `"HIGH"` for resilient parsing.
  - Text-based submission format support.
- **API Route Handler (`src/tests/infrastructure/EvaluateRoute.test.ts` — 9 tests)**:
  - Route validation: rejects missing problem ID, missing submission, or unsupported format (HTTP 400).
  - Empty canvas protection (rejects 0 nodes with HTTP 400).
  - Unknown problem handling (HTTP 404).
  - Unparseable request stream handling (HTTP 500).
  - Successful evaluation end-to-end for both `parking-lot` and `elevator-system` problems.
- **UI Components (`ScorecardModal.test.ts` — 7 tests, `HistoryDrawer.test.ts` — 6 tests)**:
  - Modal open/close lifecycles, pass/fail threshold banners ($\ge 75$), itemized rubric evidence rendering.
  - Drawer open/close lifecycles, chronological list ordering, active attempt indicator, and empty history notices.


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



---

# AI Usage & Evaluation Architecture

This document describes the role, boundaries, and implementation of AI evaluation within the LLD Practice Platform.

---

## 1. AI Providers Supported

The evaluation backend is built to support **Google Gemini** (`gemini-1.5-flash`) and **OpenAI** (`gpt-4o-mini`) interchangeably via server-side environment variables:

- `GEMINI_API_KEY` (preferred) or `GOOGLE_API_KEY`
- `OPENAI_API_KEY` (fallback / alternate)

The platform evaluates purely on the server inside `src/infrastructure/AIEvaluator.ts` via the `POST /api/evaluate` route handler. **No API keys or AI vendor SDKs are ever sent to or loaded in the client browser.**

---

## 2. Information Sent to the Model

For every evaluation request, the model receives a tightly controlled architectural prompt containing:

1. **Problem Context**:
   - Problem title (e.g., *Design a Parking Lot*)
   - Problem description
   - Explicit functional requirements
2. **Authoritative Evaluation Rubric**:
   - The predefined rubric criteria defined in `src/data/problems.ts` (e.g., *Polymorphic Vehicle hierarchy*, *FeeStrategy decoupling*).
   - **Instruction**: The model is strictly instructed that this rubric is authoritative and it must NOT invent new criteria.
3. **Candidate Architectural Submission**:
   - Class and interface definitions extracted from the React Flow canvas (Class name, type: `class`/`interface`/`abstract class`/`enum`, properties list, methods list).
   - Directed relationships between classes (e.g., `ParkingLot --[manages]--> ParkingFloor`).

---

## 3. What the Model Evaluates

The prompt explicitly assesses **Architectural Design and Domain Modeling**:
- **Requirement Understanding**: Does the architecture address all constraints?
- **Class Responsibilities**: Are classes focused (Single Responsibility Principle)?
- **Abstraction Quality & Encapsulation**: Are internal details properly hidden?
- **Coupling & Cohesion**: Are components modular and decoupled?
- **Extensibility & Patterns**: Can the design scale without modifying existing classes (Open/Closed Principle)?

---

## 4. Structured Output Strategy

To eliminate generic "chatbot" responses, the model is strictly constrained to output a single raw JSON object matching the domain `Feedback` model:

```json
{
  "overallScore": 85,
  "rubricEvaluations": [
    {
      "criterion": "Fee calculation is decoupled behind a strategy interface.",
      "score": 4,
      "evidence": "Candidate defined a FeeStrategy interface and passed it into ParkingLot.",
      "concern": "Fee calculation implementation hardcodes the hourly rate.",
      "suggestion": "Inject rate configuration into the constructor of HourlyFeeStrategy.",
      "confidence": "HIGH"
    }
  ],
  "strengths": [
    "Good use of polymorphism for Vehicle types."
  ],
  "improvements": [
    "Decouple spot allocation into a dedicated SpotManager."
  ]
}
```

The server parses and validates this JSON before accepting it. If required fields (`overallScore`, `rubricEvaluations`, `evidence`) are missing or malformed, the server throws an error instead of returning partial or fake feedback.

---

## 5. Failure & Error Handling

- **Missing or Invalid Input**: The `/api/evaluate` route returns HTTP 400 with a descriptive error (e.g., attempting to submit an empty canvas).
- **Unknown Problem**: Returns HTTP 404.
- **Provider Outage / Quota Exceeded**: Catches upstream API errors and returns HTTP 500 without crashing the server.
- **State Machine Integration**: On failure, the client application marks the attempt as `FAILED` and restores canvas interactivity so the candidate can retry.

---

## 6. What the AI Does NOT Do

- **No Code Compilation**: The AI does NOT test if code compiles, executes, or passes unit tests. LLD interviews evaluate architectural thinking, not compiler mechanics.
- **No Freeform Chat**: The AI is not a conversational chatbot. It is an automated evaluation pipeline returning structured scorecards.
- **No Rubric Hallucination**: The AI cannot grade candidates against hidden or invented expectations; it evaluates strictly against the problem's published rubric.
- **No Model Decisions in Domain**: The `src/domain/` layer contains zero references to AI models, preserving full architectural independence.

---

## 7. Limitations

- **Subjectivity**: LLM evaluation of architectural trade-offs can vary slightly across temperatures; we set `temperature: 0.2` to ensure consistent, deterministic scoring.
- **Context Window**: Highly complex designs with dozens of classes require careful serialization. For 2-day MVP problems (5–10 classes), context usage is minimal (~1,500 tokens).

---

## 8. Verification & Offline Testing Strategy

To guarantee evaluation pipeline reliability without incurring recurring API costs or network flakiness during CI/CD:
- **Dependency Inversion (`LlmClient`)**: The `AIEvaluator` constructor accepts an optional `LlmClient` function (`(prompt: string) => Promise<string>`).
- **100% Offline Test Coverage**: All 20 AI and Route evaluation unit tests in `AIEvaluator.test.ts` and `EvaluateRoute.test.ts` execute against deterministic mock LLM clients.
- **Tested Edge Cases**:
  - Valid structured JSON scorecard extraction.
  - Markdown code-fence stripping (````json ... ````).
  - Malformed non-JSON response rejection.
  - Missing field (`overallScore`, `rubricEvaluations`, `criterion`, `evidence`) rejection.
  - Out-of-bounds score rejection ($< 0$ or $> 100$).
  - Graceful fallback for unrecognized confidence strings to `"HIGH"`.
  - Upstream provider 429 quota / 500 outage rejection.
  - Multi-problem prompt composition (`parking-lot` and `elevator-system`).

