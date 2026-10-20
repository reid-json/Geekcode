# Geekcode implementation plan

## Architecture

Static Vite + React + strict TypeScript application. Hash routing supports arbitrary
static hosting prefixes. Custom CSS provides the terminal/lab identity without a
utility framework. Zustand owns reactive state; Dexie stores a versioned,
exportable local snapshot. No account, backend, analytics, or paid service.

Execution uses disposable module Workers, a shared result protocol, and enforced
wall-clock deadlines. JavaScript/TypeScript, Pyodide Python, and sql.js SQLite are
real execution engines. Configuration, Java, and design exercises use explicit
authored checks, never pretend execution. Monaco and execution engines load lazily.

## Data and folders

- `src/content/`: versioned authored curriculum, career rules, and schema helpers.
- `public/content/`: generated individual problem/lesson JSON files.
- `src/engines/`: worker runners and protocol.
- `src/core/`: scoring, scheduling, persistence, coach, career, and export logic.
- `src/components/`, `src/pages/`: reusable UI and routed learning surfaces.
- `scripts/`: curriculum materialization, validation, and runtime asset preparation.
- `tests/`: unit and browser acceptance tests.
- `.github/workflows/`: checks and GitHub Pages publication.

Problems carry identity, track, kind, difficulty, tags, starter/reference per
language, visible/hidden tests, complexity, editorial, coach, and career metadata.
Lessons carry worked examples, misconceptions, related exercises, coach and career
metadata, and flashcards. Coach stages carry questions, insight rules, targeted
follow-ups, spoiler deny lists, and prerequisite links. Progress includes attempts,
solves, reviews, settings, drafts, notes, learning logs, reports, and stories.

## Milestones

1. Scaffold and verify one JavaScript/Python problem end to end.
2. Add SQL and honest static validators; reference-check all content.
3. Dashboard, progression, flashcards, and substantive study library.
4. Integrated Markdown notes, guided coach, Quick Learn, and spoiler checks.
5. Placement, settings, career reports and evidence-backed exports.
6. Offline PWA, accessibility/responsive polish, automated browser checks.
7. Document actual guarantees/limitations, commit, and push to `reid-json/Geekcode`.

## Decisions

Java execution is deliberately not offered: TeaVM compiles ahead of time rather
than evaluating arbitrary source in the browser; CheerpJ deployment/licensing and
runtime distribution do not meet this project's simple fully redistributable
offline execution requirement. Java prediction and repair drills remain first-class.
Python scientific packages are downloaded only on demand and cached; an uncached
package cannot be available offline. Static hosting requires HTTP(S), not `file:`.
