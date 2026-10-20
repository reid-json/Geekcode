import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  Terminal,
  Settings as SettingsIcon,
  BarChart3,
  GitBranch,
  WifiOff,
  Download,
  X,
} from 'lucide-react';
import { problems, lessons } from './content';
import { hydrate, useStore } from './core/store';
import { levelFor } from './core/learning';
import { registerOffline } from './core/offline';
import Dashboard from './pages/Dashboard';
import type { Report } from './core/model';

const Workspace = lazy(() => import('./pages/Workspace'));
const Problems = lazy(() => import('./pages/Problems'));
const Library = lazy(() => import('./pages/Library'));
const LessonReader = lazy(() =>
  import('./pages/Library').then((m) => ({ default: m.LessonReader })),
);
const Roadmap = lazy(() => import('./pages/Library').then((m) => ({ default: m.Roadmap })));
const Review = lazy(() => import('./pages/Review'));
const Notebook = lazy(() => import('./pages/Notebook'));
const Career = lazy(() => import('./pages/Career'));
const Settings = lazy(() => import('./pages/Settings'));
const Placement = lazy(() => import('./pages/Placement'));
const Stats = lazy(() => import('./pages/Stats'));
interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export default function App() {
  const [route, setRoute] = useState(location.hash.slice(1) || '/');
  const [online, setOnline] = useState(navigator.onLine);
  const [install, setInstall] = useState<InstallPrompt>();
  const [milestone, setMilestone] = useState<Report>();
  const previousReports = useRef<number | undefined>(undefined);
  const { progress, ready, toast, error, clearError } = useStore();
  useEffect(() => {
    void hydrate();
    const change = () => {
      setRoute(location.hash.slice(1) || '/');
      window.scrollTo(0, 0);
    };
    const connection = () => setOnline(navigator.onLine);
    const prompt = (event: Event) => {
      event.preventDefault();
      if ('prompt' in event && 'userChoice' in event) setInstall(event as InstallPrompt);
    };
    window.addEventListener('hashchange', change);
    window.addEventListener('online', connection);
    window.addEventListener('offline', connection);
    window.addEventListener('beforeinstallprompt', prompt);
    if (import.meta.env.PROD)
      void registerOffline().catch((e: unknown) =>
        useStore
          .getState()
          .notify(`Offline installation failed: ${String(e)}. Keep this page online and reload.`),
      );
    return () => {
      window.removeEventListener('hashchange', change);
      window.removeEventListener('online', connection);
      window.removeEventListener('offline', connection);
      window.removeEventListener('beforeinstallprompt', prompt);
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = progress.settings.theme;
    document.documentElement.dataset.reducedMotion = String(progress.settings.reducedMotion);
  }, [progress.settings.theme, progress.settings.reducedMotion]);
  useEffect(() => {
    if (!ready) return;
    if (previousReports.current !== undefined && progress.reports.length > previousReports.current)
      setMilestone(progress.reports.at(-1));
    previousReports.current = progress.reports.length;
  }, [ready, progress.reports]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => useStore.setState({ toast: '' }), 9000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const channel = new BroadcastChannel('geekcode-tabs');
    channel.onmessage = () =>
      useStore
        .getState()
        .notify(
          'Another Geekcode tab is open. Use one editing tab to avoid overwriting local progress.',
        );
    channel.postMessage('opened');
    return () => channel.close();
  }, []);
  if (!ready) return <div className="loading">Opening your lab…</div>;
  const [path, search = ''] = route.split('?');
  const query = new URLSearchParams(search);
  const problem = problems.find((p) => path === `/problem/${p.id}`);
  const lesson = lessons.find((l) => path === `/lesson/${l.id}`);
  const links = [
    ['/', 'Overview'],
    ['/problems', 'Practice'],
    ['/library', 'Library'],
    ['/review', 'Review'],
    ['/notes', 'Notebook'],
    ['/career', 'Career'],
  ];
  let content;
  if (problem) content = <Workspace key={problem.id} problem={problem} />;
  else if (lesson) content = <LessonReader key={lesson.id} lesson={lesson} />;
  else
    switch (path) {
      case '/':
        content = <Dashboard />;
        break;
      case '/problems':
        content = <Problems key={route} query={query} />;
        break;
      case '/library':
        content = <Library />;
        break;
      case '/glossary':
        content = <Library glossary />;
        break;
      case '/cheatsheets':
        content = <Library cheats />;
        break;
      case '/roadmap':
        content = <Roadmap />;
        break;
      case '/review':
        content = <Review />;
        break;
      case '/notes':
        content = <Notebook key={route} query={query} />;
        break;
      case '/career':
        content = <Career />;
        break;
      case '/settings':
        content = <Settings />;
        break;
      case '/placement':
        content = <Placement />;
        break;
      case '/stats':
        content = <Stats />;
        break;
      default:
        content = (
          <main>
            <h1>Unmapped territory.</h1>
            <p>This page does not exist. Your progress is safe.</p>
            <a href="#/">Return to the lab ↗</a>
          </main>
        );
    }
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="app-header">
        <a className="brand" href="#/">
          <Terminal size={27} />
          <strong>
            Geekcode<span>_</span>
          </strong>
        </a>
        <nav aria-label="Primary">
          {links.map(([href, title]) => (
            <a
              key={href}
              className={
                path === href ||
                (href === '/problems' && !!problem) ||
                (href === '/library' && !!lesson)
                  ? 'active'
                  : ''
              }
              href={`#${href}`}
            >
              {title}
            </a>
          ))}
        </nav>
        <div className="header-tools">
          {!online && (
            <span title="Offline">
              <WifiOff size={16} />
            </span>
          )}
          {install && (
            <button
              aria-label="Install Geekcode"
              title="Install Geekcode"
              onClick={() => {
                void install
                  .prompt()
                  .then(() => install.userChoice)
                  .then(() => setInstall(undefined))
                  .catch((e: unknown) =>
                    useStore.getState().notify(`Install failed: ${String(e)}`),
                  );
              }}
            >
              <Download size={17} />
            </button>
          )}
          <a href="#/roadmap" title="Skill roadmap" aria-label="Skill roadmap">
            <GitBranch size={18} />
          </a>
          <a
            href="#/stats"
            title="Statistics and achievements"
            aria-label="Statistics and achievements"
          >
            <BarChart3 size={18} />
          </a>
          <a href="#/settings" title="Settings" aria-label="Settings">
            <SettingsIcon size={18} />
          </a>
        </div>
        <a href="#/stats" className="xp">
          <span className="level-chip">L{levelFor(progress.xp).level}</span> {progress.xp} XP
        </a>
      </header>
      {error && (
        <div role="alert" className="banner error">
          {error}
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
      <div id="main-content" tabIndex={-1}>
        <Suspense fallback={<div className="loading">Opening this part of the lab…</div>}>
          {content}
        </Suspense>
      </div>
      {!problem && !lesson && (
        <footer className="app-footer">
          <span>
            <Terminal size={13} /> Geekcode / keep your curiosity sharp.
          </span>
          <span>LOCAL-FIRST · NO ACCOUNT · YOUR DATA</span>
          <a href="https://github.com/reid-json/Geekcode" target="_blank" rel="noreferrer">
            Source ↗
          </a>
          <a href="https://reid-json.net/" target="_blank" rel="noreferrer">
            reid-json.net ↗
          </a>
        </footer>
      )}
      {toast && (
        <div role="status" className="toast">
          <span>{toast}</span>
          {toast.includes('Learning Log') && <a href="#/career">Open Career ↗</a>}
          <button
            aria-label="Dismiss notification"
            onClick={() => useStore.setState({ toast: '' })}
          >
            <X size={14} />
          </button>
        </div>
      )}
      {milestone && (
        <div
          className="milestone-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Milestone reached"
        >
          <section className="milestone-card card">
            <span className="eyebrow">A LITTLE SHARPER. A LOT MORE PROOF.</span>
            <div className="milestone-star">✦</div>
            <h2>{milestone.title}</h2>
            <p>
              Your evidence-backed report is ready. Practice remains practice; no invented
              experience.
            </p>
            <div className="button-row">
              <a
                className="primary action-link"
                href="#/career"
                onClick={() => setMilestone(undefined)}
              >
                View my report ↗
              </a>
              <button autoFocus onClick={() => setMilestone(undefined)}>
                Keep practicing
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
