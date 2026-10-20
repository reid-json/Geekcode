import { expect, test, type Page } from '@playwright/test';
async function writeCode(page: Page, code: string) {
  const editor = page.getByRole('textbox', { name: 'Solution editor' });
  await editor.waitFor();
  await editor.focus();
  await page.keyboard.press('ControlOrMeta+A');
  await page.evaluate((source) => navigator.clipboard.writeText(source), code);
  await page.keyboard.press('ControlOrMeta+V');
}
test('SQL hidden changed-data cases and static YAML use the same submission flow', async ({
  page,
}) => {
  await page.goto('./#/problem/department-headcounts');
  await writeCode(
    page,
    'SELECT d.name,COUNT(e.id) FROM departments d LEFT JOIN employees e ON e.department_id=d.id GROUP BY d.id,d.name ORDER BY d.id',
  );
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.locator('.results summary.success')).toHaveCount(2);
  await page.getByRole('button', { name: 'Keep practicing' }).click();
  await page.goto('./#/problem/service-target-port');
  await writeCode(
    page,
    'apiVersion: v1\nkind: Service\nmetadata:\n  name: web\nspec:\n  selector:\n    app: web\n  ports:\n    - port: 80\n      targetPort: 8080\n      protocol: TCP',
  );
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.locator('.results summary.success')).toHaveCount(5);
});
test('coach saves reasoning, stuck never reveals editorial, and notes persist after reload', async ({
  page,
}) => {
  await page.goto('./#/problem/pair-with-a-target');
  await expect(page.getByRole('button', { name: 'Editorial & comparison' })).toHaveCount(0);
  await page
    .getByRole('textbox', { name: 'Coach response' })
    .fill(
      'The input is an array and target; return indices as output. An empty array has no pair.',
    );
  await page.getByRole('button', { name: 'Capture insight & continue' }).click();
  await expect(page.locator('.coach-card h3')).toContainText('first example');
  await page.getByRole('button', { name: 'I’m stuck' }).click();
  await expect(page.getByRole('button', { name: 'Editorial & comparison' })).toHaveCount(0);
  await page
    .getByRole('textbox', { name: 'Quick capture', exact: true })
    .fill('Remember to check duplicates before assuming all values differ.');
  await page.getByRole('textbox', { name: 'Quick capture', exact: true }).press('Enter');
  await page.reload();
  await page.getByRole('button', { name: 'Notes N' }).click();
  await expect(page.getByRole('dialog', { name: 'Context notes' })).toBeVisible();
  await page.goto('./#/notes');
  await page.getByRole('textbox', { name: 'Search notes', exact: true }).fill('duplicates');
  await expect(page.locator('.note-card')).toHaveCount(1);
});
test('Quick Learn creates an explanation card and honest Learning Log entry', async ({ page }) => {
  await page.goto('./#/lesson/lesson-hash-maps');
  await page.getByRole('button', { name: 'Quick Learn · predict first' }).click();
  await page.getByRole('textbox', { name: 'Quick Learn prediction' }).fill('0');
  await page.getByRole('button', { name: 'Observe the scenario' }).click();
  await page
    .getByRole('textbox', { name: 'Quick Learn explanation' })
    .fill(
      'Reading a missing key returns a fallback but does not insert a value. The map remains empty; inserting would change its size.',
    );
  await page.getByRole('checkbox', { name: 'My explanation connects' }).check();
  await page.getByRole('button', { name: 'Apply the rule', exact: true }).click();
  await page.getByRole('textbox', { name: 'Quick Learn challenge answer' }).fill('1');
  await page.getByRole('button', { name: 'Check my application' }).click();
  await expect(page.getByRole('heading', { name: 'Your rule, in your words.' })).toBeVisible();
  await page.getByRole('button', { name: 'Turn my explanation into a flashcard' }).click();
  await page.goto('./#/review');
  await expect(page.locator('.flashcard h2')).toContainText('My rule: Hash maps');
  await page.getByRole('button', { name: 'Reveal review answer' }).click();
  await page.getByRole('button', { name: 'Good' }).click();
  await page.goto('./#/career');
  await page.getByRole('button', { name: 'learning log', exact: true }).click();
  await expect(page.locator('.log-editor')).toContainText('needs review');
});
test('interview hides coach/editorial and a runaway loop is terminated', async ({ page }) => {
  await page.goto('./#/problem/pair-with-a-target');
  await page.getByRole('button', { name: 'interview', exact: true }).click();
  await expect(page.locator('.coach-card')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Editorial & comparison' })).toHaveCount(0);
  await writeCode(page, 'function solve() { while (true) {} }');
  await page.getByRole('button', { name: 'Run examples' }).click();
  await expect(page.locator('.results .error')).toContainText('timed out', { timeout: 20000 });
  await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeEnabled();
});
test('core routes render without page errors at tablet width', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const route of [
    '/',
    '/problems',
    '/library',
    '/glossary',
    '/cheatsheets',
    '/roadmap',
    '/review',
    '/notes',
    '/career',
    '/settings',
    '/placement',
    '/stats',
  ]) {
    await page.goto(`./#${route}`);
    await expect(page.locator('main h1')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto('./#/');
  await expect(page.getByRole('heading', { name: /Less rust/ })).toBeVisible();
  await page.screenshot({ path: 'test-results/dashboard-desktop.png', fullPage: true });
});
