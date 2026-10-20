import { useState } from 'react';
import { Download, ArrowUpRight } from 'lucide-react';
import { problems, tracks } from '../content';
import { careerRules } from '../content/career-rules';
import { useStore } from '../core/store';
import { readiness, streak } from '../core/learning';
import { reportBody } from '../core/completion';
import { download, noteMarkdown } from '../core/exports';
import type { LearningEntry, Story } from '../core/model';
import Markdown from '../components/Markdown';

export default function Career() {
  const { progress, update, notify } = useStore();
  const [tab, setTab] = useState('readiness');
  const [selected, setSelected] = useState<string[]>([]);
  const [report, setReport] = useState('');
  const [variant, setVariant] = useState('concise');
  const [story, setStory] = useState<Story>({
    id: '',
    title: '',
    competency: 'ownership',
    situation: '',
    task: '',
    action: '',
    result: '',
  });
  const [hideStreak, setHideStreak] = useState(false);
  const [hideLanguages, setHideLanguages] = useState(false);
  const scores = tracks.map((t) => ({ ...t, score: readiness(progress, problems, t.id) }));
  const overall = Math.round(
    scores.reduce((sum, t) => sum + t.score * careerRules.roles[progress.settings.role][t.id], 0),
  );
  const activeLog = progress.log.filter((e) => !e.hidden);
  const promoted = activeLog.filter(
    (e) => e.promoted && e.confidence === 'solid' && e.sourceType === 'problem',
  );
  const languages = [...new Set(progress.attempts.filter((a) => a.passed).map((a) => a.language))];
  const stats = `Geekcode practice · ${Object.keys(progress.solved).length} exercises passed · ${
    tracks
      .filter((t) => problems.some((p) => p.track === t.id && progress.solved[p.id]))
      .map((t) => t.short)
      .join(', ') || 'No tracks evidenced yet'
  }${hideStreak ? '' : ` · ${streak(progress)}-day streak`}${hideLanguages ? '' : ` · ${languages.join(', ') || 'No languages evidenced yet'}`}. Local self-reported practice, not a credential.`;
  function editLog(id: string, edit: (e: LearningEntry) => void) {
    update((p) => {
      const entry = p.log.find((e) => e.id === id);
      if (entry) edit(entry);
    });
  }
  function prepPack() {
    return `${reportBody(progress)}\n\n# STAR story bank\n${progress.stories.map((s) => `## ${s.title}\nCompetency: ${s.competency}\nSituation: ${s.situation}\nTask: ${s.task}\nAction: ${s.action}\nResult: ${s.result}`).join('\n\n')}\n\n# Mistake review highlights\n${progress.notes
      .filter((n) => n.tags.includes('mistake'))
      .map(noteMarkdown)
      .join('\n\n')}\n\n# Personal cheat sheets\n${progress.notes
      .filter((n) => n.pinned)
      .map(noteMarkdown)
      .join('\n\n')}`;
  }
  async function imageCard() {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 420;
    const c = canvas.getContext('2d');
    if (!c) {
      notify('Image export is unavailable in this browser. Use Markdown instead.');
      return;
    }
    c.fillStyle = '#0c1214';
    c.fillRect(0, 0, 1200, 420);
    c.fillStyle = '#b5f36c';
    c.font = 'bold 34px monospace';
    c.fillText('geekcode_ / PRACTICE RECORD', 50, 70);
    c.fillStyle = '#e7eeea';
    c.font = 'bold 72px monospace';
    c.fillText(`${Object.keys(progress.solved).length} exercises passed`, 50, 185);
    c.font = '22px monospace';
    c.fillStyle = '#9aaeb0';
    c.fillText(
      `${hideStreak ? 'Streak hidden' : `${streak(progress)}-day streak`}  /  ${hideLanguages ? 'Languages hidden' : languages.join(', ') || 'No language evidence yet'}`,
      50,
      250,
    );
    c.font = '18px monospace';
    c.fillText('Local self-reported learning. Not a credential or work experience.', 50, 340);
    c.fillText(new Date().toLocaleDateString(), 50, 375);
    canvas.toBlob((blob) => {
      if (blob) download('geekcode-practice-record.png', blob);
      else notify('Image export failed. Use Markdown instead.');
    });
  }
  return (
    <main>
      <div className="page-heading">
        <div>
          <span className="eyebrow">TURN PRACTICE INTO EVIDENCE</span>
          <h1>
            Know what you <em>can say.</em>
          </h1>
          <p className="muted">Honest readiness. Editable drafts. Every claim has a trail.</p>
        </div>
        <div className="button-row">
          <button onClick={() => download('geekcode-interview-prep.md', prepPack())}>
            <Download size={16} /> Interview Prep Pack
          </button>
          <button onClick={() => window.print()}>Print / PDF</button>
        </div>
      </div>
      <div className="disclaimer">{careerRules.templates.reportDisclaimer}</div>
      <div className="tabs career-tabs">
        {['readiness', 'learning log', 'reports', 'resume builder', 'story bank', 'stats card'].map(
          (t) => (
            <button key={t} className={tab === t ? 'selected' : ''} onClick={() => setTab(t)}>
              {t}
            </button>
          ),
        )}
      </div>
      {tab === 'readiness' && (
        <>
          <div className="stats-grid">
            <section className="card">
              <span className="eyebrow">CURRENT READINESS</span>
              <strong className="big-number">
                {overall}
                <small>/100</small>
              </strong>
              <label>
                Target role{' '}
                <select
                  value={progress.settings.role}
                  onChange={(e) => {
                    const role = e.target.value;
                    if (
                      role === 'Backend SWE' ||
                      role === 'DevOps/SRE' ||
                      role === 'ML/AI Engineer'
                    )
                      update((p) => {
                        p.settings.role = role;
                      });
                  }}
                >
                  {Object.keys(careerRules.roles).map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </select>
              </label>
              <p className="small muted">A practice-planning signal, not a hiring prediction.</p>
            </section>
            <section className="card">
              {scores.map((t) => (
                <div className="readiness-row" key={t.id}>
                  <div className="section-heading small">
                    <span>{t.short}</span>
                    <span>
                      {t.score}% · weight {careerRules.roles[progress.settings.role][t.id] * 100}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <span style={{ width: `${t.score}%`, background: t.color }} />
                  </div>
                </div>
              ))}
            </section>
          </div>
          <details className="card">
            <summary>Show how readiness is calculated</summary>
            <p>
              For each track: recency × (45% solved coverage + 20% topic breadth + 20% independence
              over the last 10 submissions + 15% timed pass rate). Recency declines linearly over
              120 days, with a 25% floor. Overall is the role-weighted average. Unpracticed skills
              receive zero; lessons alone do not count as solved exercises.
            </p>
            <p>
              Static rubrics measure authored coverage only. A high score does not prove deployment
              ability or production experience.
            </p>
          </details>
          <section className="card">
            <h2>Gaps & next steps</h2>
            {scores
              .sort((a, b) => a.score - b.score)
              .map((t) => (
                <div className="metric-row" key={t.id}>
                  <span>
                    {t.short}:{' '}
                    {problems.filter((p) => p.track === t.id && !progress.solved[p.id]).length}{' '}
                    remaining exercises
                  </span>
                  <a href={`#/problems?track=${t.id}`}>
                    Practice <ArrowUpRight size={14} />
                  </a>
                </div>
              ))}
          </section>
        </>
      )}
      {tab === 'learning log' && (
        <>
          <div className="button-row">
            <button
              disabled={!selected.length}
              onClick={() => {
                update((p) => {
                  p.log.forEach((e) => {
                    if (
                      selected.includes(e.id) &&
                      e.confidence === 'solid' &&
                      e.sourceType === 'problem'
                    )
                      e.promoted = true;
                  });
                });
                notify(
                  'Eligible independent solves promoted. Assisted/reading-only entries are excluded.',
                );
              }}
            >
              Promote selected independent solves
            </button>
            <label className="small">
              <input
                type="checkbox"
                checked={!!activeLog.length && selected.length === activeLog.length}
                onChange={(e) => setSelected(e.target.checked ? activeLog.map((l) => l.id) : [])}
              />{' '}
              Select all
            </label>
          </div>
          {activeLog.map((entry) => (
            <article className="card log-editor" key={entry.id}>
              <div className="section-heading">
                <label>
                  <input
                    type="checkbox"
                    checked={selected.includes(entry.id)}
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? [...selected, entry.id]
                          : selected.filter((id) => id !== entry.id),
                      )
                    }
                  />
                  <strong>{entry.title}</strong>
                </label>
                <span className="pill">{entry.confidence}</span>
              </div>
              <label>
                What I learned
                <textarea
                  value={entry.learned}
                  onChange={(e) =>
                    editLog(entry.id, (v) => {
                      v.learned = e.target.value;
                    })
                  }
                />
              </label>
              <label>
                How I’d say it
                <textarea
                  value={entry.interview}
                  onChange={(e) =>
                    editLog(entry.id, (v) => {
                      v.interview = e.target.value;
                    })
                  }
                />
              </label>
              <label>
                Resume draft
                <textarea
                  value={entry.resume}
                  onChange={(e) =>
                    editLog(entry.id, (v) => {
                      v.resume = e.target.value;
                    })
                  }
                />
              </label>
              <p className="tiny muted">{entry.evidence}</p>
              <div className="button-row">
                <button
                  disabled={entry.confidence !== 'solid' || entry.sourceType !== 'problem'}
                  onClick={() =>
                    editLog(entry.id, (e) => {
                      e.promoted = !e.promoted;
                    })
                  }
                >
                  {entry.promoted ? 'Remove from resume bank' : 'Promote to resume bank'}
                </button>
                <button
                  onClick={() =>
                    editLog(entry.id, (e) => {
                      e.hidden = true;
                    })
                  }
                >
                  Hide
                </button>
                <button
                  className="danger"
                  onClick={() => {
                    if (
                      window.confirm('Delete this Learning Log entry? Your solve record remains.')
                    )
                      update((p) => {
                        p.log = p.log.filter((e) => e.id !== entry.id);
                      });
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
          {progress.log.some((e) => e.hidden) && (
            <button
              onClick={() =>
                update((p) => {
                  p.log.forEach((e) => {
                    e.hidden = false;
                  });
                })
              }
            >
              Restore hidden entries
            </button>
          )}
          {!activeLog.length && (
            <p className="empty">
              Finish a lesson or exercise. Your evidence log will begin automatically.
            </p>
          )}
        </>
      )}
      {tab === 'reports' && (
        <>
          <p className="small muted">
            Milestone reports are dated snapshots. Live readiness reflects current edits, review
            recency, and hidden evidence.
          </p>
          <div className="filters">
            <select
              aria-label="Milestone report"
              value={report}
              onChange={(e) => setReport(e.target.value)}
            >
              <option value="">Live current report</option>
              {progress.reports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                download(
                  'geekcode-career-report.md',
                  progress.reports.find((r) => r.id === report)?.body ?? reportBody(progress),
                )
              }
            >
              Export report
            </button>
          </div>
          {report ? (
            <>
              {progress.reports
                .filter((r) => r.id === report)
                .map((r) => (
                  <section className="card" key={r.id}>
                    <h2>{r.title}</h2>
                    <textarea
                      className="report-editor"
                      aria-label="Edit report"
                      value={r.body}
                      onChange={(e) =>
                        update((p) => {
                          const found = p.reports.find((x) => x.id === r.id);
                          if (found) found.body = e.target.value;
                        })
                      }
                    />
                    <Markdown>{r.body}</Markdown>
                    <button
                      className="danger"
                      onClick={() => {
                        update((p) => {
                          p.reports = p.reports.filter((x) => x.id !== r.id);
                        });
                        setReport('');
                      }}
                    >
                      Delete report
                    </button>
                  </section>
                ))}
            </>
          ) : (
            <section className="card">
              <Markdown>{reportBody(progress)}</Markdown>
            </section>
          )}
        </>
      )}
      {tab === 'resume builder' && (
        <>
          <p className="muted">
            Only solid, independently passed exercises are eligible. Promote them from the Learning
            Log. Never turn practice into invented employment or metrics.
          </p>
          <div className="button-row">
            <select
              aria-label="Resume style"
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
            >
              <option value="concise">Concise</option>
              <option value="detailed">Detailed</option>
            </select>
            <button
              onClick={() =>
                update((p) => {
                  p.resume = `## Technical Skills / Continuing Education\n\n${promoted.length ? promoted.map((e) => `- ${e.resume}${variant === 'detailed' ? ` Evidence: ${e.evidence}` : ''}`).join('\n') : 'No promoted independent solve evidence yet.'}\n\n## Personal Projects\n\nOnly include projects you actually built. Record measured outcomes rather than invented numbers: [X].`;
                })
              }
            >
              Assemble eligible evidence
            </button>
            <button onClick={() => download('geekcode-resume-section.md', progress.resume)}>
              Markdown
            </button>
            <button
              onClick={() => download('geekcode-resume-section.txt', progress.resume, 'text/plain')}
            >
              Plain text
            </button>
          </div>
          <textarea
            className="report-editor"
            aria-label="Resume section"
            value={progress.resume}
            onChange={(e) =>
              update((p) => {
                p.resume = e.target.value;
              })
            }
            placeholder="Assemble promoted evidence or write your own accurate practice summary."
          />
          <section className="print-resume">
            <Markdown>{progress.resume}</Markdown>
          </section>
        </>
      )}
      {tab === 'story bank' && (
        <>
          <section className="card">
            <h2>STAR story builder</h2>
            <select
              aria-label="Prefill story evidence"
              defaultValue=""
              onChange={(e) => {
                const entry = progress.log.find((l) => l.id === e.target.value);
                if (!entry) return;
                const note = progress.notes.find(
                  (n) => n.context === entry.source && n.tags.includes('mistake'),
                );
                setStory({
                  id: '',
                  title: `Practice: ${entry.title}`,
                  competency: 'persistence',
                  situation: `During a personal practice exercise: ${entry.title}.`,
                  task: entry.learned,
                  action: note?.body ?? entry.interview,
                  result: `${entry.confidence === 'solid' ? 'Independently passed authored tests.' : 'Completed with assistance or self-review; further independent practice is needed.'} ${entry.evidence}`,
                });
              }}
            >
              <option value="">Prefill from real learning evidence…</option>
              {activeLog.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
            {(['title', 'competency', 'situation', 'task', 'action', 'result'] as const).map(
              (field) => (
                <label className="story-field" key={field}>
                  {field}
                  <textarea
                    aria-label={`STAR ${field}`}
                    value={story[field]}
                    onChange={(e) => setStory({ ...story, [field]: e.target.value })}
                  />
                </label>
              ),
            )}
            <button
              className="primary"
              disabled={!story.title.trim() || !story.action.trim() || !story.result.trim()}
              onClick={() => {
                update((p) => {
                  const found = p.stories.findIndex((s) => s.id === story.id);
                  if (found >= 0) p.stories[found] = story;
                  else p.stories.push({ ...story, id: crypto.randomUUID() });
                });
                notify('Story saved. Keep the practice framing and check every claim.');
              }}
            >
              Save story
            </button>
          </section>
          {progress.stories.map((s) => (
            <article key={s.id} className="card">
              <h3>{s.title}</h3>
              <p className="pill">{s.competency}</p>
              <p>
                <strong>Situation:</strong> {s.situation}
              </p>
              <p>
                <strong>Task:</strong> {s.task}
              </p>
              <p>
                <strong>Action:</strong> {s.action}
              </p>
              <p>
                <strong>Result:</strong> {s.result}
              </p>
              <div className="button-row">
                <button onClick={() => setStory(s)}>Edit</button>
                <button
                  onClick={() =>
                    update((p) => {
                      p.stories = p.stories.filter((x) => x.id !== s.id);
                    })
                  }
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </>
      )}
      {tab === 'stats card' && (
        <section className="card">
          <h2>Practice record</h2>
          <p>{stats}</p>
          <div className="button-row">
            <label>
              <input
                type="checkbox"
                checked={hideStreak}
                onChange={(e) => setHideStreak(e.target.checked)}
              />{' '}
              Hide streak
            </label>
            <label>
              <input
                type="checkbox"
                checked={hideLanguages}
                onChange={(e) => setHideLanguages(e.target.checked)}
              />{' '}
              Hide languages
            </label>
          </div>
          <div className="button-row">
            <button onClick={() => download('geekcode-stats.md', stats)}>Export Markdown</button>
            <button onClick={() => void imageCard()}>Export PNG</button>
          </div>
          <p className="tiny muted">
            No public upload or remote verification occurs. Everything remains local until you share
            the file.
          </p>
        </section>
      )}
    </main>
  );
}
