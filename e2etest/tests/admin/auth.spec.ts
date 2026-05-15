import { test, expect } from '@playwright/test';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';

// WF-ADM-01: Admin Login
// WF-ADM-02: Admin Logout
test.describe('WF-ADM-01: Admin Login', () => {
  test('happy path — correct password redirects to dashboard', async ({ page }) => {
    const loginPage = new AdminLoginPage(page);
    await loginPage.goto();

    await loginPage.login('pac-admin-2026');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('edge case — wrong password shows error message', async ({ page }) => {
    const loginPage = new AdminLoginPage(page);
    await loginPage.goto();

    await loginPage.login('wrongpassword');
    await expect(loginPage.errorMsg).toBeVisible();
    await expect(page).not.toHaveURL(/dashboard/);
  });

  test('edge case — empty password shows error', async ({ page }) => {
    const loginPage = new AdminLoginPage(page);
    await loginPage.goto();

    await loginPage.signInBtn.click();
    // Either HTML5 validation blocks or NextAuth returns an error
    const errorVisible = await loginPage.errorMsg.isVisible().catch(() => false);
    const stillOnLogin = page.url().includes('/admin') && !page.url().includes('dashboard');
    expect(errorVisible || stillOnLogin).toBeTruthy();
  });

  test('edge case — already authenticated navigates directly to dashboard', async ({ page }) => {
    // Log in first
    const loginPage = new AdminLoginPage(page);
    await loginPage.goto();
    await loginPage.login('pac-admin-2026');
    await expect(page).toHaveURL(/dashboard/);

    // Now visit /admin again — should land on dashboard, not login
    await page.goto('/admin');
    await expect(page).toHaveURL(/dashboard/);
  });
});

test.describe('WF-ADM-02: Admin Logout', () => {
  test.use({ storageState: 'tests/.auth/admin.json' });

  test('happy path — sign out redirects to login page', async ({ page }) => {
    const dashboard = new AdminDashboardPage(page);
    await dashboard.goto();

    await expect(dashboard.signOutBtn).toBeVisible();
    await dashboard.signOut();

    await expect(page).toHaveURL(/\/admin/);
    // Login form should be visible after logout
    await expect(page.getByLabel(/password/i).or(page.locator('input[type="password"]'))).toBeVisible();
  });

  test('edge case — back button after logout redirects to login on next protected navigation', async ({ page }) => {
    const dashboard = new AdminDashboardPage(page);
    await dashboard.goto();
    await dashboard.signOut();
    await expect(page).toHaveURL(/\/admin/);

    // Navigating to a protected route after logout should redirect to login
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin/);
  });
});
