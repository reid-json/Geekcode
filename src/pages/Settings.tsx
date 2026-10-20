import { useState } from 'react';
import { useStore } from '../core/store';
import { initialProgress, type Settings as Preferences } from '../core/model';
import { download, parseProgress } from '../core/exports';
import { dayKey, shiftedDay } from '../core/learning';
import { prepareOffline } from '../core/offline';

export default function Settings() {
  const { progress, update, replace, notify } = useStore();
  const [offline, setOffline] = useState('');
  const [preparing, setPreparing] = useState(false);
  const [importing, setImporting] = useState(false);
  function set<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    update((p) => {
      p.settings[key] = value;
    });
  }
  return (
    <main className="settings-page">
      <span className="eyebrow">YOUR LAB. YOUR RULES.</span>
      <h1>
        Set the <em>environment.</em>
      </h1>
      <div className="settings-grid">
        <section className="card">
          <h2>Appearance & editor</h2>
          <label>
            Theme
            <select
              value={progress.settings.theme}
              onChange={(e) => set('theme', e.target.value === 'light' ? 'light' : 'dark')}
            >
              <option value="dark">Dark lab</option>
              <option value="light">Light lab</option>
            </select>
          </label>
          <label>
            Editor font size
            <input
              type="number"
              min="10"
              max="28"
              value={progress.settings.fontSize}
              onChange={(e) =>
                set('fontSize', Math.min(28, Math.max(10, Number(e.target.value) || 14)))
              }
            />
          </label>
          <label>
            Keybindings
            <select
              value={progress.settings.keybindings}
              onChange={(e) => set('keybindings', e.target.value === 'vim' ? 'vim' : 'default')}
            >
              <option value="default">Default</option>
              <option value="vim">Vim</option>
            </select>
          </label>
          <label>
            Preferred language
            <select
              value={progress.settings.language}
              onChange={(e) => {
                const language = e.target.value;
                if (
                  language === 'javascript' ||
                  language === 'typescript' ||
                  language === 'python' ||
                  language === 'java' ||
                  language === 'sql'
                )
                  set('language', language);
              }}
            >
              {['java', 'javascript', 'typescript', 'python', 'sql'].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <p className="tiny muted">
            Track-specific last language takes precedence. Java defaults to authored Java drills;
            other problems fall back to a supported language.
          </p>
          <label>
            <input
              type="checkbox"
              checked={progress.settings.sound}
              onChange={(e) => set('sound', e.target.checked)}
            />{' '}
            Short solve sound (off by default)
          </label>
          <label>
            <input
              type="checkbox"
              checked={progress.settings.reducedMotion}
              onChange={(e) => set('reducedMotion', e.target.checked)}
            />{' '}
            Reduce motion
          </label>
        </section>
        <section className="card">
          <h2>Goals & progression</h2>
          <label>
            Target role
            <select
              value={progress.settings.role}
              onChange={(e) => {
                const role = e.target.value;
                if (role === 'Backend SWE' || role === 'DevOps/SRE' || role === 'ML/AI Engineer')
                  set('role', role);
              }}
            >
              {['Backend SWE', 'DevOps/SRE', 'ML/AI Engineer'].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <label>
            Daily minutes
            <input
              type="number"
              min="5"
              max="240"
              value={progress.settings.dailyMinutes}
              onChange={(e) =>
                set('dailyMinutes', Math.min(240, Math.max(5, Number(e.target.value) || 30)))
              }
            />
          </label>
          <label>
            Interview date
            <input
              type="date"
              value={progress.settings.interviewDate}
              onChange={(e) => set('interviewDate', e.target.value)}
            />
          </label>
          <label>
            Track milestone threshold
            <input
              type="number"
              min="50"
              max="100"
              value={progress.settings.milestoneThreshold}
              onChange={(e) =>
                set('milestoneThreshold', Math.min(100, Math.max(50, Number(e.target.value) || 80)))
              }
            />
          </label>
          <p className="small muted">
            {progress.freezes} streak-freeze tokens available. A freeze bridges yesterday’s missed
            day without inventing an active day.
          </p>
          <button
            disabled={
              !progress.freezes ||
              !!progress.activity[shiftedDay(dayKey(), -1)] ||
              progress.freezeDates.includes(shiftedDay(dayKey(), -1))
            }
            onClick={() => {
              update((p) => {
                const yesterday = shiftedDay(dayKey(), -1);
                if (p.freezes > 0 && !p.activity[yesterday] && !p.freezeDates.includes(yesterday)) {
                  p.freezeDates.push(yesterday);
                  p.freezes--;
                }
              });
              notify('Yesterday is bridged by a freeze; it does not count as a practice day.');
            }}
          >
            Use a freeze for yesterday
          </button>
          <a className="action-link" href="#/placement">
            Retake placement ↗
          </a>
        </section>
      </div>
      <section className="card">
        <h2>Offline readiness</h2>
        <p>
          The application shell and local WASM engines are cached after installation. NumPy and
          optional pandas/scikit-learn wheels need one online download. Prepare them here before
          going offline. Runtime downloads are public packages only; your code and notes are never
          sent.
        </p>
        <button
          disabled={preparing}
          onClick={() => {
            setPreparing(true);
            void prepareOffline(setOffline)
              .then(() =>
                setOffline(
                  'Ready: app, engines, NumPy, pandas, and scikit-learn are cached for this browser.',
                ),
              )
              .catch((e: unknown) =>
                setOffline(
                  `Preparation failed: ${String(e)}. Stay online and retry; incomplete downloads are not reported as ready.`,
                ),
              )
              .finally(() => setPreparing(false));
          }}
        >
          {preparing ? 'Preparing…' : 'Prepare all engines for offline use'}
        </button>
        <p role="status" className="small muted">
          {offline ||
            'Use the browser install option on HTTPS or localhost. HTTP(S) hosting is required; file:// is not supported.'}
        </p>
      </section>
      <section className="card">
        <h2>Your data belongs to you</h2>
        <p>
          Progress, drafts, notes, custom flashcards, reports, and stories are stored in IndexedDB
          on this browser and origin. Export backups before switching devices or clearing site data.
        </p>
        <div className="button-row">
          <button
            onClick={() =>
              download(
                'geekcode-progress.json',
                JSON.stringify(progress, null, 2),
                'application/json',
              )
            }
          >
            Export complete backup
          </button>
          <label className="file-upload">
            {importing ? 'Importing…' : 'Import backup JSON'}
            <input
              aria-label="Import progress"
              type="file"
              accept=".json,application/json"
              disabled={importing}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setImporting(true);
                void file
                  .text()
                  .then(parseProgress)
                  .then(async (data) => {
                    if (
                      window.confirm(
                        'Replace all current progress with this validated backup? Export your current data first if needed.',
                      )
                    ) {
                      await replace(data);
                      notify('Backup imported and saved locally.');
                    }
                  })
                  .catch((error: unknown) => notify(`Import failed: ${String(error)}`))
                  .finally(() => {
                    setImporting(false);
                    e.target.value = '';
                  });
              }}
            />
          </label>
          <button
            className="danger"
            onClick={() => {
              if (
                window.confirm(
                  'Permanently reset this browser’s Geekcode progress? Export a backup first.',
                )
              )
                void replace(initialProgress())
                  .then(() => notify('Local progress reset.'))
                  .catch((e: unknown) => notify(`Reset failed: ${String(e)}`));
            }}
          >
            Reset local progress
          </button>
        </div>
      </section>
      <section className="card">
        <h2>Execution boundaries</h2>
        <ul className="muted">
          <li>
            JavaScript/TypeScript and Python run in disposable Web Workers. User code has no page
            DOM; a five-second execution deadline terminates runaway work after runtime loading.
          </li>
          <li>
            Workers are isolation from the UI, not a hardened hostile-code VM. Do not paste
            untrusted code. Browsers do not provide a reliable per-Worker memory cap; extreme
            allocations can still exhaust a tab.
          </li>
          <li>SQL uses a fresh seeded, read-only SQLite database per case.</li>
          <li>
            Java, shell, infrastructure, and design exercises are authored answer/coverage checks.
            They do not run a JVM, containers, cloud resources, or commands.
          </li>
          <li>
            The optional local AI layer is not implemented; the coach is fully authored and offline,
            with no model/API calls.
          </li>
        </ul>
      </section>
    </main>
  );
}
