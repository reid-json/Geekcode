# Geekcode

A local-first engineering practice lab for a CS graduate getting interview-ready.
Six tracks, question-led coaching, integrated notes, and career drafts grounded in
your actual practice. No accounts, backend, analytics, keys, or paid APIs.

**Launch curriculum:** 157 exercises (66 DSA, 21 language, 20 DevOps, 20 AI/ML,
15 SQL, 15 system design), 72 substantive lessons/Quick Learns, 360 review cards.
All reference implementations and static answers are automatically checked.

## Run

Requires Node.js 22.15+ and npm. Python 3 is needed **only for author/build reference
validation**, not by learners using the deployed app.

```sh
npm install
npm run dev
```

Open the local URL Vite prints. To generate and serve the static production app:

```sh
npm run build
npm run preview
```

Upload the entire `dist` directory to any HTTP(S) static host. Relative assets and
hash routes work under `/Geekcode/` or `/apps/geekcode/` as well as the domain root.
Opening `index.html` with `file://` is not supported: browsers require a secure
HTTP(S)/localhost origin for Workers, WASM loading, IndexedDB, and PWA installation.

## What works

- Monaco editor, per-track language/mode memory, persistent drafts, visible Run
  and full Submit checks, expected/actual/error/console output, cancellation.
- Guided nine-stage questioning, authored misconception follow-ups, free stuck
  ladder, reasoning capture, Practice question hints, timed 25-minute interviews.
  Editorial/reference rendering is gated by a passing solve in every mode and is
  entirely disabled during interviews. Teach-back is the coached reflection stage.
- XP, levels, deterministic daily/weekly picks, freezes, achievements, activity,
  per-topic progress, weakness ordering, personal timing/hint records, roadmaps.
- Searchable lessons/glossary/cheat sheets, SVG-free accessible flow diagrams,
  prediction-first Quick Learn, SM-2 review and personal flashcards.
- IndexedDB Smart Notes: Quick Capture, auto-save, Markdown/GFM/code highlighting,
  KaTeX, slash inserts, tags, context links, pins, wiki backlinks, full-text search,
  mistake review, selected-note printable cheat sheets, Markdown/ZIP export.
- Placement, goals, theme/font/Vim/sound/reduced-motion preferences, complete
  versioned backup import/export with validation and explicit replacement consent.
- Automatic Learning Log after lessons/Quick Learns/solves; confidence-aware
  promotion, milestones, editable career reports/resume drafts, STAR stories,
  prep-pack Markdown/print exports, local practice-record PNG/Markdown.
- Installable PWA with versioned application asset caching and explicit
  scientific-package preparation for offline use.

## Execution: real versus simulated

| Format                 | What actually happens                                                                                                                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JavaScript             | A disposable module Worker evaluates `solve(...args)` and checks JSON-compatible results.                                                                                                                                    |
| TypeScript             | The local TypeScript compiler transpiles inside the Worker, then executes JavaScript. It does **not** type-check user submissions.                                                                                           |
| Python                 | Pyodide 0.27.7 (CPython/WASM) runs in a Worker. NumPy loads by default; pandas/scikit-learn load only on designated AI exercises. Return JSON-serializable values (convert NumPy scalars/arrays with `.item()`/`.tolist()`). |
| SQL                    | sql.js SQLite/WASM, fresh seeded database per case, read-only query mode. Hidden cases change data to reject hardcoded seed answers.                                                                                         |
| Java                   | Prediction, output, fill, and semantics drills with exact authored answers. **No JVM/compiler is claimed.**                                                                                                                  |
| YAML                   | A real YAML parser rejects syntax/duplicate-key errors; authored paths/values are then checked.                                                                                                                              |
| Docker/Bash/HCL/design | Bounded text, sequencing, or keyword coverage rubrics only. No commands, containers, cloud resources, or distributed systems execute.                                                                                        |

