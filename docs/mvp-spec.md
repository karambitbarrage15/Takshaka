# LLD Practice Platform: MVP Specification

This document translates the competitor research and assignment requirements into a focused, achievable 2-day MVP.

## 1. PRODUCT PROBLEM
- **The exact learner problem**: Learners practicing Low-Level Design (LLD) have no way to validate whether their architectural decisions (abstractions, responsibilities, coupling) are actually good without paying for expensive human mock interviews. Existing platforms either only test if code compiles (missing the design aspect) or lack automated feedback entirely.
- **Target learner**: Mid-level software engineers preparing for FAANG-style machine coding or system design interviews.
- **Why existing approaches are insufficient**: LLDCanvas offers a great sandbox but zero automated architectural feedback. HelloInterview has AI feedback but is heavily paywalled and login-gated.
- **Our differentiator**: Immediate, transparent, rubric-based AI architectural feedback focused strictly on domain design, delivered in a frictionless, zero-setup environment.

## 2. MVP SCOPE
We are building the smallest useful product that can be completed in 2 days.

**MUST HAVE:**
- 2 handcrafted LLD problems.
- A split-pane workspace to read the problem and write a solution.
- A plain-text/pseudo-code submission model.
- A state machine tracking attempt status (Draft → Evaluating → Completed/Failed).
- An AI evaluator that grades the submission against a strict rubric.
- A structured scorecard UI to display the feedback.
- Local storage persistence to track attempt history and drafts.

**NICE TO HAVE:**
- Monaco Editor integration for syntax highlighting.
- Markdown rendering for problem descriptions.

**OUT OF SCOPE:**
- User authentication / accounts.
- A relational database (Postgres, MongoDB, etc.).
- Visual drag-and-drop UML editors (React Flow).
- Actual remote code execution / sandboxing (too risky/heavy for 2 days).
- Distributed systems infrastructure (Kubernetes, queues).

## 3. REACT FLOW DECISION
- **Evaluation**: The user explicitly prioritized evaluating whether a *lightweight* visual LLD canvas makes the product substantially better. For Low-Level Design, the answer is definitively **yes**. Drawing relationships visually aligns much better with how architectural interviews are actually conducted (whiteboarding) compared to typing pseudo-code into a text area.
- **Decision**: **USE React Flow.**
- **Scope Restriction (Keeping it 2-Day Safe)**: We will build exactly **one** custom node type (`ClassNode` containing a title, simple textarea for methods/properties) and **one** standard edge type (for relationships). The serialized React Flow graph (`{ nodes, edges }`) acts perfectly as structured architectural intent.
- **What we will NOT build**: Auto-layout algorithms, real-time multiplayer, visual parsing of code, strict UML syntax enforcement, complex sidebars. The learner drops a node, types a name, and draws a line to another node. Simple, structural, and visually expressive.

## 4. LEARNER USER FLOW
1. **Problem selection**: Learner views a minimal dashboard with 2 LLD problems and clicks one.
2. **Problem details**: Learner reads the requirements, constraints, and hints on the left pane.
3. **Start attempt**: Learner drops a class node onto the canvas. An `Attempt` draft is silently created.
4. **Design solution**: Learner defines their classes visually, edits properties/methods inside nodes, and draws relationship edges.
5. **Submit**: Learner clicks "Submit". The serialized `Submission` graph is saved locally with status `PENDING`.
6. **Evaluation**: The system transitions the attempt to `EVALUATING`. An async API call is made to the AI backend.
7. **Feedback**: The AI returns structured JSON. The system saves the `Feedback` locally and transitions to `COMPLETED`.
8. **Review**: The learner views a scorecard showing strengths, weaknesses, and a grade per rubric criterion.
9. **Retry**: The learner clicks "Try Again", which archives the old attempt and clears the canvas.
10. **Attempt history**: Learner can view past attempts and scores from a sidebar.

## 5. SCREENS
1. **Dashboard (Problem List)**: Minimal list of available problems.
2. **Workspace (Practice Area)**: A split-pane view (Problem Description on the left, React Flow Canvas on the right).
3. **Scorecard (Feedback View)**: Replaces the canvas or opens as a large modal upon completion, displaying the evaluation.
4. **History Sidebar**: A slide-out panel showing past attempts.

