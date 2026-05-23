import { expect, test } from '@playwright/test';

const passwordPlaceholder = /secret (passcode|temple code|cipher)/i;

test('login and register screens validate required fields before API calls', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /login/i }).click();
  await page.locator('button[type="submit"]').click();
  await expect(page.getByText(/Email is required./i)).toBeVisible();

  await page.getByRole('button', { name: /register/i }).click();
  await page.getByPlaceholder('Your explorer name...').fill('Ava');
  await page.getByPlaceholder('Your email address...').fill('ava@example.com');
  await page.getByPlaceholder(passwordPlaceholder).fill('hunter2');
  await page.getByPlaceholder('Confirm your code...').fill('different');
  await page.locator('button[type="submit"]').click();

  await expect(page.getByText(/Secret codes do not match!/i)).toBeVisible();
});