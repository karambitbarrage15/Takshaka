# Phase 6: Domain Design & Implementation Plan

This document outlines the Domain Model, Application Architecture, API contracts, and implementation plan for the LLD Practice Platform MVP.

## 1. Assignment Alignment Check
- **Problem understanding & research**: Handled in Phases 1-3. Addressed by framing the problem around architectural feedback rather than syntax checks.
- **Product thinking / creativity**: Leveraging a strictly constrained React Flow canvas (drawing boxes/lines) to mimic an actual whiteboard interview.
- **LLD / domain design**: Defined cleanly via aggregate roots (`Attempt`), bounded contexts, and dependency inversion (`Evaluator`, `AttemptRepository`).
- **Evaluation & feedback approach**: A fixed rubric fed into an LLM, generating heavily structured, evidence-backed JSON.
- **Extensibility & engineering judgement**: Specifically addressing Change Test A (Submission format) and Change Test B (Evaluator swapping) through clean interfaces.
- **Implementation quality / Testing**: Phased implementation prioritizes core domain logic and tests *before* the UI.
- **AI usage**: Segregating AI exclusively to a stateless evaluator behind an interface, rather than bleeding it into the domain state.

---

## 2. Core Domain Model

### Entities & Value Objects

- **`Problem` (Entity)**
  - **Responsibility**: Represents the static LLD challenge.
  - **Owns**: Title, description, requirements, constraints, and the `Rubric` (array of evaluation criteria).
  - **Why it exists**: To decouple the UI from hardcoded text and drive the evaluation process.
  - **Likely to change**: We might add more problems or tweak rubrics.

- **`Attempt` (Aggregate Root)**
  - **Responsibility**: Tracks the complete lifecycle of a user practicing a problem.
  - **Owns**: `id`, `problemId`, `status` (DRAFT, EVALUATING, COMPLETED, FAILED), `Submission` (value object), `Feedback` (value object), and timestamps.
  - **Why it exists**: It serves as the single source of truth for a practice loop.
  - **Should NOT own**: Should not own persistence logic or how the evaluation is physically performed.

- **`Submission` (Value Object)**
  - **Responsibility**: Represents the learner's design solution payload. It is strictly an immutable submission data model.
  - **Owns**: `format` (enum/string) and `content` (the serialized graph/text).
  - **Why it exists**: Encapsulates the output of the React Flow canvas to abstract away the UI layer from the evaluation layer (Change Test A). It must NOT contain any React or UI behavior.

- **`Feedback` (Value Object)**
  - **Responsibility**: Represents the graded outcome.
  - **Owns**: Overall score, array of `RubricEvaluation`s, strengths, and improvements.

### Interfaces (Ports)

- **`Evaluator`**
  - **Responsibility**: Takes a `Problem` and a `Submission` and returns a `Promise<Feedback>`.
  - **Why it exists**: Hides the AI from the domain (Change Test B).

- **`AttemptRepository`**
  - **Responsibility**: Persists and retrieves `Attempt` aggregates.
  - **Why it exists**: Hides `localStorage` from the application layer.

---

## 3. Attempt State Machine

The state machine is encapsulated within the `Attempt` aggregate.

**States**: `DRAFT` → `EVALUATING` → `COMPLETED` / `FAILED`

**Valid Transitions**:
- `DRAFT` → `EVALUATING`: User clicks Submit. Guard: Must have a valid submission payload.
- `EVALUATING` → `COMPLETED`: API successfully returns Feedback.
- `EVALUATING` → `FAILED`: API times out, returns invalid JSON, or network drops.
- `FAILED` → `EVALUATING`: FAILED attempts may be resubmitted on the same Attempt (e.g. if the network drops).

**Invalid Transitions (Guarded)**:
- `DRAFT` → `COMPLETED`
- `COMPLETED` → `EVALUATING`: `COMPLETED` attempts are strictly immutable.
- `EVALUATING` → `EVALUATING`: Prevents duplicate submissions (debouncing).

**On Retry ("Try Again")**:
- "Try Again" from a `COMPLETED` attempt creates a NEW `DRAFT` Attempt with the previous submission cloned. It does not alter the original immutable `COMPLETED` attempt.

---

## 4. React Flow Submission Model

Scope is strictly limited:
- **Node**: 1 custom type `ClassNode`. Contains `name` (text), `properties` (textarea), `methods` (textarea).
- **Edge**: Standard floating edge. No custom labels required for MVP.
- **Serialization**: `reactFlowInstance.toObject()` which outputs `{ nodes: Node[], edges: Edge[] }`.

---

## 5. Change Test A: Evolving Submission Formats

**Today**: `Submission` looks like:
`{ type: 'REACT_FLOW', content: { nodes: [...], edges: [...] } }`

**Later**: If we add text-based design, we add:
`{ type: 'TEXT', content: "class ParkingLot { ... }" }`

**Domain impact**: The `Attempt` and `AttemptRepository` do not change. The `Evaluator` implementation uses a Strategy or a `switch` on `submission.type` to format the prompt differently for the LLM. The practice flow, UI state machine, and persistence remain entirely untouched.

---

## 6. Change Test B: The Evaluation Boundary

**Interface**:
```typescript
interface Evaluator {
  evaluate(problem: Problem, submission: Submission): Promise<Feedback>;
}
```

**Implementation**: `AIEvaluator implements Evaluator`
If we later want a human reviewer, we implement `HumanEvaluator`, which creates a database record for a human to grade, suspending the `Attempt` state until reviewed. The core domain does not care *how* the `Feedback` object is created, only that it is returned.

---

## 7. AI Evaluation Contract

The AI acts strictly as a data-transformation function.

