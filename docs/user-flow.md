# LLD Practice Platform: User Flow & UX Design

## 1. PRODUCT EXPERIENCE
The intended learner experience is highly focused, frictionless, and interview-oriented. It feels like:
*"I choose an LLD problem → understand the requirements → design my classes visually on a canvas → submit my architecture → understand exactly what I did well or wrong against a rubric → improve my design → try again."*

We are avoiding the bloated feel of an LMS. The platform acts as a strict but helpful mock interviewer. The use of a lightweight React Flow visual canvas bridges the gap between typing code and drawing on a whiteboard, which is how System Design is actually evaluated in FAANG interviews.

## 2. COMPLETE USER JOURNEY

### 1. Dashboard
- **What the user sees:** A clean, minimalistic list of available LLD problems (Parking Lot, Elevator).
- **What the user can do:** Click on a problem card to view its details.
- **What happens:** Navigates to the Problem Details screen.
- **Data updated:** None.
- **Next state:** Problem Details.

### 2. Problem Details
- **What the user sees:** The full problem statement, requirements, constraints, and a "Start Practice" button.
- **What the user can do:** Read the prompt, toggle hints, or click "Start Practice".
- **What happens:** The system initializes an attempt.
- **Data updated:** A new `Attempt` record is created in `localStorage` with status `DRAFT`.
- **Next state:** Practice/Design Workspace.

### 3. Practice/Design (React Flow Workspace)
- **What the user sees:** A split-pane layout. Left: Requirements. Right: A blank or in-progress React Flow canvas.
- **What the user can do:** Add Class nodes, type properties/methods into textareas inside the nodes, drag edges to connect classes, delete nodes.
- **What happens:** The canvas updates visually.
- **Data updated:** The graph state (nodes/edges) autosaves to the current Attempt's draft in `localStorage`.
- **Next state:** Save Draft / Submit.

### 4. Save Draft
- **What the user sees:** A small "Saved" indicator that flashes when changes are made.
- **What the user can do:** Close the browser safely.
- **What happens:** Graph state is serialized to JSON.
- **Data updated:** `Attempt.submission.content` is updated in `localStorage`.
- **Next state:** Remains in Practice.

### 5. Submit
- **What the user sees:** A "Submit for Review" button.
- **What the user can do:** Click the button.
- **What happens:** Validation runs (ensures at least 1 class exists). The system locks the canvas.
- **Data updated:** `Attempt.status` becomes `EVALUATING`.
- **Next state:** Evaluating.

### 6. Evaluating
- **What the user sees:** The canvas becomes read-only. A loading overlay appears with text like *"AI is reviewing your architecture against the rubric..."*
- **What the user can do:** Wait. (Cannot submit again).
- **What happens:** A POST request is made to `/api/evaluate` containing the serialized React Flow JSON and the problem's rubric.
- **Data updated:** None locally until the response returns.
- **Next state:** Evaluation Completed / Failed.

### 7. Evaluation Completed / Feedback
- **What the user sees:** A Scorecard modal slides over the canvas, showing the overall score, strengths, and rubric breakdown.
- **What the user can do:** Read the feedback, close the modal to view their read-only canvas alongside the feedback, or click "Try Again".
- **What happens:** The API response is parsed and saved.
- **Data updated:** `Attempt.feedback` is populated. `Attempt.status` becomes `COMPLETED`.
- **Next state:** Review / Retry.

### 8. Retry
- **What the user sees:** A "Try Again" button.
- **What the user can do:** Click it to improve their score.
- **What happens:** A *new* Attempt is created, but the canvas state is cloned from the previous attempt so they don't have to start from scratch.
- **Data updated:** New `Attempt` added to `localStorage`.
- **Next state:** Practice/Design (Draft).

### 9. Attempt History
- **What the user sees:** A sidebar listing "Attempt 1 (65/100)", "Attempt 2 (85/100)".
- **What the user can do:** Click an old attempt.
- **What happens:** The workspace loads the historical canvas and its scorecard.
- **Data updated:** Active view changes.
- **Next state:** Open Previous Attempt.

### 10. Open Previous Attempt
- **What the user sees:** The historical canvas (locked/read-only) and the historical feedback scorecard.
- **What the user can do:** Review past mistakes.
- **What happens:** -
- **Data updated:** -
- **Next state:** -

