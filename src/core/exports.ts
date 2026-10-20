import JSZip from 'jszip';
import type { Note, Progress } from './model';
import { initialProgress } from './model';

export function download(name: string, text: string | Blob, type = 'text/markdown;charset=utf-8') {
  const url = URL.createObjectURL(typeof text === 'string' ? new Blob([text], { type }) : text);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function noteMarkdown(note: Note): string {
  return `# ${note.title}\n\nTags: ${note.tags.join(', ')}\nSource: ${note.context ? `#/${note.context.startsWith('lesson-') ? 'lesson' : 'problem'}/${note.context}` : 'Standalone'}\nUpdated: ${note.updated}\n\n${note.body}`;
}
export async function exportNotebook(notes: Note[]) {
  const zip = new JSZip();
  notes.forEach((note) => zip.file(`${note.id}.md`, noteMarkdown(note)));
  download('geekcode-notebook.zip', await zip.generateAsync({ type: 'blob' }));
}
type Check = (value: unknown) => boolean;
const string: Check = (v) => typeof v === 'string' && v.length <= 2_000_000;
const number: Check = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const boolean: Check = (v) => typeof v === 'boolean';
const record = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);
const list =
  (check: Check): Check =>
  (v) =>
    Array.isArray(v) && v.length <= 100_000 && v.every(check);
const map =
  (check: Check): Check =>
  (v) =>
    record(v) && Object.values(v).every(check);
const oneOf =
  (...values: unknown[]): Check =>
  (v) =>
    values.includes(v);
const optional =
  (check: Check): Check =>
  (v) =>
    v === undefined || check(v);
const shape =
  (fields: Record<string, Check>): Check =>
  (v) =>
    record(v) && Object.entries(fields).every(([k, check]) => check(v[k]));
const date: Check = (v) => string(v) && typeof v === 'string' && Number.isFinite(Date.parse(v));
const strings = list(string);
const track = oneOf('dsa', 'syntax', 'devops', 'ai', 'sql', 'systems');
const mode = oneOf('guided', 'practice', 'interview');
const language = oneOf('javascript', 'typescript', 'python', 'sql', 'java', 'yaml', 'text');
const settings = shape({
  theme: oneOf('dark', 'light'),
  fontSize: (v) => number(v) && typeof v === 'number' && v >= 10 && v <= 28,
  keybindings: oneOf('default', 'vim'),
  language,
  sound: boolean,
  reducedMotion: boolean,
  role: oneOf('Backend SWE', 'DevOps/SRE', 'ML/AI Engineer'),
  dailyMinutes: (v) => number(v) && typeof v === 'number' && v >= 5 && v <= 240,
  interviewDate: string,
  milestoneThreshold: (v) => number(v) && typeof v === 'number' && v >= 50 && v <= 100,
});
const progressCheck = shape({
  version: oneOf(1),
  xp: number,
  attempts: list(
    shape({
      id: string,
      problemId: string,
      track,
      date,
      passed: boolean,
      hints: number,
      stuck: number,
      language,
      mode,
      elapsed: number,
      runtime: number,
      xp: number,
    }),
  ),
  solved: map(date),
  completedLessons: strings,
  completedQuick: strings,
  notes: list(
    shape({
      id: string,
      title: string,
      body: string,
      tags: strings,
      track: optional(track),
      context: string,
      created: date,
      updated: date,
      pinned: boolean,
      reviewDue: optional(date),
    }),
  ),
  cards: list(shape({ id: string, front: string, back: string, track: optional(track) })),
  reviews: map(
    shape({
      interval: number,
      ease: (v) => number(v) && typeof v === 'number' && v >= 1.3,
      repetitions: number,
      due: date,
    }),
  ),
  log: list(
    shape({
      id: string,
      source: string,
      sourceType: oneOf('problem', 'lesson', 'quick'),
      track,
      title: string,
      learned: string,
      interview: string,
      resume: string,
      evidence: string,
      confidence: oneOf('solid', 'shaky', 'needs review'),
      date,
      promoted: boolean,
      hidden: boolean,
    }),
  ),
  reports: list(shape({ id: string, title: string, track: optional(track), date, body: string })),
  stories: list(
    shape({
      id: string,
      title: string,
      competency: string,
      situation: string,
      task: string,
      action: string,
      result: string,
    }),
  ),
  drafts: map(string),
  coachStages: map(number),
  help: map(shape({ hints: number, stuck: number })),
  modes: map(mode),
  languages: map(language),
  activity: map(number),
  freezes: number,
  freezeDates: strings,
  rewardedNotes: strings,
  settings,
  onboarding: boolean,
  placement: map(number),
  lastProblem: optional(string),
  resume: string,
  starDraft: optional(string),
});
export function parseProgress(text: string): Progress {
  if (text.length > 30_000_000) throw new Error('Backup exceeds the 30 MB import limit.');
  const data: unknown = JSON.parse(text, (key, value: unknown) => {
    if (['__proto__', 'prototype', 'constructor'].includes(key))
      throw new Error('Unsafe key in backup.');
    return value;
  });
  if (!record(data)) throw new Error('Backup must be an object.');
  if (data.version !== 1) throw new Error('Unsupported or missing backup version.');
  const merged = { help: initialProgress().help, ...data };
  assertProgress(merged);
  return merged;
}
function assertProgress(value: unknown): asserts value is Progress {
  if (!progressCheck(value))
    throw new Error('Invalid or unsupported Geekcode backup. No data was changed.');
}
