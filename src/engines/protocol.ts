import type { Language, Problem } from '../content/schema';

export interface TestResult {
  label: string;
  passed: boolean;
  input: unknown[];
  expected: unknown;
  actual?: unknown;
  error?: string;
  runtime: number;
}
export interface RunResult {
  tests: TestResult[];
  console: string[];
  runtime: number;
  error?: string;
}
export interface RunRequest {
  code: string;
  language: Language;
  problem: Problem;
  submit: boolean;
  base: string;
}
export type WorkerReply =
  { type: 'status'; message: string } | { type: 'result'; result: RunResult };
export function equal(actual: unknown, expected: unknown): boolean {
  if (typeof actual === 'number' && typeof expected === 'number')
    return (
      Number.isFinite(actual) &&
      Math.abs(actual - expected) <= 1e-6 * Math.max(1, Math.abs(expected))
    );
  if (Array.isArray(actual) && Array.isArray(expected))
    return actual.length === expected.length && actual.every((v, i) => equal(v, expected[i]));
  if (
    actual !== null &&
    expected !== null &&
    typeof actual === 'object' &&
    typeof expected === 'object'
  ) {
    const a = Object.keys(actual);
    const b = Object.keys(expected);
    return (
      a.length === b.length &&
      a.every(
        (key) =>
          Object.hasOwn(expected, key) &&
          equal(Reflect.get(actual, key), Reflect.get(expected, key)),
      )
    );
  }
  return actual === expected;
}
