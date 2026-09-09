# LLD Practice Platform Research

## 1. LLDCanvas
Website: https://www.lldcanvas.in/

### Problem Discovery
- Problems are listed on a dedicated "Interview Questions" page.
- Each problem is displayed as a card/list item.
- Difficulty is clearly shown (Easy, Medium, Hard).
- Problems are categorized by domain (e.g., Transportation, Banking) and tagged with companies that ask them (e.g., Amazon, Google).
- Before starting, the user sees the title, difficulty, companies, and category.
- The user clicks the problem link to open the full problem page and editor.

### Problem Statement (Parking Lot)
- **Problem statement:** "Design a parking lot system that manages vehicle entry/exit, tracks slot availability across multiple floors, and supports different vehicle sizes."
- **Requirements & Constraints:** Yes, listed clearly (e.g., 7 functional and 4 non-functional requirements), though some are gated behind a sign-in.
- **Hints:** Yes, it uses "Staged Hints" where hints are revealed one at a time (e.g., "Hint 2 of 3").
- **Reference solution:** No official reference solution is provided. Instead, users are directed to a "Community Discussion" thread to compare approaches.
- **UML/Code shown:** The problem page contains a live UML canvas and editor to start working immediately.

### Practice Experience
- **Where to write:** The user practices directly on the platform using a unified canvas/editor.
- **Format:** The user can design using a visual drag-and-drop UML editor, write plain-text "Draft Notation" that auto-generates UML, or write actual code in 11 languages.
- **Saving:** Yes, work is auto-saved automatically ("Every canvas and note is saved automatically the moment you stop"). 

### Submission
- **What happens on submit:** Interestingly, there does not appear to be a formal "Submit for Grading" action. The practice is self-directed. 
- You can run your code in the sandbox to see if it compiles/works, but there are no automated hidden tests or automated scoring systems mentioned. 

### Feedback
- **Feedback provided:** Because there is no formal submission/grading engine, there is no automated, personalized feedback (no score, no AI strengths/weaknesses). 
- The feedback loop consists of:
  1. Unlocking staged hints if stuck.
  2. Running your own code to check for errors.
  3. Reading the community discussion to manually compare your design against what other engineers did.

### History / Retry
- **Previous attempts:** Yes, the platform tracks history extensively.
- It logs "sessions" and saves snapshots of the canvas.
- It provides analytics like a daily streak, an activity heatmap, and time spent practicing.

### Interesting Features
- **Draft Notation:** Turning plain English sentences into UML diagrams instantly.
- **Pre-wired Design Patterns:** Inserting skeletons of 23 GoF patterns instantly.
- **Interview Mode:** A built-in countdown timer to simulate real interview pressure.

### Features I would NOT build for my MVP
- Visual drag-and-drop UML editor (too complex to build in 2 days).
- Real-time multiplayer collaboration.
- Code execution sandbox supporting 11 languages.
- Community discussion threads.
- Converting text to visual UML nodes.

### What I learned
- A good practice platform needs structure (Problem -> Requirements -> Hints), but LLDCanvas relies on the community for the actual "evaluation" part. 
- For our MVP, we can differentiate by actually providing the *evaluation* and *structured feedback* that LLDCanvas lacks, while skipping the complex visual diagramming tools.

## 2. HelloInterview
Website: https://www.hellointerview.com/practice/low-level-design

*Note: Much of the HelloInterview practice platform is heavily restricted by a login wall. My observations below are based strictly on what is publicly accessible without an account, as instructed.*

### 1. Problem Discovery
- **How problems are listed:** The main `/practice/low-level-design` page loads a navigation shell, but the actual list of problems is not visible because it either requires a login or relies heavily on client-side rendering that isn't statically available. 
- **Difficulty & Categories:** I could not observe the exact layout, tags, or difficulty indicators without an account.
- **Starting a problem:** Attempting to navigate directly to a problem URL (e.g., `/practice/low-level-design/parking-lot`) immediately redirects the user to the `/login` page. 

### 2. Problem Statement
- **Unavailable due to login restrictions.** I cannot observe the problem statement, functional/non-functional requirements, constraints, hints, or reference solution because the problem page redirects to sign-in.

### 3. Practice Experience
- **Unavailable due to login restrictions.** I cannot see the specific practice editor, whether the learner writes code or text, or how drafts are saved.
- *(Note: Public metadata and documentation suggest they use a guided workflow broken into steps—Requirements -> Entities -> Class Design -> Implementation -> Extensibility—guided by an AI interviewer. However, I could not observe this first-hand).*

### 4. Submission
- **Unavailable due to login restrictions.** I cannot observe if there is a formal Submit button or how status tracking (Submitted/Evaluating) is handled.

### 5. Evaluation
- **Unavailable due to login restrictions.** I cannot observe the evaluation mechanics, scores, or rubrics directly.

### 6. Feedback
- **Unavailable due to login restrictions.** I cannot observe exactly what kind of feedback (Strengths, Weaknesses, Evidence, AI-generated suggestions) is provided to the user after submission.

