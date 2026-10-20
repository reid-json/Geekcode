import { useState } from 'react';
import { tracks } from '../content';
import { useStore } from '../core/store';

const questions = [
  {
    track: 'dsa',
    question:
      'A loop pushes each item once and pops it at most once. Total stack operations for n items?',
    options: ['O(n)', 'O(n²)', 'O(log n)'],
    answer: 0,
    why: 'Count total operations, not the visual nesting of loops.',
  },
  {
    track: 'syntax',
    question: 'What does volatile guarantee for a Java field?',
    options: [
      'Atomic compound increments',
      'Visibility and ordering of reads/writes',
      'Mutual exclusion',
    ],
    answer: 1,
    why: 'Visibility is not compound atomicity.',
  },
  {
    track: 'devops',
    question: 'What does Kubernetes readiness failure normally affect?',
    options: ['Traffic eligibility', 'Always deletes the Pod', 'Rebuilds the image'],
    answer: 0,
    why: 'Readiness gates endpoints; liveness is a different control.',
  },
  {
    track: 'ai',
    question: 'A model has 99% accuracy on a 1%-positive dataset. What must you inspect?',
    options: [
      'Only training loss',
      'Precision/recall and confusion counts',
      'Only parameter count',
    ],
    answer: 1,
    why: 'An all-negative predictor already reaches 99% accuracy.',
  },
  {
    track: 'sql',
    question:
      'What counts employees after a LEFT JOIN while preserving zero for an empty department?',
    options: ['COUNT(*)', 'COUNT(employee.id)', 'SUM(department.id)'],
    answer: 1,
    why: 'The null-extended row exists, but employee.id is null.',
  },
  {
    track: 'systems',
    question: 'A worker crashes after charging but before acknowledgement. What protects a retry?',
    options: [
      'An in-memory counter only',
      'Idempotency at the durable side-effect boundary',
      'A faster queue',
    ],
    answer: 1,
    why: 'Repeated delivery must not repeat the charge.',
  },
] as const;
export default function Placement() {
  const { update, notify } = useStore();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);
  return (
    <main className="placement-page">
      <span className="eyebrow">CALIBRATE, DON’T COMPETE</span>
      <h1>
        Find your <em>starting point.</em>
      </h1>
      <p className="lead">
        Six short checks, one per track. Allow 5–10 minutes to explain your choices. This placement
        recommends a starting level, never awards unearned solves.
      </p>
      {questions.map((q, i) => (
        <section className="card" key={q.track}>
          <span className="eyebrow">{tracks.find((t) => t.id === q.track)?.short}</span>
          <h2>{q.question}</h2>
          <div className="choice-list">
            {q.options.map((option, j) => (
              <label key={option}>
                <input
                  type="radio"
                  name={`placement-${i}`}
                  checked={answers[i] === j}
                  disabled={done}
                  onChange={() => setAnswers({ ...answers, [i]: j })}
                />
                {option}
              </label>
            ))}
          </div>
          <textarea
            aria-label={`Placement rationale ${i + 1}`}
            placeholder="Explain why you chose that answer. Self-explanation is not automatically graded."
          />
          {done && (
            <p className={answers[i] === q.answer ? 'success' : 'muted'}>
              {answers[i] === q.answer ? 'Good foundation.' : 'Start with the refresher.'} {q.why}
            </p>
          )}
        </section>
      ))}
      <div className="button-row">
        <button
          className="primary"
          disabled={Object.keys(answers).length !== questions.length || done}
          onClick={() => {
            update((p) => {
              questions.forEach((q, i) => {
                p.placement[q.track] = answers[i] === q.answer ? 2 : 1;
              });
              p.onboarding = true;
            });
            setDone(true);
            notify('Placement saved. Set your role and time budget in Settings.');
          }}
        >
          Save placement
        </button>
        <a className="action-link" href="#/settings">
          Set goals & time budget ↗
        </a>
        <a
          href="#/"
          onClick={() =>
            update((p) => {
              p.onboarding = true;
            })
          }
        >
          Skip placement
        </a>
      </div>
    </main>
  );
}
