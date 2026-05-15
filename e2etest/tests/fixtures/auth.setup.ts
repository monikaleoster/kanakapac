import { test as setup, expect } from '@playwright/test';
import path from 'path';

export const adminAuthFile = path.join(__dirname, '../.auth/admin.json');


setup('authenticate as admin', async ({ page }) => {
  await page.goto('/admin');
  const passwordInput = page.getByLabel(/password/i).or(page.locator('input[type="password"]'));
  await passwordInput.fill('pac-admin-2026');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.context().storageState({ path: adminAuthFile });
});
