# AI Usage

## 1. Domain boundary
- **Suggestion:** Model every noun in the brief as a class and split the server into many services.
- **Decision:** Rejected the exhaustive class list and kept `Problem`, attempt records, structured fields, and evaluation result as the meaningful contracts.
- **Why:** The MVP needs clear responsibilities, not ceremony. The evaluator variation point was the only abstraction with immediate change value.

## 2. Evaluator fallback
- **Suggestion:** Call an LLM directly from the submit route and return its score.
- **Decision:** Rejected direct coupling. The submit path writes first and depends on `Evaluator`; `RuleBasedEvaluator` is the reliable current implementation and `FallbackEvaluator` shows how an AI provider can fail safely.
- **Why:** A lost submission or opaque score would break the core learner loop.

## 3. Rubric
- **Suggestion:** Produce a single numeric score from a general quality prompt.
- **Decision:** Rejected. I used eight fixed dimensions, each with score, evidence, concern, suggestion, and confidence.
- **Why:** Criterion-level evidence is reviewable and gives the learner a next action.

## 4. UI information architecture
- **Suggestion:** Build a dashboard with many navigation sections and an editor-like canvas.
- **Decision:** Kept a single linear flow: library, brief, practice form, feedback, and retry.
- **Why:** The assignment is a focused developer tool, and a structured text design is explicitly preferred over a UML editor.

## 5. Tests
- **Suggestion:** Prioritize broad component snapshot coverage.
- **Decision:** Focused tests on evaluator output shape, missing evidence, and provider fallback.
- **Why:** The most consequential MVP contract is explainable evaluation; HTTP validation is also explicit in the API implementation.