Java viability was considered: [CheerpJ](https://cheerpj.com/docs/licensing.html)
supports Java bytecode, but its free CDN distribution does not provide this
project's redistributable, self-hosted offline runtime. [TeaVM](https://teavm.org/)
is an ahead-of-time bytecode compiler, not a drop-in arbitrary-source Java runner.
Reliable free offline source compilation would be a separate substantial engine.
Java remains a first-class drill language without pretending to execute it.

The optional local-model AI coach is **not implemented**. The app is fully usable
without one; authored questions do not make model requests.

### Isolation and honest limits

User code never evaluates on the UI thread. Worker startup has a bounded deadline
(120 seconds for Python downloads, 30 for TypeScript, 15 otherwise); once executing
user code, the parent enforces a five-second deadline and terminates the Worker.
Console capture is capped at 150 lines of 4,000 characters.

Workers have no page DOM, but are **not hardened hostile-code sandboxes**: browser
Workers can have origin/network capabilities. Do not paste untrusted code.
Browsers expose no reliable per-Worker memory limit, so an extreme allocation may
still exhaust the tab. Deadlines and errors handle ordinary loops/runtime
failures, not browser-process OOM. Hidden tests and references are shipped static
assets, hidden from the learning UI rather than protected from developer tools.
This is a personal learning tool, not an anti-cheat grading service.

Passing a static rubric demonstrates coverage of authored checks, not deployability,
security, semantic correctness of arbitrary prose, or professional competency.
Complexity targets are self-check comparisons, not measured asymptotic verification.
First solves earn XP; repeated solves/readings/cards do not farm rewards. Guided
questions do not reduce XP. Confidence can improve after an independent re-solve.

## Offline and privacy

After first online production load, the Service Worker caches the app, content,
editor chunks, and local Python/SQLite engines. Installation may take a moment.
Open **Settings → Prepare all engines for offline use** while online to cache NumPy,
pandas, scikit-learn, and their transitive wheels. The app reports failure rather
than pretending an incomplete download is ready. Package requests go only to the
version-pinned public Pyodide jsDelivr distribution. No code, answers, notes, or
progress are sent with them. NumPy normally caches on its first execution too.

Offline availability is per browser/origin. Browser cache eviction or clearing
site data removes it. Install from HTTPS or localhost; regular development mode
does not register a Service Worker. Use one editing tab to avoid last-writer
overwrites. Export backups before moving devices or deleting browser data.

## Scripts and checks

| Command                    | Purpose                                                                         |
| -------------------------- | ------------------------------------------------------------------------------- |
| `npm run typecheck`        | Strict application/tooling TypeScript                                           |
| `npm run lint`             | ESLint and hook rules                                                           |
| `npm test`                 | Scoring, evidence, SM-2, backups, content and spoiler tests                     |
| `npm run validate-content` | All JS/TS/Python/SQL references and static answers, metadata and spoiler checks |
| `npm run content:generate` | Collect drop-in extensions and materialize individual versioned JSON files      |
| `npm run test:e2e`         | Browser execution, coach/notes/review, evidence/export, responsive flows        |
| `npm run format`           | Format authored source/docs                                                     |
| `npm run format:check`     | Check formatting                                                                |

Install the test browser once with `npx playwright install chromium`.
To test the **production subpath and offline flow**, build first and set
`E2E_PREVIEW=1`:

```powershell
npm run build
$env:E2E_PREVIEW = '1'
npm run test:e2e
```

On POSIX: `E2E_PREVIEW=1 npm run test:e2e`. CI performs this check before publishing.
The validator uses Python's standard library only; set `PYTHON` to another Python
executable if it is not named `python`.

## Structure and content authoring

See [PLAN.md](PLAN.md) for architecture and
[docs/content-schema.md](docs/content-schema.md) for schemas and templates.

`src/content` holds the typed authored curriculum and career rules, separate from
UI. `public/content` contains individual generated problem/lesson/track JSON files.
Do not edit generated copies. For drop-in additions, place a problem JSON file in
`content/problems/` or lesson JSON in `content/lessons/`, then run
`npm run content:generate`. The collector creates typed imports in
`src/content/extensions.ts`; build validation rejects incomplete content,
duplicate IDs, broken links, failed references, and early coach leakage.

`src/engines` owns the shared Worker protocol; `src/core` owns persistence,
scheduling, scoring, notes, completion/evidence and exports. Routed pages and
reusable components live in `src/pages` and `src/components`.

## Publishing

The GitHub Actions workflow checks the build and uploads `dist` to GitHub Pages
from `main`. If the repository's Pages source is not already configured, choose
**Settings → Pages → Source: GitHub Actions** (automatic enablement can depend on
repository permissions). The intended Pages URL is
`https://reid-json.github.io/Geekcode/`.

For the existing portfolio hosting layout, copy `dist` to its
`public/apps/geekcode/` directory and add a project entry pointing to
`/apps/geekcode/index.html`. The app is prefix-independent. Serving it on a
different origin starts a separate local notebook; transfer through JSON backup.

## Evidence rules

Career generation uses real attempts, assistance, dates, languages, and notes.
Reading-only/Quick Learn records are marked `needs review`, not independent solve
evidence. Assisted solves stay out of resume promotion until independently
re-solved. Role weights, confidence thresholds, milestone thresholds, templates,
and readiness weights are documented in `src/content/career-rules.ts`.
Milestone reports are dated snapshots; live readiness recalculates with recency.
User edits are intentionally allowed, so review every exported claim yourself.
No metric is fabricated, `[X]` is retained for unmeasured personal-project outcomes,
and practice is never automatically labeled employment or production experience.

## Next five improvements

1. Broaden adversarial/property-based test cases and commission expert curriculum
   reviews, especially for static rubrics and hard DSA exercises.
2. Author deeper per-problem misconception ladders and extend novel Quick Learn
   transfer challenges beyond the 30 currently authored transfer cases.
3. Add a separately validated free/offline Java compiler/runtime if one becomes
   practical, without compromising licensing or startup reliability.
4. Add optional local-only model questions with strict output filtering, retaining
   authored fallbacks and never unlocking an unsolved reference.
5. Add stronger multi-tab synchronization, richer interactive diagrams, and
   performance profiling on lower-memory tablets.