### 7. History / Retry
- **Unavailable due to login restrictions.** I cannot observe the history, retry mechanics, or progress tracking dashboards.

### 8. What is good?
*(Based on observable architecture and public documentation)*
- The platform uses a very clean, structured navigation layout.
- The concept of "Guided Practice" (breaking the LLD problem into distinct phases like Requirements, Entities, Class Design) is a highly effective way to prevent learners from feeling overwhelmed compared to a completely blank canvas.

### 9. What could be improved?
- **Hard login wall:** The learner cannot even view a problem statement or see what the practice experience looks like without creating an account. This creates high friction for problem discovery and evaluating the platform's usefulness.

### 10. What I learned
- **Gating Content:** For our MVP, we should make problem discovery and problem statements public to reduce friction, even if the actual submission/evaluation requires an account.
- **Guided Workflow:** Breaking the LLD process into steps (e.g., Requirements -> Design -> Evaluation) is an excellent pattern we should consider for our own platform, as it mirrors a real interview better than a blank text box.
- **Handling Constraints:** Since I couldn't see their AI feedback, it reinforces that our MVP's core differentiator will be how well we build our transparent, rubric-based AI evaluation system.

## 3. LLD Arena
GitHub: https://github.com/mightbeanshuu/lld-arena

### 1. Product / Learner Flow
- **Find a problem:** The user sees a dashboard with 32 problems. No login is required.
- **Start an attempt:** Clicking a problem opens a detail page with a split-pane layout (description on the left, code editor on top-right, console on bottom-right).
- **Submit:** The learner writes Java code in the in-browser Monaco editor. They can hit **Run** to execute the code or **Submit** to claim stars and get evaluated.
- **After submission:**
  - If the problem has hidden tests, they are executed against the user's code.
  - If it's a rubric problem, a checklist popup appears; the user must self-certify that they met the design requirements.
- **Feedback:** The platform displays `[PASS]/[FAIL]` for hidden tests. If the Groq AI grader is configured, it shows an animated `ScoreChart` modal with an overall score (0-100), per-rubric grades (0-5), strengths, improvements, and detected design patterns.
- **Retry:** Yes, users can repeatedly edit their code and re-submit.
- **History:** Progress (solved status, stars) and code drafts are automatically saved.

### 2. Problem Model
- Problems are represented as static objects in a `PROBLEMS` array (`src/data/problems.ts`).
- **Information contained:** `id`, `slug`, `title`, `difficulty` (Easy/Medium/Hard), `tags`, `description` (markdown), `requirements` (bullet list), `concepts` taught, and `hints`.
- **Reference solutions:** There are no explicit reference solution code blocks. However, there is a `starter` code template, and some problems include a Mermaid `uml` diagram as an architectural spoiler.
- **Evaluation criteria:** Problems either define `tests` (Java code body + contract strings) or a `rubric` (an array of strings defining design constraints like "MachineState is an interface").

### 3. Submission Model
- **Format:** The learner submits pure Java code (as a text string) along with their checkmarks for the rubric (if applicable).
- **Representation:** The code is sent as a JSON payload (`{ source, problem, rubric }`) to local API routes (`/api/run-java` and `/api/grade`).

### 4. Evaluation
- Evaluation is a hybrid of deterministic tests and AI/LLM judgment.
- **Deterministic:** A custom Vite middleware (`server/run-java.mjs`) writes the user's code to a temp directory, appends a generated `Tests.java` file (if the problem has hidden tests), and spawns child processes for the local `javac` and `java` binaries to compile and run it. The stdout is parsed for `[PASS]` / `[FAIL]`.
- **AI/LLM:** For design evaluation, the server calls the Groq API (using the `llama-3.3-70b-versatile` model).
- The prompt includes the problem description, the specific rubric checklist, and the user's code (truncated if too long).
- **Enforced Output:** The system prompt forces the LLM to return a strict JSON schema containing: `overall` score (0-100), a short `verdict`, an array of `rubric_scores` (with a 0-5 integer and a specific comment per criterion), `strengths`, `improvements`, and `design_patterns_detected`.

### 5. Feedback
- Feedback is returned as structured data and rendered in a React modal (`ScoreChart.tsx`).
- It includes a visually appealing Donut chart for the overall score.
- Scores are broken into categories corresponding directly to the problem's rubric.
- It includes explicit sections for strengths ("What works") and weaknesses ("What to improve").
- The feedback references evidence by providing a specific one-line comment for *each* rubric criterion based on the submitted code.

### 6. History / Persistence
- Data is persisted entirely in the browser's `localStorage` (via a `useProgress` React hook). There is no backend database.
- **Attempts stored:** The platform saves the user's current code draft for each problem (`lld-arena:drafts`).
- **Progress tracked:** It tracks which problems are solved, the time solved, and accumulated stars (`lld-arena:solved`).
- **Feedback storage:** The generated AI feedback reports are ephemeral. They are shown on submit but are *not* saved to localStorage.

