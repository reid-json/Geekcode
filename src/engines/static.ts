import { parseDocument } from 'yaml';
import type { Problem } from '../content/schema';
import type { RunResult } from './protocol';

export function validateStatic(problem: Problem, code: string): RunResult {
  const start = performance.now();
  let document: unknown;
  if (problem.languages.includes('yaml')) {
    const parsed = parseDocument(code, { uniqueKeys: true });
    if (parsed.errors.length)
      return {
        tests: [],
        console: [],
        runtime: 0,
        error: parsed.errors.map((e) => e.message).join('\n'),
      };
    document = parsed.toJS({ maxAliasCount: 50 });
  }
  const lines = code
    .trim()
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  if (problem.kind === 'multi-select') lines.sort();
  const tests = problem.answer
    ? [
        {
          label: 'Authored answer check',
          passed:
            JSON.stringify(lines) ===
            JSON.stringify(
              problem.kind === 'multi-select' ? [...problem.answer].sort() : problem.answer,
            ),
          input: [],
          expected: 'Match all required choices / output lines',
          actual: code,
          runtime: performance.now() - start,
        },
      ]
    : (problem.rules ?? []).map((rule) => {
        let value: unknown = document;
        if (rule.path)
          for (const key of rule.path.split('.'))
            value =
              value !== null && typeof value === 'object' ? Reflect.get(value, key) : undefined;
        return {
          label: rule.label,
          passed:
            (!rule.pattern || new RegExp(rule.pattern, 'im').test(code)) &&
            (!rule.notPattern || !new RegExp(rule.notPattern, 'im').test(code)) &&
            (!rule.path || JSON.stringify(value) === JSON.stringify(rule.equals)),
          input: [],
          expected: rule.label,
          actual: 'Static rubric check (not execution)',
          runtime: performance.now() - start,
        };
      });
  return {
    tests,
    console: [
      'Static validation only. This does not execute Java, shell commands, infrastructure, or distributed systems.',
    ],
    runtime: performance.now() - start,
  };
}