## 6. SUBMISSION MODEL
- **What is submitted**: A serialized JSON representation of the React Flow graph.
- **Structure conceptually**:
  ```json
  {
    "format": "REACT_FLOW_GRAPH",
    "content": {
      "nodes": [{ "id": "1", "type": "classNode", "data": { "name": "ParkingLot", "properties": "..." } }],
      "edges": [{ "id": "e1-2", "source": "1", "target": "2", "label": "has-a" }]
    },
    "submittedAt": "2026-09-09T12:00:00Z"
  }
  ```

## 7. EVALUATION MODEL
The platform evaluates designs against a predefined rubric tailored to the specific problem.
*Dimensions evaluated:* Requirement understanding, Class responsibilities, Encapsulation, Extensibility.

**A. Deterministic Checks (The "Did it work?" phase):**
- Content validation (Is the submission > 50 characters?).
- Basic keyword heuristic (Does it contain structural keywords like `class`, `interface`, or `struct`?).
- State transitions (Ensuring an attempt cannot be evaluated twice concurrently).

**B. AI / Judgment-Based Evaluation (The "Is it good?" phase):**
- A prompt strictly evaluates the submitted text against the problem's specific Rubric array. It does not compile the code; it evaluates the *architectural choices* and responsibilities.

## 8. AI FEEDBACK
The AI will be strictly instructed (via JSON Schema or formatting prompts) to return structured data matching the assignment's exact suggestion.
```json
{
  "rubric_evaluations": [
    {
      "criterion": "Fee calculation is decoupled from the ParkingLot.",
      "score": 4,
      "evidence": "You created a FeeStrategy interface.",
      "concern": "The implementation is hardcoded to a specific rate rather than injected.",
      "suggestion": "Pass the rate configuration into the constructor of the concrete strategy.",
      "confidence": "HIGH"
    }
  ],
  "strengths": ["Excellent use of polymorphism for Vehicle types."],
  "overall_score": 85
}
```
*Why this matters:* This prevents generic "Good job" feedback. Every comment is tied to a specific design criterion and backed by evidence from the user's submission.

## 9. ATTEMPT / HISTORY MODEL
- **Definition**: An Attempt represents a single lifecycle of practicing a problem (Draft → Evaluating → Completed).
- **Stored Data**: `id`, `problemId`, `submission`, `status`, `feedback`, `startedAt`, `completedAt`.
- **Storage Decision**: **`localStorage` is 100% sufficient.** The assignment emphasizes "Keeping Scale Practical." Introducing PostgreSQL + Prisma + Authentication adds massive overhead for zero domain-design value. LocalStorage perfectly satisfies the requirement to "see previous attempts" for a 2-day prototype.

## 10. DOMAIN / LLD MODEL
These are the core backend/logic abstractions:
- **`Problem`**: Owns the requirements and the specific `Rubric`. *Unlikely to change.*
- **`Attempt`**: The root aggregate. Manages the state machine (Draft, Evaluating, Completed).
- **`Submission`**: Belongs to an Attempt. Defines the payload format. *Could change to support diagrams later (Change Test A).*
- **`Evaluator` (Interface)**: Service that takes a Submission and a Rubric, returning Feedback. *Allows us to swap AI with deterministic grading later (Change Test B).*
- **`AIEvaluator`**: Implements `Evaluator` using an LLM.
- **`Feedback`**: Structured output of the Evaluation.
- **`AttemptRepository` (Interface)**: Port for persistence. Implemented by `LocalStorageAttemptRepository`.

## 11. ARCHITECTURE
**Tech Stack**: Next.js (App Router) + React + TailwindCSS.
- **Frontend**: A Next.js Client Component application managing UI state and reading/writing to `localStorage` via context.
- **Backend**: A single Next.js API Route (`/api/evaluate`).
- **Boundary**: When the user submits, the frontend saves the state locally, then POSTs the text and rubric to `/api/evaluate`. The API route securely holds the LLM API key, requests the evaluation, and returns the JSON. The frontend saves this JSON to `localStorage`.
- *Note:* We avoid microservices, queues, and distributed systems entirely.

## 12. PROBLEM SET
1. **Design a Parking Lot**
   - *Why*: The classic LLD benchmark. Perfect for testing inheritance and interfaces.
   - *Requirements*: Support 3 vehicle types, multiple spot sizes, and fee calculation.
   - *Rubric*: Spot fit logic uses polymorphism (no `instanceof`), abstract Vehicle class, Fee calculation is extracted to a strategy interface.
