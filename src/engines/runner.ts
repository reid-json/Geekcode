import type { Language, Problem } from '../content/schema';
import type { RunResult, WorkerReply } from './protocol';

export function runCode(
  problem: Problem,
  language: Language,
  code: string,
  submit: boolean,
  onStatus: (status: string) => void,
  signal?: AbortSignal,
): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./runner.worker.ts', import.meta.url), { type: 'module' });
    let timeout: ReturnType<typeof setTimeout>;
    const cleanup = () => {
      clearTimeout(timeout);
      worker.terminate();
      signal?.removeEventListener('abort', abort);
    };
    const fail = (message: string) => {
      cleanup();
      reject(new Error(message));
    };
    const abort = () => fail('Execution cancelled.');
    const arm = (ms: number) => {
      clearTimeout(timeout);
      timeout = setTimeout(
        () =>
          fail(
            'Execution timed out. The Worker was terminated. Check for infinite loops, excessive allocations, or unavailable runtime downloads.',
          ),
        ms,
      );
    };
    arm(language === 'python' ? 120_000 : language === 'typescript' ? 30_000 : 15_000);
    worker.onmessage = ({ data }: MessageEvent<WorkerReply>) => {
      if (data.type === 'status') {
        onStatus(data.message);
        if (data.message === 'Executing test cases…') arm(5000);
      } else {
        cleanup();
        resolve(data.result);
      }
    };
    worker.onerror = (event) =>
      fail(event.message || 'Worker failed. Try a smaller input or reload the runtime.');
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) {
      abort();
      return;
    }
    onStatus('Starting isolated execution…');
    const base = new URL(import.meta.env.BASE_URL, location.href).href;
    worker.postMessage({ problem, language, code, submit, base });
  });
}
