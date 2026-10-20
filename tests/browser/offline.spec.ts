import { expect, test } from '@playwright/test';

test('production PWA caches every app asset and executes Python and SQLite offline at a subpath', async ({
  page,
  context,
}) => {
  test.skip(
    !process.env.E2E_PREVIEW,
    'Requires the built Service Worker, not Vite development mode.',
  );
  await page.goto('./#/settings');
  await expect(page.getByRole('heading', { name: 'Offline readiness' })).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.getByRole('button', { name: 'Prepare all engines for offline use' }).click();
  await expect(page.getByRole('status')).toContainText(
    'Ready: app, engines, NumPy, pandas, and scikit-learn',
    { timeout: 120000 },
  );
  const cacheState = await page.evaluate(async () => {
    const names = await caches.keys();
    const app = names.find((n) => n.startsWith('geekcode-app-'));
    const keys = app ? await (await caches.open(app)).keys() : [];
    return {
      controller: !!navigator.serviceWorker.controller,
      workspace: keys.filter((k) => k.url.includes('Workspace-')).map((k) => k.url),
      count: keys.length,
    };
  });
  expect(cacheState.controller).toBe(true);
  expect(cacheState.workspace).toHaveLength(1);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Offline readiness' })).toBeVisible();
  await page.goto('./#/problem/pair-with-a-target');
  await page.getByLabel('Language', { exact: true }).selectOption('python');
  let editor = page.getByRole('textbox', { name: 'Solution editor' });
  await editor.waitFor();
  await editor.focus();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(
    'def solve(nums,target): return next(([i,j] for j in range(len(nums)) for i in range(j) if nums[i]+nums[j]==target), [])',
  );
  await page.getByRole('button', { name: 'Run examples' }).click();
  await expect(page.locator('.results summary.success')).toHaveCount(2, { timeout: 60000 });
  await page.goto('./#/problem/daily-totals');
  editor = page.getByRole('textbox', { name: 'Solution editor' });
  await editor.waitFor();
  await editor.focus();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(
    'SELECT ordered_on,SUM(amount) FROM orders GROUP BY ordered_on ORDER BY ordered_on',
  );
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.locator('.results summary.success')).toHaveCount(2);
});
