# Authored content

All content is original practice material. References live in versioned content,
not UI components. The TypeScript interfaces in `src/content/schema.ts` are the
canonical schema. A full concrete template for **every** field is available in
`public/content/problems/pair-with-a-target.json` and
`public/content/lessons/lesson-hash-maps.json` after generation.

## Adding a problem

Copy an appropriate generated problem into `content/problems/my-problem.json`.
Choose a new `id`, update its content and tests, and run:

```sh
npm run content:generate
npm run validate-content
```

Do not retain the copied problem's ID. Every exercise must pass its reference
tests in each declared language. Python references are checked with Python 3;
the browser engine is additionally smoke-tested through Pyodide.

| Field                         | Contract                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `id`, `title`                 | Unique URL-safe stable ID; human title                                                                        |
| `track`                       | `dsa`, `syntax`, `devops`, `ai`, `sql`, or `systems`                                                          |
| `topic`, `difficulty`, `kind` | Topic; Easy/Medium/Hard; code/predict/repair/choice/multi-select/config/design/order/refactor/fill            |
| `description`                 | Markdown: full input/output, ordering, domain, and mutation contracts                                         |
| `languages`                   | Supported editor/runner languages                                                                             |
| `starter`, `reference`        | Language-keyed source/answer maps; every declared language must exist                                         |
| `tests`                       | `{args: [...], expected: JSONValue, hidden?: boolean, label?: string}`                                        |
| `hints`                       | Three questions, no code, algorithm names, or answer reveals                                                  |
| `complexity`                  | `{time,space}` self-check targets with assumptions                                                            |
| `editorial`                   | Comparison, proof, complexity and pitfalls; only shown after a pass                                           |
| `coach`                       | Required question ladder; see below                                                                           |
| `career`                      | Required evidence metadata; see below                                                                         |
| `prerequisites`               | Problem prerequisite IDs (lesson sequence is separate)                                                        |
| `answer`                      | For exact output/choice/order tasks, required lines in correct order; multi-select alone is order-insensitive |
| `choices`                     | Visible choice labels for choice/multi-select                                                                 |
| `rules`                       | Static coverage checks: label plus regex pattern/notPattern, or YAML path/equals                              |
| `seed`                        | SQL schema/data setup; each test starts from a fresh read-only database                                       |
| `packages`                    | Python AI-only optional packages; only known Pyodide lockfile packages load                                   |

Code tasks define `solve(...args)` (Python `def solve(...)`). JavaScript and
TypeScript answers must be JSON-compatible. Numeric comparison uses relative/
absolute tolerance 1e-6; object property order does not matter; array order does.
Do not rely on side effects between test cases. SQL `args[0]`, if a string, is a
trusted authored fixture mutation before read-only mode is set.

YAML dot paths support array indices (`spec.ports.0.port`). A regex-only HCL or
Docker rule is a bounded text check, not a real grammar or execution engine.
State that limitation in the exercise description.

## Coach schema and leak prevention

```json
{
  "stages": [
    {
      "id": "understand",
      "question": "What are the inputs, output, and one boundary case?",
      "insights": [
        ["input", "given"],
        ["output", "return"],
        ["empty", "boundary"]
      ],
      "followups": [
        {
          "missing": "boundary",
          "question": "What is the smallest legal input, and what should happen?"
        }
      ]
    }
  ],
  "stuck": [
    "Restate the output on a tiny input.",
    "Can you solve a two-item version by hand?",
    "Write before/after state for one step. Which fact is missing?",
    "Revisit the prerequisite lesson and bring back one rule in your words."
  ],
  "forbiddenTerms": ["intended algorithm name", "intended data structure"],
  "prerequisites": ["lesson-hash-maps"]
}
```

The example shows one stage only; a valid problem/lesson requires all nine:
understand, trace, baseline, bottleneck, discover, plan, implement, debug, reflect.
Each stage has at least a question, alternative insight groups, and a targeted
follow-up. A response matches if at least one synonym in each group appears.
This is transparent text matching, not semantic AI. The learner can use an honest
self-check for valid alternate phrasing; at least one meaningful sentence is
required and saved.

Early question/follow-up/stuck text must not contain forbidden terms. The validator
also rejects fenced/solution-like code and long reference-code matches. The last
stuck tier may link a named prerequisite; it supplies no code or solution. Tests
scan all content and browser flows verify that unsolved Guided/Interview screens
do not render editorials/references. Static assets are inspectable; this is a UX
learning rule rather than an anti-cheat mechanism.

## Lesson schema

Copy a generated lesson into `content/lessons/` with a new ID. Required fields:
`id`, `title`, `track`, `topic`, `minutes`, substantive Markdown `body`, a
three-or-more-step `diagram`, at least five `cards` (`front`,`back`), `coach`,
`career`, `related` problem IDs, and `prerequisites`.

`quick` contains `scenario`, `prediction`, `explanation`, `challenge`, and `answer`.
The current flow commits a prediction, observes the authored scenario result,
captures the learner's own explanation and self-check, then checks reapplication.
It assembles the summary from that explanation, never from a generated model
answer. Thirty lessons have separately authored transfer cases in
`src/content/quick-transfer.ts`; the rest use reinforcement reapplication.
Add a novel transfer scenario when authoring deeper micro-lessons.

## Career metadata

```json
{
  "skills": ["Specific concept demonstrated"],
  "keywords": ["Recruiter-ready technology or concept"],
  "questions": [
    "What invariant makes this correct?",
    "When does this approach fail?",
    "Which boundary test would you choose?"
  ],
  "outline": "Goal, concrete practice evidence, invariant, tradeoff, boundary test.",
  "projects": [
    {
      "title": "A concrete personal project",
      "scope": "A bounded deliverable and how to test it.",
      "stack": "Named tools",
      "readme": "Assumptions, architecture, reproducible checks, and measured results."
    }
  ]
}
```

Tracks, lessons, and problems require this block. Resume generation excludes
reading-only and assisted evidence, does not invent numbers, and labels personal
practice explicitly. Thresholds/templates/weights live in
`src/content/career-rules.ts`. Milestones are dated snapshots; live reports use
current visible evidence. User-editable text is not externally verified.
