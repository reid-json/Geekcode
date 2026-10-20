/// <reference lib="webworker" />
import {
  equal,
  type RunRequest,
  type RunResult,
  type TestResult,
  type WorkerReply,
} from './protocol';
import { validateStatic } from './static';

const send = (reply: WorkerReply) => self.postMessage(reply);
const stringValue = (value: unknown) =>
  typeof value === 'string' ? value : (JSON.stringify(value) ?? String(value));

self.onmessage = async ({ data }: MessageEvent<RunRequest>) => {
  const started = performance.now();
  const output: string[] = [];
  const tests: TestResult[] = [];
  const { problem, language, submit, base } = data;
  const cases = problem.tests.filter((test) => submit || !test.hidden);
  const capture = (...args: unknown[]) => {
    if (output.length < 150) output.push(args.map(stringValue).join(' ').slice(0, 4000));
  };
  try {
    if (
      !['javascript', 'typescript', 'python', 'sql'].includes(language) ||
      !['code', 'refactor', 'fill', 'repair'].includes(problem.kind)
    ) {
      send({ type: 'result', result: validateStatic(problem, data.code) });
      return;
    }
    let execute: (args: unknown[]) => unknown | Promise<unknown>;
    if (language === 'javascript' || language === 'typescript') {
      let code = data.code;
      if (language === 'typescript') {
        send({ type: 'status', message: 'Loading TypeScript compiler…' });
        const ts = await import('typescript');
        code = ts.transpileModule(code, {
          compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
        }).outputText;
      }
      // User code is evaluated only in this disposable Worker, never in the page.
      send({ type: 'status', message: 'Executing test cases…' });
      const build = new Function('console', `${code}\n;return solve;`);
      const solve: (...args: unknown[]) => unknown = build({
        log: capture,
        warn: capture,
        error: capture,
        info: capture,
        debug: capture,
      });
      execute = (args) => solve(...structuredClone(args));
    } else if (language === 'python') {
      send({
        type: 'status',
        message: 'Starting local Python WASM (first load can take a moment)…',
      });
      const { loadPyodide } = await import('pyodide');
      const py = await loadPyodide({
        indexURL: `${base}runtime/pyodide/`,
        stdout: capture,
        stderr: capture,
      });
      const packages = ['numpy', ...(problem.track === 'ai' ? (problem.packages ?? []) : [])];
      send({
        type: 'status',
        message: 'Loading NumPy / requested scientific packages. Uncached packages need internet…',
      });
      const response = await fetch(`${base}runtime/pyodide/pyodide-lock.json`);
      if (!response.ok)
        throw new Error(`Python package manifest unavailable (${response.status}).`);
      const lock: { packages: Record<string, { file_name: string; depends: string[] }> } =
        await response.json();
      const files = new Set<string>();
      const add = (name: string) => {
        const entry = lock.packages[name];
        if (!entry) throw new Error(`Unknown Python package: ${name}`);
        if (files.has(entry.file_name)) return;
        files.add(entry.file_name);
        entry.depends.forEach(add);
      };
      packages.forEach(add);
      await py.loadPackage(
        [...files].map((name) => `https://cdn.jsdelivr.net/pyodide/v0.27.7/full/${name}`),
      );
      send({ type: 'status', message: 'Executing test cases…' });
      await py.runPythonAsync(data.code);
      execute = async (args) => {
        py.globals.set('_geekcode_args', JSON.stringify(args));
        const json: unknown = await py.runPythonAsync(
          'import json\njson.dumps(solve(*json.loads(_geekcode_args)))',
        );
        if (typeof json !== 'string')
          throw new Error('Python must return a JSON-serializable value.');
        return JSON.parse(json) as unknown;
      };
    } else {
      send({ type: 'status', message: 'Starting local SQLite WASM…' });
      const { default: initSqlJs } = await import('sql.js');
      const SQL = await initSqlJs({ locateFile: () => `${base}runtime/sql/sql-wasm.wasm` });
      execute = (args) => {
        const db = new SQL.Database();
        try {
          db.run(problem.seed ?? '');
          if (typeof args[0] === 'string') db.run(args[0]);
          db.run('PRAGMA query_only=ON');
          const result = db.exec(data.code);
          return result.length ? result[result.length - 1].values : [];
        } finally {
          db.close();
        }
      };
    }
    send({ type: 'status', message: 'Executing test cases…' });
    for (const [index, test] of cases.entries()) {
      const start = performance.now();
      try {
        const actual = await execute(test.args);
        tests.push({
          label: test.label ?? `Test ${index + 1}`,
          input: test.args,
          expected: test.expected,
          actual,
          passed: equal(actual, test.expected),
          runtime: performance.now() - start,
        });
      } catch (error) {
        tests.push({
          label: test.label ?? `Test ${index + 1}`,
          input: test.args,
          expected: test.expected,
          passed: false,
          error: error instanceof Error ? (error.stack ?? error.message) : String(error),
          runtime: performance.now() - start,
        });
      }
    }
    const result: RunResult = { tests, console: output, runtime: performance.now() - started };
    send({ type: 'result', result });
  } catch (error) {
    send({
      type: 'result',
      result: {
        tests,
        console: output,
        runtime: performance.now() - started,
        error: error instanceof Error ? (error.stack ?? error.message) : String(error),
      },
    });
  }
};
