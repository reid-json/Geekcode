import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Play, Send, Square, ArrowLeft, Lightbulb, Code2, Clock3 } from 'lucide-react';
import type { Problem, Language, Mode } from '../content/schema';
import { runCode } from '../engines/runner';
import type { RunResult } from '../engines/protocol';
import { useStore } from '../core/store';
import { canShowEditorial } from '../core/learning';
import { completeProblem } from '../core/completion';
import { createNote } from '../core/notes';
import NotesPanel, { QuickCapture, useNotesShortcut } from '../components/NotesPanel';
import Coach from '../components/Coach';
import Markdown from '../components/Markdown';

const CodeEditor = lazy(() => import('../components/CodeEditor'));
export default function Workspace({ problem }: { problem: Problem }) {
  const { progress, update, notify } = useStore();
  const [language, setLanguage] = useState<Language>(() => {
    const preferred = progress.languages[problem.track] ?? progress.settings.language;
    return problem.languages.includes(preferred) ? preferred : problem.languages[0];
  });
  const draftKey = `${problem.id}:${language}`;
  const code = progress.drafts[draftKey] ?? problem.starter[language] ?? '';
  const mode = progress.modes[problem.track] ?? 'guided';
  const [result, setResult] = useState<RunResult>();
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<'tests' | 'console'>('tests');
  const [descriptionTab, setDescriptionTab] = useState<'problem' | 'editorial'>('problem');
  const [notesOpen, setNotesOpen] = useState(false);
  const [hint, setHint] = useState('');
  const [remaining, setRemaining] = useState(25 * 60);
  const [ended, setEnded] = useState(false);
  const [timeCost, setTimeCost] = useState('');
  const [spaceCost, setSpaceCost] = useState('');
  const [costFeedback, setCostFeedback] = useState('');
  const controller = useRef<AbortController | undefined>(undefined);
  const opened = useRef(Date.now());
  const busyRef = useRef(false);
  const alive = useRef(true);
  const toggleNotes = useCallback(() => setNotesOpen((v) => !v), []);
  useNotesShortcut(toggleNotes);
  useEffect(() => {
    alive.current = true;
    update((p) => {
      p.lastProblem = problem.id;
    });
    return () => {
      alive.current = false;
      controller.current?.abort();
    };
  }, [problem.id, update]);
  useEffect(() => {
    if (mode !== 'interview' || ended) return;
    const timer = setInterval(() => setRemaining((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(timer);
  }, [mode, ended]);
  useEffect(() => {
    if (mode === 'interview' && remaining === 0 && !ended) {
      controller.current?.abort();
      setEnded(true);
      update((p) => {
        completeProblem(p, problem, {
          passed: false,
          language,
          mode,
          elapsed: 25 * 60000,
          runtime: 0,
        });
      });
      notify('Time is up. Your honest debrief is saved in Career.');
    }
  }, [mode, remaining, ended, language, notify, problem, update]);
  function changeMode(next: Mode) {
    if (busy) return;
    update((p) => {
      p.modes[problem.track] = next;
      if (next === 'interview') p.help[problem.id] = { hints: 0, stuck: 0 };
    });
    setDescriptionTab('problem');
    setRemaining(25 * 60);
    setEnded(false);
    setHint('');
    opened.current = Date.now();
  }
  async function execute(submit: boolean) {
    if (busyRef.current || ended) return;
    busyRef.current = true;
    setBusy(true);
    setResult(undefined);
    controller.current = new AbortController();
    try {
      const value = await runCode(
        problem,
        language,
        code,
        submit,
        setStatus,
        controller.current.signal,
      );
      if (!alive.current) return;
      setResult(value);
      if (submit) {
        const passed = !value.error && value.tests.length > 0 && value.tests.every((t) => t.passed);
        let earned = 0;
        let milestones = 0;
        update((p) => {
          const completed = completeProblem(p, problem, {
            passed,
            language,
            mode,
            elapsed: Date.now() - opened.current,
            runtime: value.runtime,
          });
          earned = completed.xp;
          milestones = completed.reports.length;
        });
        if (mode === 'interview') setEnded(true);
        notify(
          passed
            ? `+${earned} XP · Added to your Learning Log: ${problem.topic}${milestones ? ' · Milestone report ready in Career' : ''}`
            : 'Not yet. Trace the first failing case; no fix is supplied.',
        );
        if (passed && progress.settings.sound) {
          const context = new AudioContext();
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          gain.gain.setValueAtTime(0.04, context.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);
          oscillator.frequency.value = 660;
          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.start();
          oscillator.stop(context.currentTime + 0.2);
          oscillator.onended = () => void context.close();
        }
      }
    } catch (error) {
      if (alive.current)
        setResult({
          tests: [],
          console: [],
          runtime: 0,
          error: error instanceof Error ? error.message : String(error),
        });
    } finally {
      busyRef.current = false;
      if (alive.current) setBusy(false);
    }
  }
  const help = progress.help[problem.id] ?? { hints: 0, stuck: 0 };
  const solved = !!progress.solved[problem.id];
  const editableCode =
    ['javascript', 'typescript', 'python', 'sql', 'yaml'].includes(language) && !problem.answer;
  const canEditorial = canShowEditorial(solved, mode);
  const failed = result && (!!result.error || result.tests.some((t) => !t.passed));
  return (
    <div className="workspace">
      <div className="workspace-top">
        <a href="#/problems">
          <ArrowLeft size={16} /> Problem library
        </a>
        <span>
          {problem.track.toUpperCase()} / {problem.topic}
        </span>
        <span className="pill">{problem.difficulty}</span>
        <div className="mode-switch" aria-label="Practice mode">
          {(['guided', 'practice', 'interview'] as const).map((m) => (
            <button key={m} aria-pressed={mode === m} disabled={busy} onClick={() => changeMode(m)}>
              {m}
            </button>
          ))}
        </div>
        {mode === 'interview' && (
          <span className="timer">
            <Clock3 size={14} />
            {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
          </span>
        )}
      </div>
      <div className="workspace-grid">
        <section className="problem-pane">
          <div className="tabs">
            <button
              className={descriptionTab === 'problem' ? 'selected' : ''}
              onClick={() => setDescriptionTab('problem')}
            >
              Challenge
            </button>
            {canEditorial && (
              <button
                className={descriptionTab === 'editorial' ? 'selected' : ''}
                onClick={() => setDescriptionTab('editorial')}
              >
                Editorial & comparison
              </button>
            )}
          </div>
          {descriptionTab === 'editorial' && canEditorial ? (
            <>
              <Markdown>{problem.editorial}</Markdown>
              <h3>Verified reference — compare after your solve</h3>
              <pre>{problem.reference[language]}</pre>
              <button
                onClick={() => {
                  const quote = window.getSelection()?.toString();
                  if (!quote?.trim()) {
                    notify('Select some editorial text first.');
                    return;
                  }
                  update((p) => {
                    createNote(
                      p,
                      `> ${quote}\n\nSource: [${problem.title}](#/problem/${problem.id})`,
                      problem.id,
                      problem.track,
                      [problem.topic],
                    );
                  });
                  setNotesOpen(true);
                }}
              >
                Add selected quote to notes
              </button>
            </>
          ) : (
            <>
              <span className="eyebrow">THE CHALLENGE {solved ? ' / SOLVED' : ''}</span>
              <h1>{problem.title}</h1>
              <Markdown>{problem.description}</Markdown>
              {problem.choices && (
                <div className="choice-list">
                  {problem.choices.map((choice) => (
                    <label key={choice}>
                      <input
                        type={problem.kind === 'multi-select' ? 'checkbox' : 'radio'}
                        name="answer"
                        checked={code.split('\n').includes(choice)}
                        onChange={(e) => {
                          const next =
                            problem.kind === 'multi-select'
                              ? (e.target.checked
                                  ? [...code.split('\n').filter(Boolean), choice]
                                  : code.split('\n').filter((x) => x !== choice)
                                ).join('\n')
                              : choice;
                          update((p) => {
                            p.drafts[draftKey] = next;
                          });
                        }}
                      />
                      {choice}
                    </label>
                  ))}
                </div>
              )}
              {!problem.answer && problem.tests.some((t) => !t.hidden) && (
                <>
                  <h3>Visible cases</h3>
                  {problem.tests
                    .filter((t) => !t.hidden)
                    .map((t, i) => (
                      <pre key={i}>
                        Input: {JSON.stringify(t.args)}
                        {'\n'}Output: {JSON.stringify(t.expected)}
                      </pre>
                    ))}
                </>
              )}
              {mode === 'guided' && <Coach problem={problem} />}
              {mode === 'practice' && (
                <div className="coach-card">
                  <h3>
                    <Lightbulb size={15} /> Questions, not spoilers
                  </h3>
                  <p>
                    {hint ||
                      'A nudge costs 8 XP from your eventual solve reward. Guided questions are always free.'}
                  </p>
                  <button
                    onClick={() => {
                      if (help.hints >= 3) {
                        notify(
                          'No spoiler tier. Switch to Guided or revisit the prerequisite lesson.',
                        );
                        return;
                      }
                      setHint(problem.hints[help.hints]);
                      update((p) => {
                        const h = (p.help[problem.id] ??= { hints: 0, stuck: 0 });
                        h.hints++;
                      });
                    }}
                  >
                    Ask a question ({Math.min(help.hints, 3)}/3 used)
                  </button>
                  <a href={`#/lesson/${problem.coach.prerequisites[0]}`}>Prerequisite ↗</a>
                </div>
              )}
              {!canEditorial && (
                <p className="muted small">
                  Comparison material unlocks only after your solution passes. It is disabled during
                  interviews.
                </p>
              )}
            </>
          )}
        </section>
        <section className="editor-pane">
          <div className="editor-toolbar">
            <label>
              Language{' '}
              <select
                aria-label="Language"
                value={language}
                onChange={(e) => {
                  const next = problem.languages.find((l) => l === e.target.value);
                  if (!next) return;
                  setLanguage(next);
                  setResult(undefined);
                  update((p) => {
                    p.languages[problem.track] = next;
                  });
                }}
                disabled={busy}
              >
                {problem.languages.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            <span className="muted">
              {editableCode && language !== 'yaml'
                ? 'Disposable Worker • local execution'
                : 'STATIC / AUTHORED CHECK'}
            </span>
            <button
              title="Save current code as a note"
              aria-label="Save snippet"
              onClick={() => {
                update((p) => {
                  createNote(
                    p,
                    `# Snippet: ${problem.title}\n\n\`\`\`${language}\n${code}\n\`\`\``,
                    problem.id,
                    problem.track,
                    [language, problem.topic],
                  );
                });
                notify('Snippet saved to linked notes.');
              }}
            >
              <Code2 size={15} />
            </button>
          </div>
          {editableCode ? (
            <Suspense fallback={<div className="loading">Loading editor…</div>}>
              <CodeEditor
                code={code}
                language={language}
                onChange={(next) =>
                  update((p) => {
                    p.drafts[draftKey] = next;
                  })
                }
              />
            </Suspense>
          ) : (
            <textarea
              className="answer-editor"
              aria-label="Authored answer"
              value={code}
              onChange={(e) =>
                update((p) => {
                  p.drafts[draftKey] = e.target.value;
                })
              }
              placeholder="Write your answer, exact output lines, ordered commands, or structured design here. No code is executed for this exercise."
            />
          )}
          <div className="run-toolbar">
            <span className="muted">
              {busy
                ? status
                : `${problem.tests.length} authored cases • ${solved ? 'Solved' : 'Ready when you are'}`}
            </span>
            {busy ? (
              <button onClick={() => controller.current?.abort()}>
                <Square size={15} /> Stop
              </button>
            ) : (
              <>
                <button disabled={ended} onClick={() => void execute(false)}>
                  <Play size={15} /> Run examples
                </button>
                <button className="primary" disabled={ended} onClick={() => void execute(true)}>
                  <Send size={15} /> Submit
                </button>
              </>
            )}
          </div>
          {ended && (
            <div className="banner">
              Interview ended. <a href="#/career">Read your debrief ↗</a> or switch mode to continue
              practicing.
            </div>
          )}
          <div className="tabs">
            <button onClick={() => setTab('tests')} className={tab === 'tests' ? 'selected' : ''}>
              Tests{' '}
              {result
                ? `${result.tests.filter((t) => t.passed).length}/${result.tests.length}`
                : ''}
            </button>
            <button
              onClick={() => setTab('console')}
              className={tab === 'console' ? 'selected' : ''}
            >
              Console / output
            </button>
          </div>
          <div className="results" aria-live="polite">
            {tab === 'console' ? (
              <pre>{result?.console.join('\n') || 'No console output captured.'}</pre>
            ) : (
              <>
                <h3>Test results</h3>
                {!result && <p className="muted">Your next insight starts with a test.</p>}
                {result?.error && <pre className="error">{result.error}</pre>}
                {result?.tests.map((t, i) => (
                  <details key={i} open={!t.passed}>
                    <summary className={t.passed ? 'success' : 'error'}>
                      {t.passed ? 'PASS' : 'FAIL'} {t.label} <span>{t.runtime.toFixed(1)} ms</span>
                    </summary>
                    <pre>
                      Input: {JSON.stringify(t.input)}
                      {'\n'}Expected: {JSON.stringify(t.expected)}
                      {'\n'}Actual: {JSON.stringify(t.actual)}
                      {t.error && `\n${t.error}`}
                    </pre>
                  </details>
                ))}
              </>
            )}
          </div>
          {failed && (
            <div className="debug-tools">
              <h3>Why did I miss this?</h3>
              <button
                onClick={() => {
                  update((p) => {
                    createNote(
                      p,
                      `# Mistake: ${problem.title}\n\n## What I tried\n\n## What the bug was\n\n## Pattern I missed\n\n## How to spot it next time\n`,
                      problem.id,
                      problem.track,
                      ['mistake', problem.topic],
                    );
                  });
                  setNotesOpen(true);
                }}
              >
                Capture a mistake review
              </button>
              <details>
                <summary>Trace table — find the first divergence</summary>
                <textarea
                  aria-label="Trace table"
                  placeholder="Step | Input | Expected state | Actual state\n1 | ... | ... | ..."
                />
              </details>
            </div>
          )}
          {mode !== 'interview' && (
            <details className="complexity-check">
              <summary>Complexity self-check</summary>
              <div className="button-row">
                <input
                  aria-label="Time complexity"
                  placeholder="Time, e.g. O(n)"
                  value={timeCost}
                  onChange={(e) => setTimeCost(e.target.value)}
                />
                <input
                  aria-label="Space complexity"
                  placeholder="Extra space"
                  value={spaceCost}
                  onChange={(e) => setSpaceCost(e.target.value)}
                />
                <button
                  onClick={() =>
                    setCostFeedback(
                      solved
                        ? `Target time: ${problem.complexity.time}; space: ${problem.complexity.space}. Compare assumptions; this is not runtime proof.`
                        : 'Write why each cost grows with input. Targets unlock after a passing solve to avoid revealing the approach.',
                    )
                  }
                >
                  Compare
                </button>
              </div>
              <p>{costFeedback}</p>
            </details>
          )}
        </section>
      </div>
      <QuickCapture
        context={problem.id}
        track={problem.track}
        topic={problem.topic}
        onOpen={() => setNotesOpen(true)}
      />
      <NotesPanel
        context={problem.id}
        track={problem.track}
        topic={problem.topic}
        open={notesOpen}
        onClose={() => setNotesOpen(false)}
      />
    </div>
  );
}
