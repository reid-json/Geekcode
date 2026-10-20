import { useEffect, useState } from 'react';
import { FilePlus, Pin, X, NotebookPen } from 'lucide-react';
import type { TrackId } from '../content/schema';
import { useStore } from '../core/store';
import { createNote, noteToCard, rewardNote } from '../core/notes';
import { download, noteMarkdown } from '../core/exports';
import Markdown from './Markdown';

export default function NotesPanel({
  context,
  track,
  topic,
  open,
  onClose,
}: {
  context: string;
  track?: TrackId;
  topic?: string;
  open: boolean;
  onClose: () => void;
}) {
  const { progress, update, notify } = useStore();
  const notes = progress.notes
    .filter((n) => n.context === context)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updated.localeCompare(a.updated));
  const [selected, setSelected] = useState('');
  const note = notes.find((n) => n.id === selected) ?? notes[0];
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    if (!open) return;
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [open, onClose]);
  if (!open) return null;
  function add() {
    let id = '';
    update((p) => {
      id = createNote(p, '', context, track, topic ? [topic] : []).id;
    });
    setSelected(id);
  }
  function edit(body: string) {
    update((p) => {
      const found = p.notes.find((n) => n.id === note?.id);
      if (found) {
        found.body = body;
        found.updated = new Date().toISOString();
        rewardNote(p, found);
      }
    });
  }
  const commands: Record<string, string> = {
    '/code': '\n```text\n\n```\n',
    '/todo': '\n- [ ] \n',
    '/callout': '\n> Insight: \n',
    '/complexity': '\n## Complexity\nTime: $O(n)$\nSpace: $O(1)$\n',
  };
  return (
    <aside className="notes-drawer" role="dialog" aria-modal="false" aria-label="Context notes">
      <div className="section-heading">
        <h2>
          <NotebookPen size={20} /> Smart notes
        </h2>
        <button aria-label="Close notes" onClick={onClose}>
          <X size={17} />
        </button>
      </div>
      <p className="muted small">Auto-saved locally · {notes.length} linked notes</p>
      <div className="button-row">
        <button onClick={add}>
          <FilePlus size={15} /> New note
        </button>
        <a href="#/notes">All notebooks ↗</a>
      </div>
      {notes.length > 0 && (
        <select
          aria-label="Linked note"
          value={note?.id}
          onChange={(e) => setSelected(e.target.value)}
        >
          {notes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.pinned ? '★ ' : ''}
              {n.title}
            </option>
          ))}
        </select>
      )}
      {note ? (
        <>
          <input
            aria-label="Note title"
            value={note.title}
            onChange={(e) =>
              update((p) => {
                const n = p.notes.find((n) => n.id === note.id);
                if (n) n.title = e.target.value;
              })
            }
          />
          <input
            key={`tags-${note.id}`}
            aria-label="Note tags"
            list="note-tags"
            defaultValue={note.tags.join(', ')}
            onBlur={(e) =>
              update((p) => {
                const n = p.notes.find((n) => n.id === note.id);
                if (n)
                  n.tags = e.target.value
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean);
              })
            }
          />
          <datalist id="note-tags">
            {[...new Set(progress.notes.flatMap((n) => n.tags))].map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          <div className="button-row">
            <button onClick={() => setPreview(!preview)}>
              {preview ? 'Edit Markdown' : 'Live preview'}
            </button>
            <button
              aria-label="Pin note"
              onClick={() =>
                update((p) => {
                  const n = p.notes.find((n) => n.id === note.id);
                  if (n) n.pinned = !n.pinned;
                })
              }
            >
              <Pin size={15} />
              {note.pinned ? 'Unpin' : 'Pin'}
            </button>
          </div>
          <textarea
            className="note-editor"
            aria-label="Note Markdown"
            value={note.body}
            onChange={(e) => edit(e.target.value)}
            placeholder="Think in Markdown. Try /code, /todo, /callout, /complexity or [[another note]]."
          />
          <div className="slash-menu">
            {Object.entries(commands).map(([cmd, insert]) => (
              <button
                key={cmd}
                onClick={() => edit(note.body.replace(new RegExp(`${cmd}$`), '') + insert)}
              >
                {cmd}
              </button>
            ))}
          </div>
          {preview && <Markdown>{note.body}</Markdown>}
          <div className="button-row">
            <button
              onClick={() => {
                try {
                  let added = false;
                  update((p) => {
                    added = noteToCard(p, note);
                  });
                  notify(added ? 'Added to spaced review.' : 'This note already has a flashcard.');
                } catch (e) {
                  notify(String(e));
                }
              }}
            >
              Make flashcard
            </button>
            <button onClick={() => download(`${note.id}.md`, noteMarkdown(note))}>
              Export .md
            </button>
          </div>
          <h3>Backlinks</h3>
          {progress.notes
            .filter((n) => n.id !== note.id && n.body.includes(`[[${note.title}]]`))
            .map((n) => (
              <a key={n.id} href={`#/notes?q=${encodeURIComponent(n.title)}`}>
                {n.title}
              </a>
            ))}
        </>
      ) : (
        <p className="empty">
          Capture a thought below or start a note. It will be here when you return.
        </p>
      )}
    </aside>
  );
}
export function QuickCapture({
  context,
  track,
  topic,
  onOpen,
}: {
  context: string;
  track: TrackId;
  topic: string;
  onOpen: () => void;
}) {
  const [value, setValue] = useState('');
  const { update, notify } = useStore();
  return (
    <form
      className="quick-capture"
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        update((p) => {
          createNote(p, value.trim(), context, track, [topic]);
        });
        setValue('');
        notify('Thought captured. Linked to this page.');
      }}
    >
      <NotebookPen size={17} />
      <input
        aria-label="Quick capture"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Capture a thought. Enter to keep it."
      />
      <button type="submit">↵</button>
      <button type="button" onClick={onOpen}>
        Notes <kbd>N</kbd>
      </button>
    </form>
  );
}
export function useNotesShortcut(toggle: () => void) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.matches('input,textarea,select') ||
          target.isContentEditable ||
          target.closest('.monaco-editor'))
      )
        return;
      if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [toggle]);
}
