import { describe, expect, it } from 'vitest';
import { problems, lessons, tracks, flashcards } from '../../src/content';
import { validateCatalog, validateCoach } from '../../src/core/content-validation';
import { validateStatic } from '../../src/engines/static';
import { equal } from '../../src/engines/protocol';
import { quickTransfer } from '../../src/content/quick-transfer';

describe('curriculum and spoiler prevention', () => {
  it('meets exact launch thresholds and has complete metadata', () => {
    expect(problems.length).toBeGreaterThanOrEqual(150);
    expect(lessons.length).toBeGreaterThanOrEqual(40);
    expect(flashcards.length).toBeGreaterThanOrEqual(200);
    expect(lessons.filter((l) => l.quick).length).toBeGreaterThanOrEqual(20);
    expect(Object.keys(quickTransfer).length).toBeGreaterThanOrEqual(20);
    expect(validateCatalog(problems, lessons, tracks)).toEqual([]);
  });
  it('rejects early forbidden terms, solution code, and reference similarity', () => {
    const c = structuredClone(problems[0].coach);
    c.stages[0].question = 'Try hash maps now.';
    expect(validateCoach(c).length).toBeGreaterThan(0);
    c.stages[0].question = '```javascript\nfunction solve(a) { return a; }\n```';
    expect(validateCoach(c).length).toBeGreaterThan(0);
  });
  it('checks ordering rather than just command membership', () => {
    const p = problems.find((p) => p.id === 'git-conflict-recovery')!;
    expect(validateStatic(p, p.reference.text!).tests.every((t) => t.passed)).toBe(true);
    expect(
      validateStatic(p, [...p.answer!].reverse().join('\n')).tests.every((t) => t.passed),
    ).toBe(false);
  });
  it('does not let malformed or duplicate-key YAML pass', () => {
    const p = problems.find((p) => p.id === 'service-target-port')!;
    expect(validateStatic(p, 'spec: [broken').error).toBeTruthy();
    expect(validateStatic(p, 'kind: Service\nkind: Pod').error).toBeTruthy();
  });
  it('compares numeric tolerances and object shapes without coercing types', () => {
    expect(equal(1 / 3, 0.333333333)).toBe(true);
    expect(equal({ a: 1, b: [2] }, { b: [2], a: 1 })).toBe(true);
    expect(equal('1', 1)).toBe(false);
    expect(equal([1], [1, 2])).toBe(false);
    expect(equal(NaN, NaN)).toBe(false);
  });
});
