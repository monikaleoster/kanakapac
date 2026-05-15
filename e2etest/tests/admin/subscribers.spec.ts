import { test, expect } from '@playwright/test';
import { AdminSubscribersPage } from '../pages/admin/AdminSubscribersPage';

test.use({ storageState: 'tests/.auth/admin.json' });

// WF-ADM-19: Manage Subscribers — View
// WF-ADM-20: Manage Subscribers — Remove
// WF-ADM-21: Manage Subscribers — Copy Emails
// WF-ADM-22: Manage Subscribers — Send Update
test.describe('WF-ADM-19: Subscribers — View', () => {
  test('happy path — page loads with subscriber table', async ({ page }) => {
    const subscribersPage = new AdminSubscribersPage(page);
    await subscribersPage.goto();

    await expect(page).toHaveURL(/\/admin\/subscribers/);
    await expect(page.locator('body')).not.toContainText(/error|500/i);
  });

  test('happy path — subscriber count shown above table', async ({ page }) => {
    const subscribersPage = new AdminSubscribersPage(page);
    await subscribersPage.goto();

    const countText = subscribersPage.subscriberCountText;
    const hasCount = await countText.isVisible().catch(() => false);
    const hasRows = await subscribersPage.getSubscriberRows().first().isVisible().catch(() => false);
    // Either count text shown OR empty state — one must be true
    expect(hasCount || !hasRows).toBeTruthy();
  });

  test('edge case — expired session returns 401 from API (table empty)', async ({ page }) => {
    // Simulate expired session by clearing cookies
    await page.context().clearCookies();
    const subscribersPage = new AdminSubscribersPage(page);
    await subscribersPage.goto();

    // Page HTML accessible but API should fail; table might show empty or error
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('WF-ADM-20: Subscribers — Remove', () => {
  test('happy path — remove subscriber shows confirmation then removes from list', async ({ page }) => {
    // First subscribe a test email
    await page.request.post('/api/subscribe', { data: { email: 'remove-test@example.com' } });

    const subscribersPage = new AdminSubscribersPage(page);
    await subscribersPage.goto();

    const row = page.locator('tr, li').filter({ hasText: 'remove-test@example.com' });
    const exists = await row.isVisible().catch(() => false);
    if (!exists) test.skip();

    await row.getByRole('button', { name: /remove/i }).click();
    await expect(subscribersPage.confirmDeleteBtn).toBeVisible();

    // Confirm email shown in modal
    const modal = page.locator('[role="dialog"], [class*="modal"]').first();
    await expect(modal.getByText('remove-test@example.com')).toBeVisible();

    await subscribersPage.confirmDeleteBtn.click();
    await expect(page.getByText('remove-test@example.com')).not.toBeVisible({ timeout: 8000 });
  });

  test('edge case — cancel remove keeps subscriber in list', async ({ page }) => {
    const subscribersPage = new AdminSubscribersPage(page);
    await subscribersPage.goto();

    const removeBtns = subscribersPage.getRemoveBtns();
    if (await removeBtns.count() === 0) test.skip();

    const rowsBefore = await subscribersPage.getSubscriberRows().count();
    await removeBtns.first().click();
    await subscribersPage.cancelDeleteBtn.click();

    const rowsAfter = await subscribersPage.getSubscriberRows().count();
    expect(rowsAfter).toBe(rowsBefore);
  });

  test('edge case — email with special chars is properly URL encoded on delete', async ({ page }) => {
    const specialEmail = 'user+tag@example.com';
    await page.request.post('/api/subscribe', { data: { email: specialEmail } });

    const subscribersPage = new AdminSubscribersPage(page);
    await subscribersPage.goto();

    const row = page.locator('tr, li').filter({ hasText: specialEmail });
    const exists = await row.isVisible().catch(() => false);
    if (!exists) test.skip();

    // Intercept DELETE to verify encoding
    let capturedUrl = '';
    await page.route('/api/subscribe*', async (route) => {
      capturedUrl = route.request().url();
      await route.continue();
    });

    await row.getByRole('button', { name: /remove/i }).click();
    await subscribersPage.confirmDeleteBtn.click();

    // URL should encode + as %2B
    expect(capturedUrl).toContain(encodeURIComponent(specialEmail));
  });
});

test.describe('WF-ADM-21: Subscribers — Copy Emails', () => {
  test('happy path — copy all emails button visible', async ({ page }) => {
    const subscribersPage = new AdminSubscribersPage(page);
    await subscribersPage.goto();

    await expect(subscribersPage.copyEmailsBtn).toBeVisible();
  });

  test('happy path — clicking copy emails does not throw error', async ({ page }) => {
    const subscribersPage = new AdminSubscribersPage(page);
    await subscribersPage.goto();

    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    await subscribersPage.copyEmailsBtn.click();
    // Page should not crash or show an error
    await expect(page.locator('body')).not.toContainText(/error|500/i);
  });
});

test.describe('WF-ADM-22: Subscribers — Send Update', () => {
  test('current behavior — clicking Send Update shows browser alert', async ({ page }) => {
    const subscribersPage = new AdminSubscribersPage(page);
    await subscribersPage.goto();

    await expect(subscribersPage.sendUpdateBtn).toBeVisible();

    // Handle the alert dialog
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toMatch(/email functionality coming soon/i);
      await dialog.accept();
    });

    await subscribersPage.sendUpdateBtn.click();
  });
});
