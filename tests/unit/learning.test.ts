import { describe, expect, it } from 'vitest';
import {
  xpFor,
  levelFor,
  schedule,
  streak,
  canShowEditorial,
  dailyIndex,
  readiness,
} from '../../src/core/learning';
import { initialProgress } from '../../src/core/model';
import { completeLesson, completeProblem, reportBody } from '../../src/core/completion';
import { problems } from '../../src/content';
import { createNote, noteToCard, rewardNote } from '../../src/core/notes';
import { parseProgress } from '../../src/core/exports';

describe('progression and evidence integrity', () => {
  it('rewards guided learning without an assistance penalty and limits Practice penalties', () => {
    expect(xpFor('Medium', 100, false, 'guided')).toBe(110);
    expect(xpFor('Medium', 1, false, 'practice')).toBe(82);
    expect(xpFor('Easy', 100, false, 'practice')).toBe(10);
    expect(levelFor(149).level).toBe(1);
    expect(levelFor(150).level).toBe(2);
  });
  it('does not farm solve or lesson XP and improves confidence after an independent re-solve', () => {
    const p = initialProgress();
    const problem = problems[0];
    p.help[problem.id] = { hints: 2, stuck: 1 };
    const input = {
      passed: true,
      language: 'javascript' as const,
      mode: 'practice' as const,
      elapsed: 1000,
      runtime: 1,
    };
    const first = completeProblem(p, problem, input);
    expect(first.xp).toBeGreaterThan(0);
    expect(p.log[0].confidence).toBe('shaky');
    const second = completeProblem(p, problem, input);
    expect(second.xp).toBe(0);
    expect(p.log).toHaveLength(1);
    expect(p.log[0].confidence).toBe('solid');
    const before = p.xp;
    expect(completeLesson(p, 'lesson-hash-maps')).toBe(true);
    expect(completeLesson(p, 'lesson-hash-maps')).toBe(false);
    expect(p.xp - before).toBe(15);
  });
  it('cannot claim readiness or resume solve evidence from reading alone', () => {
    const p = initialProgress();
    completeLesson(p, 'lesson-hash-maps');
    expect(readiness(p, problems, 'dsa')).toBe(0);
    expect(reportBody(p)).toContain('No independent problem-solving evidence');
    expect(p.log[0].confidence).toBe('needs review');
  });
  it('bridges freezes without counting them as learning days', () => {
    expect(
      streak(
        { activity: { '2026-01-03': 1, '2026-01-01': 1 }, freezeDates: ['2026-01-02'] },
        '2026-01-03',
      ),
    ).toBe(2);
    expect(streak({ activity: { '2026-01-01': 1 }, freezeDates: [] }, '2026-01-03')).toBe(0);
  });
  it('keeps the challenge deterministic and editorial gated in every mode', () => {
    expect(dailyIndex(156, '2026-01-01')).toBe(dailyIndex(156, '2026-01-01'));
    for (const mode of ['guided', 'practice', 'interview'] as const)
      expect(canShowEditorial(false, mode)).toBe(false);
    expect(canShowEditorial(true, 'guided')).toBe(true);
    expect(canShowEditorial(true, 'interview')).toBe(false);
  });
  it('requires meaningful notes and rewards a context only once', () => {
    const p = initialProgress();
    const note = createNote(
      p,
      'A meaningful review that explains the missed boundary and how I will recognize the same bug in future tests.',
      'p1',
      'dsa',
      ['mistake'],
    );
    expect(p.xp).toBe(5);
    expect(noteToCard(p, note)).toBe(true);
    expect(p.xp).toBe(5);
    expect(noteToCard(p, note)).toBe(false);
    expect(() => noteToCard(p, { ...note, id: 'small', body: 'x' })).toThrow();
  });
  it('does not reward empty mistake templates or unlimited standalone cards', () => {
    const p = initialProgress();
    const note = createNote(
      p,
      '# Mistake\n\n## What I tried\n\n## What the bug was\n\n## Pattern I missed\n\n## How to spot it next time\n',
      'p2',
      'dsa',
      ['mistake'],
    );
    expect(p.xp).toBe(0);
    note.body +=
      'I reused the same index twice because I stored the current element before checking the earlier elements. I will test a one-element input first.';
    rewardNote(p, note);
    expect(p.xp).toBe(5);
    const first = createNote(
      p,
      'A real standalone explanation with sufficient detail to become a meaningful review card.',
    );
    const second = createNote(
      p,
      'Another real standalone explanation with sufficient detail to become a meaningful review card.',
    );
    noteToCard(p, first);
    noteToCard(p, second);
    expect(p.xp).toBe(10);
  });
  it('roundtrips complete progress and rejects malformed or unsafe backups', () => {
    const p = initialProgress();
    expect(parseProgress(JSON.stringify(p))).toEqual(p);
    expect(() => parseProgress('{"version":2}')).toThrow();
    expect(() => parseProgress(JSON.stringify({ ...p, xp: -1 }))).toThrow();
    expect(() => parseProgress(JSON.stringify({ ...p, notes: [{ body: 4 }] }))).toThrow();
    expect(() => parseProgress('{"__proto__":{}}')).toThrow();
  });
});
describe('SM-2 scheduler', () => {
  it('uses one day, six days, and a growing interval; lapse resets repetitions', () => {
    const now = new Date('2026-01-01T12:00:00Z');
    const first = schedule(undefined, 4, now);
    expect(first.interval).toBe(1);
    const second = schedule(first, 4, now);
    expect(second.interval).toBe(6);
    const third = schedule(second, 5, now);
    expect(third.interval).toBeGreaterThan(6);
    expect(schedule(third, 1, now)).toMatchObject({ interval: 1, repetitions: 0 });
    expect(() => schedule(undefined, 6, now)).toThrow();
  });
});
