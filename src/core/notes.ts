import type { TrackId } from '../content/schema';
import type { Note, Progress } from './model';
import { dayKey } from './learning';
export function rewardNote(progress: Progress, note: Note): void {
  const meaningful = note.body
    .split('\n')
    .filter((line) => !line.trim().startsWith('#') && !line.trim().startsWith('Source:'))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  const key = note.context || 'standalone-notebook';
  if (
    !note.tags.includes('mistake') ||
    meaningful.length < 80 ||
    progress.rewardedNotes.includes(key)
  )
    return;
  progress.xp += 5;
  progress.rewardedNotes.push(key);
  progress.activity[dayKey()] = (progress.activity[dayKey()] ?? 0) + 1;
}
export function createNote(
  progress: Progress,
  body: string,
  context = '',
  track?: TrackId,
  tags: string[] = [],
): Note {
  const date = new Date().toISOString();
  const note: Note = {
    id: crypto.randomUUID(),
    title:
      body
        .replace(/^#+\s*/, '')
        .split('\n')[0]
        .slice(0, 65) || 'Untitled insight',
    body,
    context,
    track,
    tags,
    created: date,
    updated: date,
    pinned: false,
  };
  progress.notes.push(note);
  rewardNote(progress, note);
  return note;
}
export function noteToCard(progress: Progress, note: Note): boolean {
  if (note.body.trim().length < 40)
    throw new Error('Add at least 40 characters of useful explanation before making a card.');
  if (progress.cards.some((c) => c.id === `note-${note.id}`)) return false;
  progress.cards.push({
    id: `note-${note.id}`,
    front: note.title,
    back: note.body,
    track: note.track,
  });
  const rewardKey = note.context || 'standalone-notebook';
  if (!progress.rewardedNotes.includes(rewardKey)) {
    progress.xp += 5;
    progress.rewardedNotes.push(rewardKey);
  }
  return true;
}
