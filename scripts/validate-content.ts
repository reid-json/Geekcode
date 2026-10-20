import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import initSqlJs from 'sql.js';
import { problems, lessons, tracks } from '../src/content';
import { validateCatalog } from '../src/core/content-validation';
import { validateStatic } from '../src/engines/static';
import { equal } from '../src/engines/protocol';
const errors = validateCatalog(problems, lessons, tracks);
const SQL = await initSqlJs();
let checks = 0;
for (const problem of problems) {
  for (const language of problem.languages) {
    const source = problem.reference[language]!;
    try {
      if (language === 'python') continue;
      if (
        (language === 'javascript' || language === 'typescript') &&
        ['code', 'refactor', 'fill', 'repair'].includes(problem.kind)
      ) {
        for (const test of problem.tests) {
          const context = vm.createContext({ args: structuredClone(test.args) });
          const actual: unknown = vm.runInContext(
            `${source}; JSON.stringify(solve(...args))`,
            context,
            { timeout: 3000 },
          );
          if (typeof actual !== 'string' || !equal(JSON.parse(actual), test.expected))
            throw new Error(
              `Reference ${language} failed: ${JSON.stringify(test.args)} → ${String(actual)}, expected ${JSON.stringify(test.expected)}`,
            );
          checks++;
        }
      } else if (language === 'sql') {
        for (const test of problem.tests) {
          const db = new SQL.Database();
          try {
            db.run(problem.seed ?? '');
            if (typeof test.args[0] === 'string') db.run(test.args[0]);
            db.run('PRAGMA query_only=ON');
            const result = db.exec(source);
            const actual = result.at(-1)?.values ?? [];
            if (!equal(actual, test.expected))
              throw new Error(
                `SQL reference failed: ${JSON.stringify(actual)}, expected ${JSON.stringify(test.expected)}`,
              );
            checks++;
          } finally {
            db.close();
          }
        }
      } else {
        const result = validateStatic(problem, source);
        if (result.error || !result.tests.length || result.tests.some((t) => !t.passed))
          throw new Error(
            `Static reference failed: ${
              result.error ??
              result.tests
                .filter((t) => !t.passed)
                .map((t) => t.label)
                .join(', ')
            }`,
          );
        checks++;
      }
    } catch (error) {
      errors.push(`${problem.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
const python = spawnSync(
  process.env.PYTHON ?? 'python',
  [
    '-c',
    `
import json,sys,traceback
problems=json.load(sys.stdin)
errors=[]
checks=0
def equal(a,b):
    if isinstance(a,(int,float)) and isinstance(b,(int,float)) and not isinstance(a,bool) and not isinstance(b,bool):
        return abs(a-b)<=1e-6*max(1,abs(b))
    if isinstance(a,list) and isinstance(b,list): return len(a)==len(b) and all(equal(x,y) for x,y in zip(a,b))
    if isinstance(a,dict) and isinstance(b,dict): return a.keys()==b.keys() and all(equal(a[k],b[k]) for k in a)
    return type(a)==type(b) and a==b
for p in problems:
    if 'python' not in p['reference']: continue
    try:
        scope={}
        exec(p['reference']['python'],scope)
        for t in p['tests']:
            actual=scope['solve'](*t['args'])
            if not equal(actual,t['expected']): raise ValueError(f"{t['args']} -> {actual}, expected {t['expected']}")
            checks+=1
    except Exception as e: errors.append(p['id']+': '+str(e))
print(json.dumps({'checks':checks,'errors':errors}))
`,
  ],
  { input: JSON.stringify(problems), encoding: 'utf8', timeout: 60_000 },
);
if (python.error || python.status !== 0)
  errors.push(
    `Python validator failed: ${python.error?.message ?? python.stderr}. Install Python 3 or set PYTHON to its executable.`,
  );
else {
  const result: { checks: number; errors: string[] } = JSON.parse(python.stdout);
  checks += result.checks;
  errors.push(...result.errors);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    `Validated ${problems.length} problems, ${lessons.length} lessons, all career/coach metadata, and ${checks} reference checks (JS, TS, Python, SQL, rubrics).`,
  );
