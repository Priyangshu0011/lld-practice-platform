# Design Note

## Product goal
Help a learner practice the reasoning behind an LLD, not copy a reference implementation. The core loop is brief -> structured design -> submission -> evidence-based review -> retry.

## Architecture
A small monolith keeps the deployment and debugging surface appropriate for a two-day MVP. The API composes domain data, application behavior, evaluator selection, and persistence. Routes validate and translate HTTP; the evaluator and persistence modules own decisions in their boundaries.

## Domain model
`Problem` is a seeded challenge with requirements, assumptions, and guidance. `Attempt` owns lifecycle state (`DRAFT`, `SUBMITTED`, `COMPLETED`, `FAILED`) and points to one problem. A structured text submission is represented by `DesignFields`. `EvaluationResult` contains eight `Criterion` records plus aggregate feedback. These are meaningful contracts rather than empty ceremony.

## Evaluation
`Evaluator.evaluate(problem, submission)` is the variation point. `RuleBasedEvaluator` scores content coverage and emits evidence from the actual submitted sections. A future `AIEvaluator` can implement the same contract. `FallbackEvaluator` demonstrates the failure policy: the primary evaluator may fail, but the deterministic fallback still returns feedback.

The fixed rubric is: requirement understanding, class responsibilities, encapsulation/interfaces, coupling/cohesion, abstraction/pattern usage, extensibility, edge cases/testability, and quality of explanation. Deterministic checks remain in the API: problem/attempt IDs, draft state, required fields, minimum section length, and duplicate submission protection.

## Persistence and failure handling
SQLite stores problem JSON, attempts, drafts, submissions, and serialized evaluations. The submission is written before evaluation. Invalid requests return safe messages and never expose stack traces. A production version would add a migration tool, structured logs, and user-scoped authorization.

## Change tests

**CHANGE TEST A: text today, class diagram tomorrow.** The attempt lifecycle should continue to own status and history. The current `DesignFields` payload is the only part that would change: introduce a submission type/serializer and keep `AttemptService` and evaluation contracts operating on a submission interface. The MVP keeps this boundary intentionally small rather than building unused polymorphism.

**CHANGE TEST B: rule-based today, AI or human review tomorrow.** The practice flow depends on `Evaluator`, not on the rule implementation. Add an adapter and choose it at composition time; persistence can store `evaluatorType` and the same criterion shape. Human review would be another implementation or an asynchronous review state, not a rewrite of attempt creation.

## Trade-offs
There is no auth, queue, or full AI integration because those do not improve the two-day learner loop. The client is kept in one feature surface for speed; a larger product would split pages and API types. Synchronous evaluation improves demo reliability, while the stored lifecycle states leave room for a job-backed evaluator later.
