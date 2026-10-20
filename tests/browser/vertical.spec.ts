import { expect, test } from '@playwright/test';

test('JavaScript and Python execute in Workers and a submission earns XP', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./#/problem/pair-with-a-target');
  await page.getByRole('textbox', { name: 'Solution editor' }).waitFor();
  await page.getByRole('textbox', { name: 'Solution editor' }).focus();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText('Math.');
  await page.keyboard.press('Control+Space');
  await expect(page.locator('.suggest-widget.visible')).toContainText('abs');
  await page.keyboard.press('Escape');
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(
    'function solve(nums, target) { for (let j=0;j<nums.length;j++) for(let i=0;i<j;i++) if(nums[i]+nums[j]===target) return [i,j]; return []; }',
  );
  await page.getByRole('button', { name: 'Run examples' }).click();
  await expect(page.locator('.results summary.success')).toHaveCount(2);
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.locator('.xp')).not.toHaveText('0 XP');
  await page.getByRole('button', { name: 'Keep practicing' }).click();
  await page.getByLabel('Language', { exact: true }).selectOption('python');
  await page.getByRole('textbox', { name: 'Solution editor' }).focus();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(
    'def solve(nums, target): return next(([i,j] for j in range(len(nums)) for i in range(j) if nums[i]+nums[j]==target), [])',
  );
  await page.getByRole('button', { name: 'Run examples' }).click();
  await expect(page.locator('.results summary.success')).toHaveCount(2, { timeout: 120000 });
  expect(errors).toEqual([]);
});
