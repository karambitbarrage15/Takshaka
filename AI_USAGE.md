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

