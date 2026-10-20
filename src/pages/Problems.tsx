import { useState } from 'react';
import { ArrowUpRight, Search, Shuffle, Timer } from 'lucide-react';
import { problems, tracks } from '../content';
import { useStore } from '../core/store';
import type { TrackId } from '../content/schema';
import { independence } from '../core/learning';

export default function Problems({ query }: { query: URLSearchParams }) {
  const { progress, update } = useStore();
  const [search, setSearch] = useState('');
  const [track, setTrack] = useState(query.get('track') ?? 'all');
  const [difficulty, setDifficulty] = useState('all');
  const [status, setStatus] = useState('all');
  const [kind, setKind] = useState('all');
  const selection = query.get('mode');
  const pool = problems.filter(
    (p) =>
      (track === 'all' || p.track === track) &&
      (difficulty === 'all' || p.difficulty === difficulty) &&
      (status === 'all' || (status === 'solved') === !!progress.solved[p.id]) &&
      (kind === 'all' || p.kind === kind) &&
      `${p.title} ${p.topic}`.toLowerCase().includes(search.toLowerCase()),
  );
  if (selection === 'weak')
    pool.sort(
      (a, b) =>
        independence(progress.attempts.filter((x) => x.problemId === a.id)) -
          independence(progress.attempts.filter((x) => x.problemId === b.id)) ||
        Number(!!progress.solved[a.id]) - Number(!!progress.solved[b.id]),
    );
  function random(timed = false) {
    if (!pool.length) return;
    const problem = pool[Math.floor(Math.random() * pool.length)];
    if (timed)
      update((p) => {
        p.modes[problem.track] = 'interview';
      });
    location.hash = `/problem/${problem.id}`;
  }
  return (
    <main>
      <div className="page-heading">
        <div>
          <span className="eyebrow">THE PRACTICE FLOOR</span>
          <h1>
            Build your <em>edge.</em>
          </h1>
          <p className="muted">
            {problems.length} exercises. Six tracks. Questions before shortcuts.
          </p>
        </div>
        <div className="button-row">
          <button onClick={() => random()}>
            <Shuffle size={16} /> Random mix
          </button>
          <button className="primary" onClick={() => random(true)}>
            <Timer size={16} /> 25-min interview
          </button>
        </div>
      </div>
      {selection === 'weak' && (
        <div className="banner">
          Weak spots first: unpracticed topics and recent assisted/failed solves rise to the top.
        </div>
      )}
      {selection === 'sprint' && (
        <div className="banner">
          Choose a problem or use the timed interview button. Your session has 25 minutes, no hints,
          and an honest debrief.
        </div>
      )}
      {selection === 'random' && (
        <div className="banner">Use Random mix to pick from the current filters.</div>
      )}
      <div className="filters">
        <label className="search-field">
          <Search size={16} />
          <input
            aria-label="Search problems"
            placeholder="Search problems or patterns…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select aria-label="Filter track" value={track} onChange={(e) => setTrack(e.target.value)}>
          <option value="all">All tracks</option>
          {tracks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.short}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="all">All difficulties</option>
          {['Easy', 'Medium', 'Hard'].map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <select
          aria-label="Filter status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="solved">Solved</option>
          <option value="unsolved">Unsolved</option>
        </select>
        <select aria-label="Filter format" value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="all">All formats</option>
          {[...new Set(problems.map((p) => p.kind))].map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </div>
      <div className="section-heading small muted">
        <span>{pool.length} results</span>
        <span>{Object.keys(progress.solved).length} completed</span>
      </div>
      <div className="exercise-table">
        <div className="table-head">
          <span>Status / challenge</span>
          <span>Track / topic</span>
          <span>Format</span>
          <span>Difficulty</span>
          <span />
        </div>
        {pool.map((p) => (
          <a className="exercise-row" href={`#/problem/${p.id}`} key={p.id}>
            <span>
              <span className={`solve-marker ${progress.solved[p.id] ? 'solved' : ''}`}>
                {progress.solved[p.id] ? '✓' : '○'}
              </span>
              <strong>{p.title}</strong>
            </span>
            <span className="small muted">
              {tracks.find((t) => t.id === p.track)?.short}
              <small>{p.topic}</small>
            </span>
            <span className="pill">{p.kind}</span>
            <span className={`difficulty ${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
            <ArrowUpRight size={16} />
          </a>
        ))}
      </div>
      {!pool.length && (
        <p className="empty">No exercises match those filters. Broaden a filter and try again.</p>
      )}
      <p className="tiny muted">
        Java is authored semantics/repair practice, not a JVM. Infrastructure/design tasks use
        transparent static rubrics, not actual deployments. JavaScript, TypeScript, Python, and SQL
        code tasks execute in disposable Workers.
      </p>
    </main>
  );
}
export function TrackFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (track: TrackId | 'all') => void;
}) {
  return (
    <select
      aria-label="Track"
      value={value}
      onChange={(e) => {
        const selected = tracks.find((t) => t.id === e.target.value);
        onChange(selected?.id ?? 'all');
      }}
    >
      <option value="all">All tracks</option>
      {tracks.map((t) => (
        <option key={t.id} value={t.id}>
          {t.short}
        </option>
      ))}
    </select>
  );
}