**Shape expected from AI (JSON Schema enforced):**
```json
{
  "overall_score": 85,
  "rubric_evaluations": [
    {
      "criterion": "Fee calculation is decoupled.",
      "score": 4, 
      "evidence": "You used a FeeStrategy interface.",
      "concern": "Rate is hardcoded in the implementation.",
      "suggestion": "Pass configuration via constructor.",
      "confidence": "HIGH"
    }
  ],
  "strengths": ["Good polymorphism"],
  "improvements": ["Tighten encapsulation"]
}
```

**Handling failures**:
- The API Route parses the LLM output with Zod.
- If Zod throws (invalid shape), the API returns HTTP 500.
- The UI catches the 500 and transitions `Attempt` to `FAILED`.

---

## 8. Persistence (LocalStorage)

- **Key**: `lld-arena-attempts`
- **Value**: A JSON object/map `Record<string, Attempt>`.
- **Drafts**: A debounce hook updates `localStorage` 1 second after the user edits the React Flow canvas (saving `Attempt` with status `DRAFT`).
- **History**: Reconstructed by doing `Object.values(attempts).filter(a => a.problemId === 'parking-lot')`.
- **Migrations**: The repository wraps `JSON.parse` in a try-catch. If the shape is invalid or an old schema, it resets gracefully without crashing.

---

## 9. Application Architecture

**Strict Domain Boundary Rule**:
- The `domain/` directory must have ZERO dependencies on React, Next.js, React Flow, localStorage, or OpenAI/Gemini.
- AI provider implementations (like OpenAI/Gemini clients) belong completely outside the domain in the infrastructure layer.

**Simple Monolith Structure**:
```text
src/
 ├── domain/             # Core models, interfaces, state machine (ZERO external dependencies)
 ├── infrastructure/     # LocalStorageAttemptRepo, OpenAI/Gemini API clients
 ├── app/                # Next.js UI pages & /api routes
 ├── components/         # React UI (SplitPane, Scorecard)
 │    └── canvas/        # React Flow (ClassNode, Workspace)
 └── tests/              # Jest/Vitest for domain & state machine
```
- **UI Layer**: Pages, React Flow Canvas.
- **Application Layer**: API Route, React Hooks managing state transitions.
- **Domain Layer**: `Attempt`, `Submission`, `Feedback`, `Evaluator` interfaces.
- **Infrastructure Layer**: API client for LLM, `localStorage` wrappers.

---

## 10. API Contract (POST /api/evaluate)

**Request**:
```json
{
  "problemId": "parking-lot",
  "submission": { "type": "REACT_FLOW", "content": { "nodes": [], "edges": [] } }
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "feedback": { "overall_score": 85, "rubric_evaluations": [...] }
}
```

**Response (Validation / Evaluator Failure - 400/500)**:
```json
{
  "success": false,
  "error": "Failed to parse AI response. Try submitting again."
}
```

---

## 11. Testing Strategy

We will write unit tests for the **domain layer** before touching the UI.
1. `Attempt` state transitions: Assert `DRAFT` → `COMPLETED` throws an error.
2. `Attempt` immutability: Assert that a `COMPLETED` Attempt cannot be modified or evaluated again.
3. `Attempt` duplicate submission: Assert calling `.submit()` while `EVALUATING` fails.
4. `Attempt` retry: Assert cloning an attempt correctly resets status and generates a new ID.
5. Evaluator API: Assert Zod correctly rejects malformed AI JSON.

---

## 12. Explicitly Removed (Anti-Overengineering)

- No PostgreSQL, Prisma, Auth, or user tables.
- No auto-layout or snapping libraries for React Flow.
- No `redis` caching for AI responses (if they submit again, we re-evaluate).
- No message queues for processing evaluation (we hold the HTTP connection open).
- No complex UML elements (Inheritance vs Composition arrows). A single undirected/directed edge is sufficient.

---

## 13. Implementation Sequence

- **Phase 6A — Project Setup**: Initialize Next.js, Tailwind, React Flow, Zod, Vitest.
- **Phase 6B — Domain Models**: Create interfaces, `Attempt` class, and state machine.
- **Phase 6C — Repository**: Create `LocalStorageAttemptRepository`.
- **Phase 6D — Tests**: Write tests for the domain and repository.
- **Phase 6E — Problems**: Define static `problems.ts` and rubrics.
- **Phase 6F — API Endpoint**: Build `/api/evaluate` and test with a mocked LLM / real LLM.
- **Phase 6G — React Flow UI**: Build `ClassNode` and Canvas workspace.
- **Phase 6H — Submission Wiring**: Connect Canvas state -> LocalStorage -> API.
- **Phase 6I — Scorecard UI**: Build the structured feedback modal.
- **Phase 6J — History/Retry**: Build the sidebar and clone-attempt functionality.
- **Phase 6K — Final Polish**: README + `AI_USAGE.md`.

---

## 14. Data Flow Diagram
```text
[React Flow Canvas]
       │
(user clicks Submit)
       │
       ▼
[Attempt State -> EVALUATING] ──(autosave)──> [LocalStorage]
       │
       ▼
[POST /api/evaluate] 
       │ payload: { problemId, submission }
       ▼
[Next.js API Route] ──> [Evaluator Interface]
       │
       ▼
[AIEvaluator] ──(prompt containing Rubric + JSON Graph)──> [LLM API]
       │
       ▼
[Zod Validator] <──(validates JSON response)
       │
       ▼
[API returns Feedback]
       │
       ▼
[Attempt State -> COMPLETED] ──(save Feedback)──> [LocalStorage]
       │
       ▼
[Render Scorecard Modal]
```
