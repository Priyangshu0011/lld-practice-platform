# design/lab

A focused LLD practice platform for writing, submitting, and reviewing low-level design solutions. It is intentionally a small monolith for a two-day assignment: React/Vite client, Express API, SQLite persistence, and a deterministic evaluator behind an `Evaluator` interface.

## What it solves

Most LLD practice is either a blank document with no feedback or an answer key that rewards imitation. design/lab gives a learner a fixed problem brief, a structured text submission, and explainable feedback tied to the learner's own evidence.

## Features

- Four seeded problems: Parking Lot, Elevator System, Vending Machine, and Library Management.
- Problem brief with requirements, assumptions, timebox, and non-answer guidance.
- Draft and submitted attempts persisted in SQLite.
- Eight-part rubric with score, evidence, concern, suggestion, and confidence.
- Attempt history, score visibility, and Try Again flow.
- Thin REST API with validation for invalid IDs, incomplete submissions, and duplicate submits.
- Evaluator boundary ready for an AI evaluator; rule-based evaluation remains the safe default.

## Stack and structure

- React + JSX + Vite in `frontend/`
- Express + JavaScript in `server/`
- SQLite via `better-sqlite3`
- Vitest for domain/evaluator tests

`server/src/domain.js` contains the domain data and problem catalog. `server/src/evaluator.js` owns rubric evaluation. `server/src/db.js` owns persistence. `server/src/index.js` is a thin HTTP composition layer. The client is a single focused experience in `frontend/src/App.jsx`.

## Run locally

Prerequisites: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

The API runs on `http://localhost:3001` and Vite on `http://localhost:5173`. SQLite is created automatically at `lld-practice.sqlite`; set `DB_FILE` to choose another path. `npm run seed` is optional and safely inserts missing catalog records.

```bash
npm test
npm run build
```

Copy `.env.example` to `.env` if you want to configure `PORT`, `DB_FILE`, or a future `AI_API_KEY`. No API key is needed for the working MVP. Rule-based evaluation is always available, and the submission is saved before evaluation is attempted.

## Example learner flow

Open a problem, start an attempt, fill the ten structured design sections, save a draft if needed, then submit. The result immediately shows `COMPLETED`, a percentage score, eight criterion rows with submission evidence, strengths, weaknesses, and concrete next-pass suggestions. The home screen then shows the attempt in history.

## Decisions and limitations

The MVP uses text rather than a UML editor or compiler because design reasoning is the product signal. It has no authentication, collaboration, background queue, AI provider implementation, payments, or multi-user tenancy. The API is intentionally synchronous and local. At larger scale, a job store and provider adapter would move evaluation off the request path, and a user identity would partition attempts.

The evaluator contract supports the second evaluator change test: adding AI or human review does not change attempt creation or submission flow. The structured `DesignFields` payload is also isolated from the attempt lifecycle so a later `DiagramSubmission` can be introduced behind a submission-type boundary.

See [docs/DESIGN.md](docs/DESIGN.md), [docs/RESEARCH.md](docs/RESEARCH.md), and [AI_USAGE.md](AI_USAGE.md).
