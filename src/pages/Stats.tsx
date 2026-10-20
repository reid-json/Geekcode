import { problems, tracks } from '../content';
import { useStore } from '../core/store';
import { independence, shiftedDay, dayKey } from '../core/learning';
import { ActivityMap, badges } from './Dashboard';

export default function Stats() {
  const progress = useStore((s) => s.progress);
  const passed = progress.attempts.filter((a) => a.passed);
  const byTopic = [...new Set(problems.map((p) => p.topic))].map((topic) => {
    const ids = problems.filter((p) => p.topic === topic).map((p) => p.id);
    const attempts = progress.attempts.filter((a) => ids.includes(a.problemId));
    return {
      topic,
      count: ids.filter((id) => progress.solved[id]).length,
      total: ids.length,
      rate: attempts.length
        ? Math.round((100 * attempts.filter((a) => a.passed).length) / attempts.length)
        : 0,
    };
  });
  return (
    <main>
      <span className="eyebrow">YOUR PROGRESS, WITHOUT THE FICTION</span>
      <h1>
        The work <em>adds up.</em>
      </h1>
      <div className="stats-grid">
        <section className="card">
          <h3>Activity / last 26 weeks</h3>
          <ActivityMap />
          <p className="tiny muted">
            {Object.keys(progress.activity).length} active days · {progress.freezeDates.length}{' '}
            frozen days
          </p>
        </section>
        <section className="card">
          <h3>Submission quality</h3>
          <strong className="big-number">
            {progress.attempts.length
              ? Math.round((passed.length / progress.attempts.length) * 100)
              : 0}
            %
          </strong>
          <p className="muted">
            {passed.length} passing / {progress.attempts.length} submissions
          </p>
          <p>Independence: {independence(progress.attempts)}%</p>
        </section>
      </div>
      <div className="stats-grid">
        <section className="card">
          <h3>XP over the last 14 days</h3>
          <div className="bar-chart">
            {Array.from({ length: 14 }, (_, i) => shiftedDay(dayKey(), i - 13)).map((date) => {
              const total = progress.attempts
                .filter((a) => a.date.startsWith(date))
                .reduce((s, a) => s + a.xp, 0);
              return (
                <div key={date} title={`${date}: ${total} solve XP`}>
                  <span style={{ height: `${Math.min(100, total / 3)}%` }} />
                  <small>{date.slice(-2)}</small>
                </div>
              );
            })}
          </div>
          <p className="tiny muted">
            Solve XP only; lesson/card/note bonuses are included in your overall XP.
          </p>
        </section>
        <section className="card">
          <h3>Recent time-per-solve trend</h3>
          {passed.slice(-8).map((a) => (
            <div className="metric-row" key={a.id}>
              <span>{problems.find((p) => p.id === a.problemId)?.title ?? a.problemId}</span>
              <span>{(a.elapsed / 60000).toFixed(1)} min</span>
            </div>
          ))}
          {!passed.length && (
            <p className="empty">Your first passing submission starts the chart.</p>
          )}
        </section>
      </div>
      <section className="card">
        <h2>Topic mastery & submission pass rate</h2>
        <div className="topic-stats">
          {byTopic.map((t) => (
            <div key={t.topic}>
              <div className="section-heading small">
                <span>{t.topic}</span>
                <span>
                  {t.count}/{t.total} · {t.rate}% pass
                </span>
              </div>
              <div className="progress-bar">
                <span style={{ width: `${(t.count / t.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="card">
        <h2>Difficulty distribution</h2>
        <div className="button-row">
          {['Easy', 'Medium', 'Hard'].map((d) => (
            <span key={d} className="pill">
              {d}: {problems.filter((p) => p.difficulty === d && progress.solved[p.id]).length}{' '}
              solved
            </span>
          ))}
        </div>
      </section>
      <section>
        <div className="section-heading">
          <h2>Achievements</h2>
          <span className="small muted">Real milestones. Local records.</span>
        </div>
        <div className="badge-grid">
          {badges(progress).map((b) => (
            <div className={`card badge ${b.earned ? 'earned' : ''}`} key={b.name}>
              <span>{b.icon}</span>
              <h3>{b.name}</h3>
              <p>{b.detail}</p>
              <small>{b.earned ? 'UNLOCKED' : 'NOT YET'}</small>
            </div>
          ))}
        </div>
      </section>
      <section className="card">
        <h2>Personal records</h2>
        {tracks.map((t) => {
          const attempts = passed.filter((a) => a.track === t.id);
          const best = attempts.length ? Math.min(...attempts.map((a) => a.elapsed)) : 0;
          return (
            <div className="metric-row" key={t.id}>
              <span>{t.short}</span>
              <span>
                {attempts.length
                  ? `Fastest pass ${(best / 60000).toFixed(1)} min · fewest hints ${Math.min(...attempts.map((a) => a.hints))}`
                  : 'No passing record yet'}
              </span>
            </div>
          );
        })}
      </section>
    </main>
  );
}
