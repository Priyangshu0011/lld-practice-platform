# Research Note

LLD practice commonly happens in three formats: interview-prep articles and videos, collaborative whiteboards, and free-form personal notes. Public preparation material is useful for discovering canonical problem domains, but it tends to emphasize a reference solution. Whiteboard tools support diagrams and discussion, but do not provide a consistent review rubric. Coding platforms are strong at executable correctness, yet LLD quality is usually about boundaries, responsibilities, change isolation, and explaining trade-offs rather than passing tests.

Useful public references reviewed for this MVP include:

- [Educative, Grokking the Object Oriented Design Interview](https://www.educative.io/courses/grokking-the-object-oriented-design-interview): structured problem walkthroughs and class-oriented thinking.
- [Refactoring Guru, Design Patterns](https://refactoring.guru/design-patterns): pattern intent and trade-off reference material.
- [Excalidraw](https://excalidraw.com/): example of a lightweight, collaborative diagram-first interaction model.
- [LeetCode System Design](https://leetcode.com/problemset/all/): shows how practice products use problem libraries and attempt history, even though its focus is broader system design.

The gap this MVP chooses to address is the step between reading and interviewing: a learner needs to commit to a design, make assumptions visible, and receive feedback that points to their own evidence. A score without evidence is not useful, and an answer key can encourage copying. Therefore design/lab uses a fixed structured text format, a small problem library, and criterion-level deterministic feedback. It deliberately does not claim that a rule-based word-coverage check replaces an experienced reviewer; it is a dependable baseline that makes the learning loop observable.

Assumptions: this is a solo practice tool, the learner is comfortable with text rather than requiring a diagram canvas, and an explainable baseline is more valuable for an MVP than unreliable AI output. Future research should test whether learners prefer the ten sections as-is, whether diagram uploads improve reasoning, and how expert review should calibrate the rubric.
