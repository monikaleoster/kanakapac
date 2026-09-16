import { test as setup, expect } from '@playwright/test';
import path from 'path';

export const adminAuthFile = path.join(__dirname, '../.auth/admin.json');

// Falls back to the same default the app itself uses (src/lib/auth-options.ts)
// so tests keep working against environments that don't set ADMIN_PASSWORD.
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'pac-admin-2026';

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/admin');
  const passwordInput = page.getByLabel(/password/i).or(page.locator('input[type="password"]'));
  await passwordInput.fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.context().storageState({ path: adminAuthFile });
});