2. **Design an Elevator System**
   - *Why*: Tests concurrency mindset and scheduling algorithms.
   - *Requirements*: N floors, external/internal requests, dispatching logic.
   - *Rubric*: Dispatcher is isolated behind a `DispatchStrategy` interface, explicit state enums for elevator direction.

## 13. 2-DAY IMPLEMENTATION PLAN
**Day 1: Domain Models & Core Practice Loop**
- Initialize Next.js, Tailwind, and React Flow.
- Implement the core TypeScript domain models (`Attempt`, `Submission`, `Evaluator`, `Feedback`).
- Implement the `LocalStorageAttemptRepository`.
- Build the Problem List and Workspace UI (Split-pane).
- Build the `ClassNode` React Flow custom node and basic canvas.
- Implement the basic Submission state machine (Draft → PENDING).

**Day 2: AI Evaluation & Feedback UX**
- Implement `/api/evaluate` using OpenAI/Gemini to accept serialized graph JSON and return a strict JSON scorecard.
- Build the `Scorecard` UI to beautifully render the structured JSON.
- Build the History sidebar to load past attempts.
- Write `AI_USAGE.md` and document trade-offs in `README.md`.

## 14. ASSIGNMENT ALIGNMENT
| Requirement | Our MVP Implementation | Weight Focus |
|---|---|---|
| Problem | 2 static LLD problems with clear requirements. | Problem Understanding (15%) |
| Practice | React Flow visual canvas with simple Class nodes. | Product Thinking (15%) |
| Submission | Serialized graph state saved to LocalStorage, passed to API. | Implementation Quality (10%) |
| Feedback | Strict JSON scorecard mapping Rubric → Score → Evidence → Suggestion. | Evaluation Approach (15%) |
| History | Past attempts and feedback loaded from LocalStorage. | Implementation Quality (10%) |
| Core design | Clean separation of `Attempt`, `Submission`, `Evaluator` (Interfaces). | LLD / Domain Design (25%) |
| Tests | Unit tests for `Attempt` state transitions. | Testing (5%) |
| Extensibility | Interfaces allow adding code submissions or rule-evaluators later. | Extensibility (10%) |

## 15. RISKS & MITIGATIONS
- **Risk**: Over-engineering the React Flow Canvas.
  *Mitigation*: Strictly limit node types to ONE (`ClassNode`). Do not implement auto-layout algorithms, snapping rules, or complex drag constraints. Keep the edge type to the default floating edge.
- **Risk**: The LLM hallucinates or returns invalid JSON.
  *Mitigation*: Use the LLM provider's strict structured output features (e.g., OpenAI `response_format: json_object`). Wrap the API parsing in a try-catch that explicitly transitions the attempt to `FAILED` with an error message.
- **Risk**: API Latency freezes the browser.
  *Mitigation*: Save the attempt locally *before* calling the API. Show an async "Evaluating..." UI state without blocking the main thread.

---

### Summary Output
**Recommended MVP:** A frictionless, Next.js web application featuring a lightweight visual React Flow canvas where learners can practice LLD problems by dragging class nodes and connecting relationships. The system serializes the design graph and saves drafts and attempts to `localStorage`, avoiding a complex backend database. When submitted, the JSON graph is evaluated by an AI backend against a strict, problem-specific rubric, returning structured, actionable JSON feedback rather than generic text. 

**Exact Feature List:** Problem dashboard, split-pane workspace, minimalist React Flow design canvas (1 node type, 1 edge type), async evaluation state machine, rubric-driven structured AI feedback scorecard, local history tracking.

**Recommended Tech Stack:** Next.js (App Router), React, TailwindCSS, React Flow (@xyflow/react), LocalStorage, OpenAI/Gemini API.

**React Flow Decision:** **USE React Flow.** We will enforce extremely strict scope boundaries (one node type, no complex UI sidebars) to ensure it fits comfortably within the 2-day limit, as the visual paradigm makes the LLD practice experience substantially better than a text box.

**Next Implementation Step:** Initialize the Next.js repository, install dependencies (including `@xyflow/react`), and begin defining the core TypeScript interfaces (`Attempt`, `Submission`, `Evaluator`) to ensure our domain model is solid before building the canvas.
