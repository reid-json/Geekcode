import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('an independent solve creates editable evidence, an honest resume draft, a story, and a roundtrip backup', async ({
  page,
}) => {
  await page.goto('./#/problem/java-map-defaults');
  await page.getByRole('textbox', { name: 'Authored answer' }).fill('7\n1');
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.locator('.results summary.success')).toHaveCount(1);
  await page.getByRole('button', { name: 'Keep practicing' }).click();
  await page.goto('./#/career');
  await page.getByRole('button', { name: 'learning log', exact: true }).click();
  await expect(page.locator('.log-editor')).toContainText('solid');
  await page.getByRole('button', { name: 'Promote to resume bank', exact: true }).click();
  await page.getByRole('button', { name: 'resume builder', exact: true }).click();
  await page.getByRole('button', { name: 'Assemble eligible evidence' }).click();
  await expect(page.getByRole('textbox', { name: 'Resume section' })).toHaveValue(
    /practice on Java collections/,
  );
  await page.getByRole('button', { name: 'story bank', exact: true }).click();
  await page.getByLabel('Prefill story evidence').selectOption({ label: 'Java map defaults' });
  await page.getByRole('button', { name: 'Save story', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Practice: Java map defaults' })).toBeVisible();
  await page.goto('./#/settings');
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export complete backup' }).click();
  const file = await pending;
  const path = await file.path();
  expect(path).toBeTruthy();
  const backup: { xp: number; notes: unknown[]; stories: unknown[]; log: unknown[] } = JSON.parse(
    await readFile(path!, 'utf8'),
  );
  expect(backup.xp).toBeGreaterThan(0);
  expect(backup.notes.length).toBeGreaterThan(0);
  expect(backup.stories).toHaveLength(1);
  expect(backup.log).toHaveLength(1);
  page.on('dialog', (dialog) => void dialog.accept());
  await page.getByLabel('Import progress').setInputFiles(path!);
  await expect(page.locator('.toast')).toContainText('Backup imported');
  await page.reload();
  await page.goto('./#/career');
  await page.getByRole('button', { name: 'story bank', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Practice: Java map defaults' })).toBeVisible();
});
