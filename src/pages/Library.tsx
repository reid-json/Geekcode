import { useCallback, useState } from 'react';
import { ArrowUpRight, BookOpen, Check, Lock, Search } from 'lucide-react';
import { lessons, problems, tracks } from '../content';
import type { Lesson, TrackId } from '../content/schema';
import { useStore } from '../core/store';
import { completeLesson } from '../core/completion';
import { createNote, noteToCard } from '../core/notes';
import { TrackFilter } from './Problems';
import Markdown from '../components/Markdown';
import NotesPanel, { QuickCapture, useNotesShortcut } from '../components/NotesPanel';

export default function Library({
  glossary = false,
  cheats = false,
}: {
  glossary?: boolean;
  cheats?: boolean;
}) {
  const [track, setTrack] = useState<TrackId | 'all'>('all');
  const [search, setSearch] = useState('');
  const progress = useStore((s) => s.progress);
  const pool = lessons.filter(
    (l) =>
      (track === 'all' || l.track === track) &&
      `${l.title} ${l.body}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <main>
      <div className="page-heading">
        <div>
          <span className="eyebrow">UNDERSTAND THE WHY</span>
          <h1>
            {glossary ? 'Concept ' : cheats ? 'The field ' : 'The study '}
            <em>{glossary ? 'glossary.' : cheats ? 'manual.' : 'library.'}</em>
          </h1>
          <p className="muted">
            {lessons.length} authored lessons · {lessons.length} prediction-first Quick Learns · no
            decorative filler.
          </p>
        </div>
        <div className="button-row">
          <a href="#/library">Lessons</a>
          <a href="#/glossary">Glossary</a>
          <a href="#/cheatsheets">Cheat sheets</a>
          {cheats && <button onClick={() => window.print()}>Print / PDF</button>}
        </div>
      </div>
      <div className="filters">
        <label className="search-field">
          <Search size={16} />
          <input
            aria-label="Search library"
            placeholder="Search concepts, examples, and mistakes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <TrackFilter value={track} onChange={setTrack} />
      </div>
      {glossary || cheats ? (
        <div className="glossary-grid">
          {pool.map((lesson) => (
            <article className="card" key={lesson.id}>
              <span className="eyebrow">{tracks.find((t) => t.id === lesson.track)?.short}</span>
              <h2>
                <a href={`#/lesson/${lesson.id}`}>{lesson.title} ↗</a>
              </h2>
              <Markdown>{lesson.cards[cheats ? 3 : 0].back}</Markdown>
              {cheats && (
                <>
                  <h3>Watch for</h3>
                  <Markdown>{lesson.cards[2].back}</Markdown>
                </>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="lesson-grid">
          {pool.map((lesson) => (
            <a className="card lesson-card" key={lesson.id} href={`#/lesson/${lesson.id}`}>
              <div className="section-heading">
                <BookOpen size={20} />
                <span className="pill">
                  {progress.completedLessons.includes(lesson.id) ? 'READ' : `${lesson.minutes} MIN`}
                </span>
              </div>
              <span className="eyebrow">{tracks.find((t) => t.id === lesson.track)?.short}</span>
              <h2>{lesson.title}</h2>
              <p>{lesson.cards[0].back.slice(0, 160)}…</p>
              <span className="action-link small">
                Open the mental model <ArrowUpRight size={15} />
              </span>
            </a>
          ))}
        </div>
      )}
      {!pool.length && <p className="empty">No concepts match that search.</p>}
    </main>
  );
}
export function LessonReader({ lesson }: { lesson: Lesson }) {
  const { progress, update, notify } = useStore();
  const [notesOpen, setNotesOpen] = useState(false);
  const [quick, setQuick] = useState(false);
  const [checks, setChecks] = useState(false);
  const toggle = useCallback(() => setNotesOpen((v) => !v), []);
  useNotesShortcut(toggle);
  return (
    <>
      <main className="lesson-layout">
        <article className="lesson-reader">
          <a className="back-link" href="#/library">
            ← Study library
          </a>
          <span className="eyebrow">
            {tracks.find((t) => t.id === lesson.track)?.title} / {lesson.minutes} MIN READ
          </span>
          <h1>{lesson.title}</h1>
          <div className="button-row">
            <button className={quick ? 'primary' : ''} onClick={() => setQuick(!quick)}>
              {quick ? 'Back to full lesson' : 'Quick Learn · predict first'}
            </button>
            <button onClick={() => setNotesOpen(true)}>My notes</button>
            <button
              onClick={() => {
                const quote = window.getSelection()?.toString();
                if (!quote?.trim()) {
                  notify('Highlight some lesson text first, then capture it.');
                  return;
                }
                update((p) => {
                  createNote(
                    p,
                    `> ${quote}\n\nSource: [${lesson.title}](#/lesson/${lesson.id})`,
                    lesson.id,
                    lesson.track,
                    [lesson.topic, 'quote'],
                  );
                });
                setNotesOpen(true);
              }}
            >
              Add selected text to notes
            </button>
          </div>
          {quick ? (
            <QuickLearn lesson={lesson} />
          ) : (
            <>
              <div
                className="concept-diagram"
                role="img"
                aria-label={lesson.diagram.join(' then ')}
              >
                {lesson.diagram.map((label, i) => (
                  <div key={label}>
                    <span>{label}</span>
                    {i < lesson.diagram.length - 1 && <b aria-hidden="true">→</b>}
                  </div>
                ))}
              </div>
              <Markdown>{lesson.body}</Markdown>
              <div className="coach-card">
                <h3>Before you move on</h3>
                <p>{lesson.coach.stages[0].question}</p>
                <textarea
                  aria-label="Lesson reasoning"
                  placeholder="Capture the rule and one boundary case in your own words."
                  value={progress.drafts[`lesson-reasoning:${lesson.id}`] ?? ''}
                  onChange={(e) =>
                    update((p) => {
                      p.drafts[`lesson-reasoning:${lesson.id}`] = e.target.value;
                    })
                  }
                />
                <label className="small">
                  <input
                    type="checkbox"
                    checked={checks}
                    onChange={(e) => setChecks(e.target.checked)}
                  />{' '}
                  I worked through the example and checked the lesson’s self-check rubric.
                </label>
                <button
                  className="primary"
                  disabled={!checks}
                  onClick={() => {
                    let added = false;
                    update((p) => {
                      const words = p.drafts[`lesson-reasoning:${lesson.id}`] ?? '';
                      if (
                        words.trim().length >= 20 &&
                        !p.notes.some(
                          (n) => n.context === lesson.id && n.tags.includes('reasoning'),
                        )
                      )
                        createNote(p, words, lesson.id, lesson.track, ['reasoning', lesson.topic]);
                      added = completeLesson(p, lesson.id, false, words);
                    });
                    notify(
                      added
                        ? `+15 XP · Added to your Learning Log: ${lesson.topic}`
                        : 'This reading completion is already recorded.',
                    );
                  }}
                >
                  {progress.completedLessons.includes(lesson.id)
                    ? 'Lesson completed'
                    : 'Mark lesson complete'}
                </button>
              </div>
            </>
          )}
        </article>
        <aside className="lesson-aside">
          <div className="card">
            <span className="eyebrow">PUT IT INTO PRACTICE</span>
            {lesson.related.length ? (
              lesson.related.map((id) => (
                <a key={id} href={`#/problem/${id}`}>
                  {problems.find((p) => p.id === id)?.title}
                  <ArrowUpRight size={14} />
                </a>
              ))
            ) : (
              <p className="small muted">
                Use the Quick Learn challenge to apply this concept, then explore nearby track
                exercises.
              </p>
            )}
            <a href={`#/problems?track=${lesson.track}`}>
              Browse this track <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="card">
            <h3>Keep it with you</h3>
            <p className="small muted">
              Five review cards from this lesson are available in spaced review. Your personal
              explanation can become a sixth.
            </p>
            <a href="#/review">Open review queue ↗</a>
          </div>
        </aside>
      </main>
      <QuickCapture
        context={lesson.id}
        track={lesson.track}
        topic={lesson.topic}
        onOpen={() => setNotesOpen(true)}
      />
      <NotesPanel
        context={lesson.id}
        track={lesson.track}
        topic={lesson.topic}
        open={notesOpen}
        onClose={() => setNotesOpen(false)}
      />
    </>
  );
}
function QuickLearn({ lesson }: { lesson: Lesson }) {
  const { progress, update, notify } = useStore();
  const [step, setStep] = useState(0);
  const [prediction, setPrediction] = useState(
    progress.drafts[`quick-prediction:${lesson.id}`] ?? '',
  );
  const [words, setWords] = useState(progress.drafts[`quick-words:${lesson.id}`] ?? '');
  const [answer, setAnswer] = useState('');
  const [selfCheck, setSelfCheck] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [noteId, setNoteId] = useState('');
  return (
    <section className="quick-learn">
      <span className="eyebrow">QUICK LEARN / PREDICT → OBSERVE → EXPLAIN</span>
      {step === 0 && (
        <>
          <h2>Make a prediction.</h2>
          <p>{lesson.quick.scenario}</p>
          <input
            aria-label="Quick Learn prediction"
            value={prediction}
            onChange={(e) => {
              setPrediction(e.target.value);
              update((p) => {
                p.drafts[`quick-prediction:${lesson.id}`] = e.target.value;
              });
            }}
            placeholder="Commit to a prediction before observing."
          />
          <button className="primary" disabled={!prediction.trim()} onClick={() => setStep(1)}>
            Observe the scenario
          </button>
        </>
      )}
      {step === 1 && (
        <>
          <h2>Compare with the observation.</h2>
          <p>
            Your prediction: <strong>{prediction}</strong>
          </p>
          <p>
            Observed result: <strong>{lesson.quick.prediction}</strong>
          </p>
          <p>
            {prediction.trim().toLowerCase() === lesson.quick.prediction.toLowerCase()
              ? 'Your prediction matches. What rule explains it?'
              : 'Where does your hand-trace first differ? Try the smallest possible version before explaining.'}
          </p>
          <h3>Explain why, in your own words.</h3>
          <textarea
            aria-label="Quick Learn explanation"
            value={words}
            onChange={(e) => {
              setWords(e.target.value);
              update((p) => {
                p.drafts[`quick-words:${lesson.id}`] = e.target.value;
              });
            }}
            placeholder="What did you expect? What changed? State the rule and when it would fail."
          />
          <label className="small">
            <input
              type="checkbox"
              checked={selfCheck}
              onChange={(e) => setSelfCheck(e.target.checked)}
            />{' '}
            My explanation connects the observation to a rule and names one limitation.
          </label>
          <button
            className="primary"
            disabled={words.trim().length < 40 || !selfCheck}
            onClick={() => setStep(2)}
          >
            Apply the rule
          </button>
        </>
      )}
      {step === 2 && (
        <>
          <h2>Teach it back, then apply it.</h2>
          <p>{lesson.quick.challenge}</p>
          <input
            aria-label="Quick Learn challenge answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          {feedback && <p>{feedback}</p>}
          <button
            className="primary"
            onClick={() => {
              if (answer.trim().toLowerCase() !== lesson.quick.answer.toLowerCase()) {
                setFeedback(
                  'Trace the same scenario again one step at a time. Which assumption differs from your rule?',
                );
                return;
              }
              let added = false;
              update((p) => {
                const existing = p.notes.find(
                  (n) => n.context === lesson.id && n.tags.includes('quick-learn'),
                );
                if (existing) setNoteId(existing.id);
                else
                  setNoteId(
                    createNote(
                      p,
                      `# My rule: ${lesson.title}\n\nPrediction: ${prediction}\n\n${words}`,
                      lesson.id,
                      lesson.track,
                      ['quick-learn', 'reasoning', lesson.topic],
                    ).id,
                  );
                added = completeLesson(p, lesson.id, true, words);
              });
              notify(
                added
                  ? `+20 XP · Quick Learn added to your Learning Log: ${lesson.topic}`
                  : 'Quick Learn was already recorded; your explanation is kept.',
              );
              setStep(3);
            }}
          >
            Check my application
          </button>
        </>
      )}
      {step === 3 && (
        <>
          <h2>Your rule, in your words.</h2>
          <Markdown>{words}</Markdown>
          <p className="muted small">
            This summary is your explanation, not a generated model answer. Your self-check is
            evidence of reflection, not an independent solve.
          </p>
          <button
            onClick={() => {
              try {
                update((p) => {
                  const note = p.notes.find((n) => n.id === noteId);
                  if (note) noteToCard(p, note);
                });
                notify('Your explanation is in spaced review.');
              } catch (e) {
                notify(String(e));
              }
            }}
          >
            Turn my explanation into a flashcard
          </button>
        </>
      )}
    </section>
  );
}
export function Roadmap() {
  const { progress } = useStore();
  return (
    <main>
      <span className="eyebrow">A MAP, NOT A RACE</span>
      <h1>
        Build on <em>what sticks.</em>
      </h1>
      <p className="lead">
        Nodes unlock after the preceding lesson. The library remains freely browsable; placement
        recommends a starting level without claiming mastery.
      </p>
      {tracks.map((track) => (
        <section key={track.id} className="roadmap-track">
          <div className="section-heading">
            <h2>{track.title}</h2>
            <span className="pill">Placement {progress.placement[track.id] ?? 'not assessed'}</span>
          </div>
          <div className="roadmap-nodes">
            {lessons
              .filter((l) => l.track === track.id)
              .map((lesson) => {
                const complete = progress.completedLessons.includes(lesson.id);
                const unlocked =
                  complete ||
                  lesson.prerequisites.every((id) => progress.completedLessons.includes(id));
                const pool = problems.filter(
                  (p) => p.topic === lesson.topic && p.track === track.id,
                );
                const mastery = pool.length
                  ? Math.round(
                      (pool.filter((p) => progress.solved[p.id]).length / pool.length) * 100,
                    )
                  : 0;
                return (
                  <div
                    key={lesson.id}
                    className={`roadmap-node ${complete ? 'complete' : ''} ${unlocked ? '' : 'locked'}`}
                  >
                    {complete ? (
                      <Check size={18} />
                    ) : unlocked ? (
                      <BookOpen size={18} />
                    ) : (
                      <Lock size={18} />
                    )}
                    <strong>{lesson.title}</strong>
                    <span className="tiny muted">{mastery}% exercise mastery</span>
                    {unlocked ? (
                      <a href={`#/lesson/${lesson.id}`}>Open lesson ↗</a>
                    ) : (
                      <span className="tiny muted">Complete prior node</span>
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      ))}
    </main>
  );
}
