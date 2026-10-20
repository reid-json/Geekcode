import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { flashcards, tracks } from '../content';
import type { TrackId } from '../content/schema';
import { useStore } from '../core/store';
import { dayKey, schedule } from '../core/learning';
import { TrackFilter } from './Problems';
import Markdown from '../components/Markdown';

export default function Review() {
  const { progress, update } = useStore();
  const [track, setTrack] = useState<TrackId | 'all'>('all');
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const now = new Date().toISOString();
  const queue = [...progress.cards, ...flashcards].filter(
    (c) =>
      (track === 'all' || c.track === track) &&
      (!progress.reviews[c.id] || progress.reviews[c.id].due <= now),
  );
  const card = queue[0];
  const dueMistakes = progress.notes.filter(
    (n) => n.tags.includes('mistake') && (!n.reviewDue || n.reviewDue <= now),
  );
  function rate(quality: number) {
    if (!card) return;
    update((p) => {
      p.reviews[card.id] = schedule(p.reviews[card.id], quality);
      p.activity[dayKey()] = (p.activity[dayKey()] ?? 0) + 1;
    });
    setRevealed(false);
    setReviewed((n) => n + 1);
  }
  return (
    <main className="review-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">RETRIEVE. REFLECT. RETAIN.</span>
          <h1>
            Make it <em>stick.</em>
          </h1>
          <p className="muted">
            SM-2 scheduling · {queue.length} due/new · {reviewed} reviewed this session
          </p>
        </div>
        <TrackFilter
          value={track}
          onChange={(value) => {
            setTrack(value);
            setRevealed(false);
          }}
        />
      </div>
      {card ? (
        <section className="flashcard">
          <span className="eyebrow">
            {tracks.find((t) => t.id === card.track)?.short ?? 'PERSONAL NOTE'} / ACTIVE RECALL
          </span>
          <h2>{card.front}</h2>
          {revealed ? (
            <>
              <div className="flashcard-back">
                <Markdown>{card.back}</Markdown>
              </div>
              <p className="small muted">
                Rate your recall honestly. Revealing is expected; it is not a scored solve.
              </p>
              <div className="review-ratings">
                <button onClick={() => rate(1)}>
                  Again <small>1 day</small>
                </button>
                <button onClick={() => rate(3)}>
                  Hard <small>Shorter interval</small>
                </button>
                <button className="primary" onClick={() => rate(4)}>
                  Good <small>Keep spacing</small>
                </button>
                <button onClick={() => rate(5)}>
                  Easy <small>Grow interval</small>
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="muted">Say it aloud or write it before you flip.</p>
              <button className="primary" onClick={() => setRevealed(true)}>
                <RotateCcw size={16} /> Reveal review answer
              </button>
            </>
          )}
        </section>
      ) : (
        <div className="empty card">
          <h2>All caught up.</h2>
          <p>
            Your next reviews will appear when due. Head to a lesson or practice instead of cramming
            the same cards.
          </p>
          <a href="#/library">Explore the library ↗</a>
        </div>
      )}
      <section className="card">
        <h2>Review mistakes</h2>
        <p className="small muted">
          Reflection notes reappear on a spaced schedule. After reviewing, they return in 3 days.
        </p>
        {dueMistakes.slice(0, 10).map((note) => (
          <details key={note.id}>
            <summary>{note.title}</summary>
            <Markdown>{note.body}</Markdown>
            <button
              onClick={() =>
                update((p) => {
                  const n = p.notes.find((n) => n.id === note.id);
                  if (n) {
                    const date = new Date();
                    date.setDate(date.getDate() + 3);
                    n.reviewDue = date.toISOString();
                  }
                })
              }
            >
              Reviewed · revisit in 3 days
            </button>
          </details>
        ))}
        {!dueMistakes.length && (
          <p className="muted">
            No mistake notes due. Capture one after a failed submission to build your review bank.
          </p>
        )}
      </section>
    </main>
  );
}
