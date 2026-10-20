import { useMemo, useState } from 'react';
import MiniSearch from 'minisearch';
import { Search, Download, FilePlus } from 'lucide-react';
import { useStore } from '../core/store';
import { createNote, noteToCard, rewardNote } from '../core/notes';
import { download, exportNotebook, noteMarkdown } from '../core/exports';
import type { TrackId } from '../content/schema';
import { TrackFilter } from './Problems';
import Markdown from '../components/Markdown';

export default function Notebook({ query }: { query: URLSearchParams }) {
  const { progress, update, notify } = useStore();
  const [search, setSearch] = useState(query.get('q') ?? '');
  const [track, setTrack] = useState<TrackId | 'all'>('all');
  const [tag, setTag] = useState('');
  const [since, setSince] = useState('');
  const [mistakes, setMistakes] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState('');
  const index = useMemo(() => {
    const engine = new MiniSearch({
      fields: ['title', 'body', 'tags'],
      storeFields: ['id'],
      searchOptions: { prefix: true, fuzzy: 0.2 },
    });
    engine.addAll(progress.notes.map((n) => ({ ...n, tags: n.tags.join(' ') })));
    engine.addAll(
      progress.log
        .filter((e) => !e.hidden)
        .map((e) => ({
          id: `log:${e.id}`,
          title: e.title,
          body: `${e.learned} ${e.interview} ${e.resume}`,
          tags: e.confidence,
        })),
    );
    return engine;
  }, [progress.notes, progress.log]);
  const matches = search ? new Set(index.search(search).map((r) => r.id)) : undefined;
  const notes = progress.notes
    .filter(
      (n) =>
        (!matches || matches.has(n.id)) &&
        (track === 'all' || n.track === track) &&
        (!tag || n.tags.includes(tag)) &&
        (!since || n.created.slice(0, 10) >= since) &&
        (!mistakes || n.tags.includes('mistake')),
    )
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updated.localeCompare(a.updated));
  const logs = progress.log.filter(
    (l) =>
      !l.hidden &&
      (!matches || matches.has(`log:${l.id}`)) &&
      (track === 'all' || l.track === track) &&
      (!since || l.date.slice(0, 10) >= since) &&
      !mistakes &&
      !tag,
  );
  const compiled = progress.notes
    .filter((n) => selected.includes(n.id))
    .map(noteMarkdown)
    .join('\n\n---\n\n');
  function add() {
    let id = '';
    update((p) => {
      id = createNote(p, 'New standalone note', '', track === 'all' ? undefined : track, []).id;
    });
    setEditing(id);
  }
  return (
    <main>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR SECOND BRAIN, ON YOUR MACHINE</span>
          <h1>
            Keep the <em>insight.</em>
          </h1>
          <p className="muted">
            Notes, mistakes, and your searchable Learning Log. Markdown in, Markdown out.
          </p>
        </div>
        <div className="button-row">
          <button onClick={add}>
            <FilePlus size={16} /> New note
          </button>
          <button
            onClick={() =>
              void exportNotebook(progress.notes).catch((e: unknown) =>
                notify(`Export failed: ${String(e)}`),
              )
            }
          >
            <Download size={16} /> Notebook ZIP
          </button>
          <button
            onClick={() =>
              download('geekcode-notebook.md', progress.notes.map(noteMarkdown).join('\n\n---\n\n'))
            }
          >
            Combined Markdown
          </button>
        </div>
      </div>
      <div className="filters">
        <label className="search-field">
          <Search size={16} />
          <input
            aria-label="Search notes"
            placeholder="Search notes and Learning Log…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <TrackFilter value={track} onChange={setTrack} />
        <select aria-label="Filter tag" value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">All tags</option>
          {[...new Set(progress.notes.flatMap((n) => n.tags))].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <input
          aria-label="Notes since date"
          type="date"
          value={since}
          onChange={(e) => setSince(e.target.value)}
        />
        <label className="small">
          <input
            type="checkbox"
            checked={mistakes}
            onChange={(e) => setMistakes(e.target.checked)}
          />{' '}
          Mistakes only
        </label>
      </div>
      <div className="section-heading">
        <h2>
          My notebook <span className="muted small">{notes.length} notes</span>
        </h2>
        <div className="button-row">
          <button
            disabled={!selected.length}
            onClick={() =>
              download('geekcode-cheat-sheet.md', `# Personal cheat sheet\n\n${compiled}`)
            }
          >
            Compile {selected.length} selected
          </button>
          <button disabled={!selected.length} onClick={() => window.print()}>
            Print selected / PDF
          </button>
        </div>
      </div>
      <div className="notebook-grid">
        {notes.map((note) => (
          <article
            className={`card note-card ${selected.includes(note.id) ? 'print-selected' : ''}`}
            key={note.id}
          >
            <div className="section-heading">
              <label className="small">
                <input
                  type="checkbox"
                  checked={selected.includes(note.id)}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked
                        ? [...selected, note.id]
                        : selected.filter((id) => id !== note.id),
                    )
                  }
                />{' '}
                Cheat sheet
              </label>
              <button
                onClick={() =>
                  update((p) => {
                    const n = p.notes.find((n) => n.id === note.id);
                    if (n) n.pinned = !n.pinned;
                  })
                }
              >
                {note.pinned ? '★ Pinned' : 'Pin'}
              </button>
            </div>
            {editing === note.id ? (
              <>
                <input
                  aria-label="Edit note title"
                  value={note.title}
                  onChange={(e) =>
                    update((p) => {
                      const n = p.notes.find((n) => n.id === note.id);
                      if (n) n.title = e.target.value;
                    })
                  }
                />
                <input
                  aria-label="Edit note tags"
                  defaultValue={note.tags.join(', ')}
                  onBlur={(e) =>
                    update((p) => {
                      const n = p.notes.find((n) => n.id === note.id);
                      if (n)
                        n.tags = e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean);
                    })
                  }
                />
                <textarea
                  aria-label="Edit note body"
                  value={note.body}
                  onChange={(e) =>
                    update((p) => {
                      const n = p.notes.find((n) => n.id === note.id);
                      if (n) {
                        n.body = e.target.value;
                        n.updated = new Date().toISOString();
                        rewardNote(p, n);
                      }
                    })
                  }
                />
                <Markdown>{note.body}</Markdown>
                <button onClick={() => setEditing('')}>Done editing · auto-saved</button>
              </>
            ) : (
              <>
                <h3>{note.title}</h3>
                <Markdown>{note.body}</Markdown>
                <button onClick={() => setEditing(note.id)}>Edit</button>
              </>
            )}
            <div className="tag-list">
              {note.tags.map((t) => (
                <span key={t} className="pill">
                  {t}
                </span>
              ))}
            </div>
            <p className="tiny muted">
              {new Date(note.updated).toLocaleString()}
              {note.context && (
                <>
                  {' '}
                  ·{' '}
                  <a
                    href={`#/${note.context.startsWith('lesson-') ? 'lesson' : 'problem'}/${note.context}`}
                  >
                    Source ↗
                  </a>
                </>
              )}
            </p>
            <div className="button-row">
              <button
                onClick={() => {
                  try {
                    let added = false;
                    update((p) => {
                      added = noteToCard(p, note);
                    });
                    notify(added ? 'Personal flashcard created.' : 'This note already has a card.');
                  } catch (e) {
                    notify(String(e));
                  }
                }}
              >
                Make flashcard
              </button>
              <button onClick={() => download(`${note.id}.md`, noteMarkdown(note))}>Export</button>
              <button
                className="danger"
                onClick={() => {
                  if (window.confirm(`Delete "${note.title}"?`))
                    update((p) => {
                      p.notes = p.notes.filter((n) => n.id !== note.id);
                    });
                }}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
      {!notes.length && (
        <p className="empty">
          Capture your first thought in a problem or lesson, or start a standalone note.
        </p>
      )}
      <section className="learning-log">
        <h2>
          Learning Log{' '}
          <span className="small muted">Auto-maintained · separate from your own notes</span>
        </h2>
        {logs.map((entry) => (
          <article className="card" key={entry.id}>
            <div className="section-heading">
              <h3>{entry.title}</h3>
              <span className="pill">{entry.confidence}</span>
            </div>
            <p>{entry.learned}</p>
            <p className="small muted">{entry.interview}</p>
            <p className="tiny muted">{entry.evidence}</p>
            <a href="#/career">Edit, promote, or hide in Career ↗</a>
          </article>
        ))}
        {!logs.length && (
          <p className="muted">
            Finish a lesson, Quick Learn, or problem to start your evidence trail.
          </p>
        )}
      </section>
    </main>
  );
}
