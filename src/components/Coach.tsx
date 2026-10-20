import { useState } from 'react';
import { Compass } from 'lucide-react';
import type { Problem } from '../content/schema';
import { checkInsight } from '../core/learning';
import { useStore } from '../core/store';
import { createNote } from '../core/notes';

export default function Coach({ problem }: { problem: Problem }) {
  const { progress, update } = useStore();
  const index = progress.coachStages[problem.id] ?? 0;
  const stage = problem.coach.stages[Math.min(index, problem.coach.stages.length - 1)];
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [selfCheck, setSelfCheck] = useState(false);
  const stuck = progress.help[problem.id]?.stuck ?? 0;
  function respond() {
    const assessment = checkInsight(answer, stage.insights);
    if (!assessment.passed && !selfCheck) {
      const follow =
        stage.followups.find((f) => assessment.missing.includes(f.missing)) ?? stage.followups[0];
      setFeedback(
        `${follow.question} The authored checker is limited; if your explanation covers the point in different words, use the self-check below.`,
      );
      return;
    }
    if (answer.trim().length < 20) {
      setFeedback('Write at least one meaningful sentence so your reasoning can be saved.');
      return;
    }
    update((p) => {
      const note = p.notes.find((n) => n.context === problem.id && n.tags.includes('reasoning'));
      const body = `\n\n## ${stage.id}\n${answer.trim()}`;
      if (note) {
        note.body += body;
        note.updated = new Date().toISOString();
      } else
        createNote(p, `# My reasoning: ${problem.title}${body}`, problem.id, problem.track, [
          'reasoning',
          problem.topic,
        ]);
      p.coachStages[problem.id] = Math.min(index + 1, problem.coach.stages.length);
    });
    setAnswer('');
    setFeedback('');
    setSelfCheck(false);
  }
  return (
    <section className="coach-card">
      <div className="section-heading">
        <span className="eyebrow">
          <Compass size={14} /> QUESTION-LED COACH
        </span>
        <span className="pill">{Math.min(index + 1, 9)} / 9</span>
      </div>
      <div className="stage-dots">
        {problem.coach.stages.map((s, i) => (
          <span key={s.id} className={i <= index ? 'filled' : ''} title={s.id} />
        ))}
      </div>
      {index >= problem.coach.stages.length ? (
        <>
          <h3>Your reasoning trail is saved.</h3>
          <p className="muted">
            Implement, test, and reflect in your own words. Passing tests unlocks comparison
            material; the coach never supplies the fix.
          </p>
        </>
      ) : (
        <>
          <h3>{stage.question}</h3>
          <textarea
            aria-label="Coach response"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Think it through in your own words…"
          />
          {feedback && <p className="coach-feedback">{feedback}</p>}
          {feedback && (
            <label className="small">
              <input
                type="checkbox"
                checked={selfCheck}
                onChange={(e) => setSelfCheck(e.target.checked)}
              />{' '}
              I checked the question honestly and my explanation covers it.
            </label>
          )}
          <button onClick={respond} className="primary">
            Capture insight & continue
          </button>
        </>
      )}
      <button
        className="text-button"
        onClick={() => {
          update((p) => {
            const help = (p.help[problem.id] ??= { hints: 0, stuck: 0 });
            help.stuck++;
            createNote(
              p,
              `I got stuck at ${stage.id}. Question to revisit: ${problem.coach.stuck[Math.min(stuck, 3)]}`,
              problem.id,
              problem.track,
              ['stuck', 'mistake', problem.topic],
            );
          });
          setFeedback(problem.coach.stuck[Math.min(stuck, 3)]);
        }}
      >
        I’m stuck — ask a smaller question
      </button>
      {stuck >= 3 && (
        <a className="lesson-link" href={`#/lesson/${problem.coach.prerequisites[0]}`}>
          Open the prerequisite lesson ↗
        </a>
      )}
    </section>
  );
}
