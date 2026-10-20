export const PYTHON_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
export async function registerOffline(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
    scope: import.meta.env.BASE_URL,
  });
}
export async function prepareOffline(status: (message: string) => void): Promise<void> {
  if (!import.meta.env.PROD)
    throw new Error(
      'Offline installation is available in npm run build / npm run preview, not the development server.',
    );
  if (!('serviceWorker' in navigator) || !('caches' in window))
    throw new Error('This browser does not support offline storage.');
  status('Waiting for the app cache installation…');
  const registration = await navigator.serviceWorker.ready;
  if (!registration.active)
    throw new Error('Service Worker is not active. Reload once after building the production app.');
  const response = await fetch(`${import.meta.env.BASE_URL}runtime/pyodide/pyodide-lock.json`);
  if (!response.ok) throw new Error(`Package manifest failed (${response.status}).`);
  const lock: { packages: Record<string, { file_name: string; depends: string[] }> } =
    await response.json();
  const files = new Set<string>();
  function add(name: string) {
    const entry = lock.packages[name];
    if (!entry) throw new Error(`Package ${name} not found.`);
    if (files.has(entry.file_name)) return;
    files.add(entry.file_name);
    entry.depends.forEach(add);
  }
  ['numpy', 'pandas', 'scikit-learn'].forEach(add);
  const cache = await caches.open('geekcode-python-v0.27.7');
  let i = 0;
  for (const file of files) {
    status(`Caching scientific packages ${++i}/${files.size}: ${file}`);
    const url = PYTHON_CDN + file;
    const existing = await cache.match(url);
    if (existing?.ok) continue;
    const result = await fetch(url);
    if (!result.ok) throw new Error(`${file}: HTTP ${result.status}`);
    await cache.put(url, result);
  }
  status('Checking local engine files…');
  for (const path of [
    'runtime/pyodide/pyodide.asm.js',
    'runtime/pyodide/pyodide.asm.wasm',
    'runtime/pyodide/python_stdlib.zip',
    'runtime/sql/sql-wasm.wasm',
  ]) {
    const url = new URL(import.meta.env.BASE_URL + path, location.href).href;
    if (!(await caches.match(url)))
      throw new Error(`${path} is not cached. Reload the production build online and retry.`);
  }
}
