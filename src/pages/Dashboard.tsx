import {
  ArrowUpRight,
  ArrowRight,
  Flame,
  Zap,
  Target,
  Trophy,
  Terminal,
  RotateCcw,
  Shuffle,
  Timer,
} from 'lucide-react';
import { problems, lessons, tracks, flashcards } from '../content';
import { useStore } from '../core/store';
import { dailyIndex, dayKey, independence, levelFor, shiftedDay, streak } from '../core/learning';
import type { Progress } from '../core/model';

export function badges(progress: Progress) {
  const solved = problems.filter((p) => progress.solved[p.id]);
  return [
    {
      name: 'First Blood',
      detail: 'Pass your first exercise',
      earned: solved.length > 0,
      icon: '01',
    },
    {
      name: 'No Hints Needed',
      detail: 'Pass an exercise without assistance',
      earned: progress.attempts.some((a) => a.passed && !a.hints && !a.stuck),
      icon: '02',
    },
    {
      name: 'Graph Wizard',
      detail: 'Pass 5 graph-family exercises',
      earned:
        solved.filter((p) => /Graph|Dijkstra|Topological|Union-find/.test(p.topic)).length >= 5,
      icon: '03',
    },
    {
      name: 'Ten-Day Streak',
      detail: 'Practice on 10 consecutive days',
      earned: streak(progress) >= 10,
      icon: '04',
    },
    {
      name: 'Debugger',
      detail: 'Pass after a failed submission',
      earned: solved.some((p) => progress.attempts.some((a) => a.problemId === p.id && !a.passed)),
      icon: '05',
    },
    {
      name: 'Query Master',
      detail: 'Pass 10 SQL exercises',
      earned: solved.filter((p) => p.track === 'sql').length >= 10,
      icon: '06',
    },
    {
      name: 'Notebook I',
      detail: 'Write 5 substantial notes',
      earned: progress.notes.filter((n) => n.body.trim().length >= 80).length >= 5,
      icon: '07',
    },
    {
      name: 'Notebook II',
      detail: 'Create 5 personal review cards',
      earned: progress.cards.length >= 5,
      icon: '08',
    },
    {
      name: 'Deep Work',
      detail: 'Complete 20 lessons',
      earned: progress.completedLessons.length >= 20,
      icon: '09',
    },
    {
      name: 'Under Pressure',
      detail: 'Pass a timed interview',
      earned: progress.attempts.some((a) => a.mode === 'interview' && a.passed),
      icon: '10',
    },
  ];
}
export function ActivityMap({ compact = false }: { compact?: boolean }) {
  const activity = useStore((s) => s.progress.activity);
  const today = dayKey();
  const days = Array.from({ length: compact ? 91 : 182 }, (_, i) =>
    shiftedDay(today, i - (compact ? 90 : 181)),
  );
  return (
    <div className="activity-map" aria-label="Daily learning activity">
      {days.map((day) => (
        <span
          key={day}
          data-count={Math.min(3, activity[day] ?? 0)}
          title={`${day}: ${activity[day] ?? 0} learning events`}
        />
      ))}
    </div>
  );
}
export default function Dashboard() {
  const { progress, update } = useStore();
  const level = levelFor(progress.xp);
  const daily = problems[dailyIndex(problems.length)];
  const bossPool = problems.filter((p) => p.difficulty === 'Hard');
  const week = new Date();
  week.setDate(week.getDate() - ((week.getDay() + 6) % 7));
  const boss = bossPool[dailyIndex(bossPool.length, dayKey(week))];
  const due = [...flashcards, ...progress.cards].filter(
    (c) => !progress.reviews[c.id] || progress.reviews[c.id].due <= new Date().toISOString(),
  ).length;
  const last = problems.find((p) => p.id === progress.lastProblem);
  const roleTrack =
    progress.settings.role === 'DevOps/SRE'
      ? 'devops'
      : progress.settings.role === 'ML/AI Engineer'
        ? 'ai'
        : 'dsa';
  const nextLesson =
    lessons.find((l) => l.track === roleTrack && !progress.completedLessons.includes(l.id)) ??
    lessons[0];
  const nextProblem =
    problems.find((p) => p.track === roleTrack && !progress.solved[p.id]) ?? daily;
  const planMinutes = progress.settings.dailyMinutes;
  const readingMinutes = Math.min(7, Math.max(1, Math.floor(planMinutes * 0.25)));
  const reviewMinutes = Math.min(5, Math.max(1, Math.floor(planMinutes * 0.2)));
  const practiceMinutes = planMinutes - readingMinutes - reviewMinutes;
  const currentStreak = streak(progress);
  const earned = badges(progress).filter((b) => b.earned).length;
  return (
    <main className="dashboard">
      <div className="page-kicker">
        <span>
          <span className="status-dot" /> SYSTEM ONLINE / YOUR LOCAL LAB
        </span>
        <span>
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
      <section className="hero">
        <div>
          <span className="eyebrow">PRACTICE WITH PURPOSE</span>
          <h1>
            Less rust.
            <br />
            <em>More ready.</em>
            <span className="cursor">_</span>
          </h1>
          <p className="lead">
            A little sharper, every day.
            <br />
            Your next breakthrough is a good question away.
          </p>
          <a className="primary action-link" href={`#/problem/${last?.id ?? nextProblem.id}`}>
            {last ? 'Return to your workspace' : 'Start a practice session'}
            <ArrowRight size={17} />
          </a>
          <p className="hero-footnote">
            <Terminal size={13} /> No accounts. No paywalls. Just you and the work.
          </p>
        </div>
        <div className="daily-card">
          <div className="section-heading">
            <span className="eyebrow">DAILY CHALLENGE</span>
            <span className="pill">{daily.difficulty}</span>
          </div>
          <div className="daily-art">
            <span>
              {'{'}
              <em>?</em>
              {'}'}
            </span>
            <div className="orbit" />
            <div className="orbit second" />
          </div>
          <div>
            <span className="small muted">
              {tracks.find((t) => t.id === daily.track)?.short} / {daily.topic}
            </span>
            <h2>{daily.title}</h2>
            <div className="section-heading">
              <span className="small muted">
                {progress.solved[daily.id]
                  ? 'Completed today’s pick'
                  : 'A fresh problem. A stronger you.'}
              </span>
              <a
                className="circle-link"
                href={`#/problem/${daily.id}`}
                aria-label={`Open daily challenge: ${daily.title}`}
              >
                <ArrowUpRight size={21} />
              </a>
            </div>
          </div>
        </div>
      </section>
      <div className="stat-strip">
        <div>
          <Flame />
          <span>
            <strong>
              {currentStreak}
              <small> days</small>
            </strong>
            <span>Current streak</span>
          </span>
          <span className="stat-detail">{progress.freezes} freezes</span>
        </div>
        <div>
          <Zap />
          <span>
            <strong>
              {progress.xp.toLocaleString()}
              <small> XP</small>
            </strong>
            <span>Earned, not given</span>
          </span>
        </div>
        <div>
          <Target />
          <span>
            <strong>
              {Object.keys(progress.solved).length}
              <small> / {problems.length}</small>
            </strong>
            <span>Exercises solved</span>
          </span>
        </div>
        <div>
          <Trophy />
          <span>
            <strong>
              {earned}
              <small> / {badges(progress).length}</small>
            </strong>
            <span>Badges unlocked</span>
          </span>
        </div>
      </div>
      {!progress.onboarding && (
        <div className="onboarding-banner">
          <div>
            <strong>Make this lab yours.</strong>
            <span> A short placement check and a goal turn practice into a plan.</span>
          </div>
          <a className="action-link" href="#/placement">
            Set your starting point <ArrowUpRight size={16} />
          </a>
          <button
            className="text-button"
            onClick={() =>
              update((p) => {
                p.onboarding = true;
              })
            }
          >
            Skip for now
          </button>
        </div>
      )}
      <div className="dashboard-columns">
        <section>
          <div className="section-heading">
            <div>
              <span className="eyebrow">SMALL STEPS. REAL PROGRESS.</span>
              <h2>Today’s plan</h2>
            </div>
            <a className="muted small" href="#/settings">
              {progress.settings.dailyMinutes} min / day ↗
            </a>
          </div>
          <div className="plan-list">
            <a href={`#/lesson/${nextLesson.id}`}>
              <span className="step-number">01</span>
              <div>
                <strong>Refresh the mental model</strong>
                <p>
                  {nextLesson.title} <span>· {readingMinutes} min</span>
                </p>
              </div>
              <ArrowUpRight size={17} />
            </a>
            <a href={`#/problem/${nextProblem.id}`}>
              <span className="step-number">02</span>
              <div>
                <strong>Put the idea to work</strong>
                <p>
                  {nextProblem.title} <span>· {practiceMinutes} min</span>
                </p>
              </div>
              <ArrowUpRight size={17} />
            </a>
            <a href="#/review">
              <span className="step-number">03</span>
              <div>
                <strong>Make it stick</strong>
                <p>
                  {Math.min(due, reviewMinutes)} review cards <span>· {reviewMinutes} min</span>
                </p>
              </div>
              <ArrowUpRight size={17} />
            </a>
          </div>
          {progress.settings.interviewDate && (
            <p className="small muted">
              Target: {progress.settings.role} ·{' '}
              {Math.max(
                0,
                Math.ceil((Date.parse(progress.settings.interviewDate) - Date.now()) / 86400000),
              )}{' '}
              days to your interview. Adjust scope to your available time.
            </p>
          )}
        </section>
        <section className="level-card card">
          <span className="eyebrow">YOUR ENGINEER ARC</span>
          <div className="level-display">
            <span>LVL</span>
            <strong>{String(level.level).padStart(2, '0')}</strong>
            <div>
              <h3>
                {level.level < 5
                  ? 'The Refresher'
                  : level.level < 10
                    ? 'Pattern Finder'
                    : 'Systems Thinker'}
              </h3>
              <p className="muted small">Keep showing up. It compounds.</p>
            </div>
          </div>
          <div className="progress-bar">
            <span style={{ width: `${level.fraction * 100}%` }} />
          </div>
          <div className="section-heading small muted">
            <span>
              {progress.xp - level.floor} / {level.next - level.floor} XP
            </span>
            <span>Next level {level.level + 1}</span>
          </div>
          <div className="level-metric">
            <span>Independence score</span>
            <strong>{independence(progress.attempts)}%</strong>
          </div>
          <p className="tiny muted">
            Recent solves weighted by hints and stuck events. Guided learning is rewarded, never
            penalized.
          </p>
        </section>
      </div>
      <section className="tracks-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SIX TRACKS. ONE SHARPER YOU.</span>
            <h2>Choose your next frontier</h2>
          </div>
          <a className="muted small" href="#/roadmap">
            View skill roadmap <ArrowUpRight size={14} />
          </a>
        </div>
        <div className="track-grid">
          {tracks.map((track) => {
            const pool = problems.filter((p) => p.track === track.id);
            const solved = pool.filter((p) => progress.solved[p.id]).length;
            const percent = Math.round((solved / pool.length) * 100);
            return (
              <a
                className="track-card"
                key={track.id}
                href={`#/problems?track=${track.id}`}
                style={{ '--track': track.color } as React.CSSProperties}
              >
                <div className="section-heading">
                  <span className="track-number">{track.code} /</span>
                  <div
                    className="progress-ring"
                    style={{
                      background: `conic-gradient(${track.color} ${percent * 3.6}deg, var(--line) 0)`,
                    }}
                  >
                    <span>{percent}%</span>
                  </div>
                </div>
                <h3>{track.title}</h3>
                <p>{track.description}</p>
                <div className="track-footer">
                  <span>
                    {solved} / {pool.length} exercises
                  </span>
                  <ArrowUpRight size={17} />
                </div>
              </a>
            );
          })}
        </div>
      </section>
      <div className="dashboard-columns bottom-grid">
        <section className="card">
          <div className="section-heading">
            <h3>Consistency beats cramming.</h3>
            <span className="small muted">Last 13 weeks</span>
          </div>
          <ActivityMap compact />
          <div className="section-heading tiny muted">
            <span>Every lesson, solve, and review counts.</span>
            <span>Less ▪ ▪ ▪ More</span>
          </div>
        </section>
        <section className="card boss-card">
          <span className="eyebrow">WEEKLY BOSS / HARD</span>
          <h2>{boss.title}</h2>
          <p className="small muted">
            A deeper challenge, refreshed each Monday. Plan, implement, and explain your costs.
          </p>
          <a className="action-link" href={`#/problem/${boss.id}`}>
            Take on the boss <ArrowRight size={16} />
          </a>
        </section>
      </div>
      <div className="practice-shortcuts">
        <a href="#/problems?mode=sprint">
          <Timer size={16} /> Timed sprint
        </a>
        <a href="#/problems?mode=random">
          <Shuffle size={16} /> Random mix
        </a>
        <a href="#/problems?mode=weak">
          <Target size={16} /> Work on weak spots
        </a>
        <a href="#/review">
          <RotateCcw size={16} /> Spaced review
        </a>
      </div>
    </main>
  );
}
