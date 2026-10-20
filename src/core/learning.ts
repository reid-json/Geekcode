import type { Difficulty, Mode, Problem, TrackId } from '../content/schema';
import type { Attempt, Progress, Review } from './model';
import { careerRules } from '../content/career-rules';

export function dayKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function shiftedDay(day: string, amount: number): string {
  const date = new Date(`${day}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return dayKey(date);
}
export function xpFor(
  difficulty: Difficulty,
  hints: number,
  firstTry: boolean,
  mode: Mode,
): number {
  const base = { Easy: 50, Medium: 90, Hard: 150 }[difficulty];
  return Math.max(
    10,
    base -
      (mode === 'practice' ? hints * 8 : 0) +
      (firstTry ? 15 : 0) +
      (mode === 'guided' ? 20 : 0),
  );
}
export function levelFor(xp: number) {
  let level = 1;
  let floor = 0;
  let next = 150;
  while (xp >= next) {
    level++;
    floor = next;
    next += level * 150;
  }
  return { level, floor, next, fraction: (xp - floor) / (next - floor) };
}
export function schedule(previous: Review | undefined, quality: number, now = new Date()): Review {
  if (!Number.isInteger(quality) || quality < 0 || quality > 5)
    throw new Error('Review quality must be an integer from 0 to 5.');
  const old = previous ?? { interval: 0, ease: 2.5, repetitions: 0, due: now.toISOString() };
  const repetitions = quality < 3 ? 0 : old.repetitions + 1;
  const interval =
    quality < 3
      ? 1
      : repetitions === 1
        ? 1
        : repetitions === 2
          ? 6
          : Math.round(old.interval * old.ease);
  const ease = Math.max(1.3, old.ease + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  const due = new Date(now);
  due.setDate(due.getDate() + interval);
  return { repetitions, interval, ease, due: due.toISOString() };
}
export function streak(
  progress: Pick<Progress, 'activity' | 'freezeDates'>,
  today = dayKey(),
): number {
  let day = progress.activity[today] ? today : shiftedDay(today, -1);
  let count = 0;
  for (let i = 0; i < 10000; i++) {
    if (progress.activity[day]) count++;
    else if (!progress.freezeDates.includes(day)) break;
    day = shiftedDay(day, -1);
  }
  return count;
}
export function dailyIndex(length: number, date = dayKey()): number {
  let hash = 0;
  for (const character of date) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return length ? hash % length : 0;
}
export function independence(attempts: Attempt[]): number {
  if (!attempts.length) return 0;
  const recent = attempts.slice(-10);
  return Math.round(
    (100 * recent.reduce((sum, a) => sum + (a.passed ? 1 / (1 + a.hints + a.stuck * 0.5) : 0), 0)) /
      recent.length,
  );
}
export function readiness(
  progress: Progress,
  problems: Problem[],
  track: TrackId,
  now = Date.now(),
): number {
  const pool = problems.filter((p) => p.track === track);
  if (!pool.length) return 0;
  const attempts = progress.attempts.filter((a) => a.track === track);
  const solved = pool.filter((p) => progress.solved[p.id]);
  const breadth = new Set(solved.map((p) => p.topic)).size / new Set(pool.map((p) => p.topic)).size;
  const timed = attempts.filter((a) => a.mode === 'interview');
  const timedRate = timed.length ? timed.filter((a) => a.passed).length / timed.length : 0;
  const weights = careerRules.readiness;
  const recency = solved.length
    ? solved.reduce(
        (s, p) =>
          s +
          Math.min(
            1,
            Math.max(
              weights.minimumRecency,
              1 - (now - Date.parse(progress.solved[p.id])) / (weights.decayDays * 86400000),
            ),
          ),
        0,
      ) / solved.length
    : 0;
  return Math.round(
    100 *
      recency *
      ((weights.mastery * solved.length) / pool.length +
        weights.breadth * breadth +
        (weights.independence * independence(attempts)) / 100 +
        weights.timed * timedRate),
  );
}
export function canShowEditorial(solved: boolean, mode: Mode): boolean {
  return solved && mode !== 'interview';
}
export function checkInsight(
  answer: string,
  insights: string[][],
): { passed: boolean; missing: string[] } {
  const text = answer.toLowerCase();
  const missing = insights
    .filter((group) => !group.some((phrase) => text.includes(phrase.toLowerCase())))
    .map((group) => group[0]);
  return { passed: !missing.length && text.trim().length >= 20, missing };
}