---

## 3. DASHBOARD UX

The dashboard is the entry point. It contains only the available problems.

```text
┌────────────────────────────────────────────────────────────┐
│  LLD Practice Platform                             [Home]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Select a Problem to Practice                              │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Design a Parking Lot                       [Medium] │  │
│  │  ──────────────────────────────────────────────────  │  │
│  │  Design an object-oriented parking lot system        │  │
│  │  that manages vehicle entry/exit, spot tracking,     │  │
│  │  and fee calculation.                                │  │
│  │                                                      │  │
│  │  Your Progress: Attempt #2 (85/100)                  │  │
│  │                                       [ CONTINUE ]   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Design an Elevator System                  [Hard]   │  │
│  │  ──────────────────────────────────────────────────  │  │
│  │  Model a multi-elevator system with internal and     │  │
│  │  external requests, and pluggable dispatch logic.    │  │
│  │                                                      │  │
│  │  Your Progress: Unattempted                          │  │
│  │                                          [ START ]   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 4. PROBLEM DETAILS UX

When a user clicks "Start", they first see the full prompt before they are thrown into the canvas.

```text
┌────────────────────────────────────────────────────────────┐
│  < Back to Dashboard                                       │
├────────────────────────────────────────────────────────────┤
│  Design a Parking Lot                                      │
│                                                            │
│  Problem Statement:                                        │
│  Design a parking lot system that manages vehicles...      │
│                                                            │
│  Requirements:                                             │
│  - Support 3 vehicle types (Motorcycle, Car, Truck)        │
│  - Support multiple floors and spot sizes                  │
│  - Calculate fees based on duration                        │
│                                                            │
│  Concepts Tested:                                          │
│  - Inheritance, Polymorphism, Strategy Pattern             │
│                                                            │
│  [ Show Hints ▼ ] (Hidden by default)                      │
│                                                            │
│                                                            │
│  [        START DESIGNING (OPENS CANVAS)        ]          │
└────────────────────────────────────────────────────────────┘
```

---

## 5. REACT FLOW WORKSPACE UX

**React Flow Scope Definition:**
- **What React Flow provides:** The infinite panning/zooming canvas, standard nodes, standard edges, connection handles, and drag-and-drop mechanics.
- **What we build:** Exactly one custom `ClassNode` component. It renders a header (Class Name input) and two text areas (`properties`, `methods`). We rely on plain `<textarea>` elements so we don't have to manage complex dynamic arrays of inputs for every single method/property. The LLM can perfectly understand textarea line-breaks.

```text
┌─────────────────────────┬──────────────────────────────────┐
│  Requirements      [=]  │  Canvas               [Submit]   │
├─────────────────────────┼──────────────────────────────────┤
│  Design a Parking Lot   │                                  │
│                         │  [+ Add Class]                   │
│  - 3 vehicle types      │                                  │
│  - Fee calculation      │      ┌───────────────────────┐   │
│  - Spot matching        │      │ ParkingLot            │   │
│                         │   O──┤───────────────────────├──O│
│  Rubric (AI checks):    │      │ floors: List<Floor>   │   │
│  1. Vehicle is abstract │      │ feeStrategy: Strategy │   │
│  2. Fee is decoupled    │      ├───────────────────────┤   │
│                         │      │ park(Vehicle v)       │   │
│                         │      │ unpark(Ticket t)      │   │
│                         │      └───────────┬───────────┘   │
│                         │                  │               │
│                         │                  │ (has-a)       │
│                         │                  ▼               │
│                         │      ┌───────────────────────┐   │
│                         │      │ ParkingFloor          │   │
│  History                │   O──┤───────────────────────├──O│
│  - Attempt 2 (85)       │      │ spots: List<Spot>     │   │
│  - Attempt 1 (60)       │      ├───────────────────────┤   │
│                         │      │ findFreeSpot()        │   │
│                         │      └───────────────────────┘   │
└─────────────────────────┴──────────────────────────────────┘
```

---

## 6. ATTEMPT STATE UX

- **DRAFT**: Canvas is fully interactive. The "Submit" button is bright and active. A small "Saved locally" indicator updates 1 second after typing.
- **EVALUATING**: The React Flow `nodesDraggable`, `nodesConnectable`, and `elementsSelectable` props are forced to `false`. A semi-transparent overlay covers the canvas with a spinner: *"AI Interviewer is reviewing your architecture..."*. Submit button is disabled.
- **COMPLETED**: Canvas remains read-only. The Scorecard modal is visible. A "Try Again" button appears in the header.
- **FAILED**: Canvas unlocks. A red banner appears: *"Evaluation failed: The AI provider timed out. Please try submitting again."* Submit button reactivates.

---

## 7. SUBMISSION UX

When "Submit" is clicked:
1. **Validation**: Checks if `nodes.length > 0`. (We do not restrict single classes or lack of edges, as an LLM can provide feedback like "You only have one class, which violates Single Responsibility").
2. **Local Save**: Instantly saves the graph JSON to `localStorage`.
3. **State Transition**: `Attempt.status = 'EVALUATING'`.
4. **API Request**: `POST /api/evaluate` with `{ rubric, graph: { nodes, edges } }`.
5. **Loading**: UI overlay appears.
6. **Success**: Parses JSON, sets `status = COMPLETED`, triggers Scorecard modal.
7. **Failure**: Sets `status = FAILED`, shows error banner.
8. **Browser Refresh edge-case**: If a user refreshes while `EVALUATING`, upon reload, if `status === 'EVALUATING'`, we immediately reset it to `DRAFT` because the browser lost the pending fetch request (no background jobs in our MVP).

---

## 8. FEEDBACK / SCORECARD UX

The scorecard mimics a structured interview debrief, not a chatbot window.

```text
┌────────────────────────────────────────────────────────────┐
│  AI Architecture Review                           [ Close] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Overall Score:  [ 85 / 100 ]   Status: PASSING            │
│  "Solid design, but fee calculation is tightly coupled."   │
│                                                            │
│  ────────────────────────────────────────────────────────  │
│  Strengths:                                                │
│  ✓ Excellent use of polymorphism for Vehicle types.        │
│  ✓ Spot matching logic is properly encapsulated in Floor.  │
│                                                            │
│  ────────────────────────────────────────────────────────  │
│  Rubric Breakdown:                                         │
│                                                            │
│  [ 5/5 ] Vehicle Abstraction                               │
│  Evidence: You created an abstract Vehicle class and       │
│  extended Car/Truck from it.                               │
│                                                            │
│  [ 2/5 ] Fee Decoupling                                    │
│  Evidence: ParkingLot contains hardcoded fee logic.        │
│  Concern: Modifying pricing requires altering the lot.     │
│  Suggestion: Inject a FeeStrategy interface instead.       │
│                                                            │
│  ────────────────────────────────────────────────────────  │
│                                             [ TRY AGAIN ]  │
└────────────────────────────────────────────────────────────┘
```

---

## 9. RETRY UX

When the learner clicks "Try Again":
- **Decision**: The new attempt is **cloned** from the previous attempt's canvas state, not started empty.
- **Why**: In LLD, if a user gets an 85/100, they only need to fix one or two classes (e.g., extracting a `FeeStrategy`). Forcing them to redraw the entire `ParkingLot`, `Vehicle`, `Floor`, and `Spot` nodes from scratch causes immense friction and ruins the practice loop.
- **Flow**: Generates a new UUID. Copies `nodes` and `edges` from the old attempt. Sets status to `DRAFT`. The old attempt remains permanently visible in the History sidebar as read-only.

---

## 10. ATTEMPT HISTORY UX

The History sidebar allows users to review their progression.

```text
┌─────────────────┐
│ History         │
│                 │
│ ▼ Parking Lot   │
│                 │
│  Attempt #3     │
│  90/100  (Now)  │
│                 │
│  Attempt #2     │
│  85/100  (1h)   │
│                 │
│  Attempt #1     │
│  40/100  (2h)   │
│                 │
│                 │
│ [+ New Attempt] │
└─────────────────┘
```
- **Old Attempts**: Always loaded as **Read-only**. The canvas cannot be edited, and the "Submit" button is hidden. The Scorecard is permanently accessible via a "View Feedback" button.

---

## 11. NAVIGATION

Minimal routes to avoid complexity:
- `/` : Dashboard (Problem List)
- `/problem/[slug]` : The unified Workspace. (Handles Problem Details, the Canvas, and the Scorecard via UI state, avoiding complex URL routing for attempts). The specific attempt ID can be tracked in React state or a URL query parameter (`?attempt=uuid`).

---

## 12. EMPTY STATES

- **No attempts yet**: Sidebar shows "No previous attempts. Start your first design!"
- **Empty canvas**: A faint watermark in the React Flow background says: *"Drag a Class Node here to begin."*
- **No feedback yet**: Scorecard button is hidden until status is `COMPLETED`.

---

## 13. ERROR STATES

- **AI API failure (500 / Timeout)**: "We couldn't reach the AI evaluator. Your draft is saved. Please try submitting again."
- **Invalid AI response (JSON Parse Error)**: "The AI returned an invalid evaluation format. Please resubmit."
- **localStorage full (QuotaExceededError)**: "Unable to save draft. Your browser storage is full. Please clear some past attempts."

---

## 14. RESPONSIVE BEHAVIOR

- **Decision**: Desktop / Tablet landscape only.
- **Why**: A React Flow visual canvas is practically unusable on a 320px mobile screen. For a 2-day MVP, we will not waste time building a mobile-optimized stacked layout.
- **UX**: If screen width `< 768px`, we display a hard block overlay:
  *"LLD Practice requires a visual canvas. Please open this platform on a desktop or tablet device."*

---

## 15. UX FEATURES: MUST / NICE / OUT

**MUST HAVE:**
- Dashboard problem list.
- React Flow canvas with exactly 1 custom Node type (`ClassNode`).
- Textareas inside nodes for methods/properties.
- Standard drag-and-drop edges.
- Submit button that locks the canvas.
- Scorecard modal parsing structured JSON feedback.
- "Try Again" cloning mechanic.
- History sidebar loading read-only past attempts.

**NICE TO HAVE:**
- Custom edge types with labels (e.g., "Inherits", "Uses").
- Markdown rendering in the problem description pane.

**OUT OF SCOPE:**
- Mini-map for React Flow (canvas won't get that big).
- Auto-layout / DAGRE integration (users can arrange their own boxes).
- Syntax highlighting inside the textareas (too complex for standard HTML textareas).
- Mobile responsive canvas.
- Authentication / User profiles.

---

## 16. ASSIGNMENT ALIGNMENT

- **Problem**: Satisfied by the Problem Details pane clearly defining constraints.
- **Practice**: Satisfied by the React Flow workspace where they visually design architecture.
- **Submission**: Satisfied by serializing the graph and locking the UI during API transit.
- **Feedback**: Satisfied by the Scorecard modal explicitly mapping rubric criteria to scores and evidence.
- **History**: Satisfied by the History sidebar loading past attempts from `localStorage`.
- **Retry**: Satisfied by the "Try Again" button cloning the graph and letting them iterate.

---

## 17. FINAL USER FLOW (Diagram)

```text
    [ Dashboard ]
         │
         ▼
 [ Problem Details ]
         │
         ▼