### 7. Architecture
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Monaco Editor.
- **Backend:** There is no traditional backend service. Instead, a custom Vite plugin (`server/run-java.mjs`) acts as a local proxy. It handles OS-level operations (spawning `javac`/`java`) and securely calling the external Groq API without exposing the API key to the client bundle.
- **Domain Models:** Static typescript files (`src/data/problems.ts`).
- **Persistence:** LocalStorage API.

### 8. Important LLD / Domain Design Decisions
Within the project's architecture itself:
- `Problem` (Interface): Responsibilty is to define the shape of a challenge. It decouples the UI from the vast amount of text/code data. Unlikely to change.
- `javaRunnerPlugin` (Vite Plugin Middleware): Responsibility is to isolate dangerous/heavy OS-level execution (`child_process.spawn`) and secret management (Groq API key) from the browser environment.
- `ScoreChart` (Component): Responsibility is to parse and visualize the complex JSON feedback from the LLM. It abstracts the visual rendering away from the editor page.

### 9. What is good?
1. **Rubric-driven LLM evaluation:** Instead of vaguely asking the LLM to "evaluate the code", it forces the LLM to score specific, predefined design constraints (the rubric). This makes grading much more reliable.
2. **Structured JSON output:** Enforcing a strict JSON schema from the LLM allows the frontend to render a beautiful dashboard instead of a messy wall of markdown text.
3. **Hybrid evaluation:** Doing deterministic compilation/tests *before* asking the LLM to review the design saves LLM tokens and prevents it from hallucinating feedback on broken code.
4. **Zero-setup backend:** Using Vite middleware to spawn local binaries is a brilliant hack for a local-first practice tool.
5. **Local persistence:** Storing drafts and progress in `localStorage` keeps the app fast, stateless, and free to host.

### 10. What is overkill for our 2-day MVP?
- **Local compilation/execution via child processes:** If we build a hosted web app, we cannot safely spawn `javac` without complex sandboxing (like Docker/Firecracker). We should skip code execution and focus purely on LLM-based design review for our 2-day MVP.
- **32 hand-authored problems:** We only need 2 or 3 solid problems for an MVP.
- **Animated donut charts / complex UI:** A simple HTML/Markdown rendering of the feedback is sufficient.

### 11. What I learned
1. **Submission Model:** Plain text code is perfectly fine. We don't need a visual UML drag-and-drop editor to build a good LLD platform.
2. **Evaluation Architecture:** The key to good AI grading is combining a strict rubric with a JSON-enforced output schema.
3. **Feedback Representation:** Showing a breakdown of scores *per requirement* is much more actionable for learners than a single generic paragraph.
4. **Attempt/History Model:** We do not need a database. Browser `localStorage` is incredibly effective for an MVP.
5. **Separation of Concerns:** Separate the "does it work" (compilation/tests) from the "is it well-designed" (AI grading).

## Comparison: LLDCanvas vs HelloInterview vs LLD Arena

| Area | LLDCanvas | HelloInterview | LLD Arena |
|---|---|---|---|
| Problem discovery | Public problem cards with tags | Gated behind login | Public dashboard, 32 problems |
| Problem presentation | Statement, constraints, and hints | Gated behind login | Split-pane: description, hints, UML spoiler |
| Practice format | UML drag-and-drop / Code sandbox | AI-guided conversational steps | In-browser Monaco editor (Java only) |
| Submission | Self-directed, no formal submit | Gated behind login | Raw Java code |
| Evaluation | None (relies on community) | AI evaluation | Hybrid: Local tests + AI rubric scoring |
| Feedback | None (community discussion) | Detailed AI feedback | Strict JSON scorecard (Strengths, weaknesses, rubric) |
| History/retry | Tracks time and streaks publicly | Gated behind login | Saves solved state and code drafts to `localStorage` |
| AI usage | None | Core feature (guided interviewer) | Core feature (grades strictly against a rubric) |
| Most useful idea | Draft Notation (text to UML) | Guided step-by-step workflow | Rubric-driven AI evaluation with JSON output |
| What we should avoid | Visual drag-and-drop UML editors | Hard login walls | Complex code execution sandboxing |

## Research Conclusion

Based on all three products, here is the synthesis for our 2-day MVP:

1. **The learner problem we should solve:** Learners practicing Low-Level Design can write code, but they have no way to know if their *architecture* and *design patterns* are actually good without paying for a human mock interview.
2. **The biggest gap we can address:** LLDCanvas offers no automated feedback, and HelloInterview locks it behind a login. We can provide immediate, rubric-based AI architectural feedback on public problems.
3. **The smallest useful MVP:** A frictionless, no-login web app with 2-3 LLD problems, a plain-text code editor, and an AI evaluator that grades the code against a specific rubric and returns structured feedback.
4. **The core practice loop our product should implement:** 
   Read Problem Statement → Write Code → Submit → AI evaluates against predefined Rubric → Display Scorecard (Strengths, Weaknesses, Rubric breakdown) → Retry.
5. **Which features we should explicitly NOT build in the 2-day assignment:**
   - User authentication / Login walls.
   - A real database (use `localStorage`).
   - Visual drag-and-drop UML editors.
   - Complex, sandboxed remote code execution (rely entirely on LLM design analysis for the MVP to save time).
