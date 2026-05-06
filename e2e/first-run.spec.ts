import { expect, test } from '@playwright/test';

test('first-run setup reaches app shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /set up your novel sources/i })).toBeVisible();
  await page.getByRole('button', { name: /start empty/i }).click();
  await expect(page.getByRole('heading', { name: /library/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /downloads/i })).toBeVisible();
});