[ React Flow Workspace ] ◄───────────┐
         │                           │
   (Design Canvas)                   │ (Clone canvas)
         │                           │
    [ Save Draft ]                   │
         │                           │
     [ Submit ]                      │
         │                           │
  (Lock Workspace)                   │
         │                           │
   [ Evaluating ]                    │
         │                           │
 [ Scorecard Modal ]                 │
         │                           │
     [ Review ]                      │
         │                           │
    [ Try Again ] ───────────────────┘
```

---

### Summary
- **Final recommended UX**: A desktop-focused, split-pane workspace using a minimalist React Flow canvas for designing architecture, paired with a structured, interview-style AI scorecard for feedback.
- **Exact screens**: Dashboard (`/`), Workspace (`/problem/[slug]`).
- **Exact user actions**: Read prompt, add class nodes, type properties/methods, connect nodes, submit, review scorecard, retry.
- **React Flow interactions**: Drag nodes, connect handles, edit textareas. NO auto-layout.
- **Attempt state transitions**: Draft → Evaluating → Completed (or Failed).
- **Feedback presentation**: A clean modal breaking down the overall score, strengths, and specific rubric criteria with evidence.
- **Explicitly NOT being built**: Mobile layout, UML auto-layout, authentication, generic chatbot UI, complex node types.
