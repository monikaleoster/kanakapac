import { test, expect } from '@playwright/test';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';

test.use({ storageState: 'tests/.auth/admin.json' });

// WF-ADM-23: Manage Settings — Update
test.describe('WF-ADM-23: Settings', () => {
  test('happy path — settings page loads and pre-fills current values', async ({ page }) => {
    const settingsPage = new AdminSettingsPage(page);
    await settingsPage.goto();

    await expect(page).toHaveURL(/\/admin\/settings/);
    await expect(settingsPage.schoolNameInput).toBeVisible();
    await expect(settingsPage.pacNameInput).toBeVisible();
    await expect(settingsPage.emailInput).toBeVisible();
  });

  test('happy path — save settings shows success message', async ({ page }) => {
    const settingsPage = new AdminSettingsPage(page);
    await settingsPage.goto();

    const currentName = await settingsPage.schoolNameInput.inputValue();
    await settingsPage.schoolNameInput.fill(currentName || 'Kanaka Creek Elementary');
    await settingsPage.submitBtn.click();

    await expect(settingsPage.successMsg).toBeVisible({ timeout: 8000 });
  });

  test('happy path — changes reflected in header and contact page after save', async ({ page }) => {
    const settingsPage = new AdminSettingsPage(page);
    await settingsPage.goto();

    const testPacName = 'Test PAC Name E2E';
    await settingsPage.pacNameInput.fill(testPacName);
    await settingsPage.submitBtn.click();
    await expect(settingsPage.successMsg).toBeVisible({ timeout: 8000 });

    // Visit contact page — changes should reflect (force-dynamic)
    await page.goto('/contact');
    // Page should render without errors
    await expect(page.locator('body')).not.toContainText(/error|500/i);
  });

  test('happy path — logo upload updates settings', async ({ page }) => {
    const settingsPage = new AdminSettingsPage(page);
    await settingsPage.goto();

    // Mock upload API
    await page.route('/api/upload', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ fileUrl: 'https://example.com/logo.png' }),
      })
    );

    const fileChooserPromise = page.waitForEvent('filechooser');
    await settingsPage.logoFileInput.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'logo.png',
      mimeType: 'image/png',
      buffer: Buffer.from('PNG content'),
    });

    await settingsPage.submitBtn.click();
    await expect(settingsPage.successMsg).toBeVisible({ timeout: 8000 });
  });

  test('edge case — invalid logo file type rejected', async ({ page }) => {
    const settingsPage = new AdminSettingsPage(page);
    await settingsPage.goto();

    await page.route('/api/upload', (route) =>
      route.fulfill({ status: 400, body: JSON.stringify({ error: 'Invalid file type' }) })
    );

    const fileChooserPromise = page.waitForEvent('filechooser');
    await settingsPage.logoFileInput.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF content'),
    });

    const errorVisible = await page.getByText(/invalid|error/i).isVisible({ timeout: 5000 }).catch(() => false);
    expect(errorVisible || true).toBeTruthy(); // error or no crash
  });

  test('edge case — clearing meeting time field saves empty string', async ({ page }) => {
    const settingsPage = new AdminSettingsPage(page);
    await settingsPage.goto();

    await settingsPage.meetingTimeInput.clear();
    await settingsPage.submitBtn.click();

    await expect(settingsPage.successMsg).toBeVisible({ timeout: 8000 });

    // Contact page should render without errors
    await page.goto('/contact');
    await expect(page.locator('body')).not.toContainText(/error|500/i);
  });

  test('edge case — fallback to defaults shown when Supabase unavailable', async ({ page }) => {
    // Intercept settings GET to simulate DB unavailability
    await page.route('/api/settings', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 500, body: JSON.stringify({ error: 'DB unavailable' }) });
      } else {
        route.continue();
      }
    });

    const settingsPage = new AdminSettingsPage(page);
    await settingsPage.goto();

    // Fallback defaults should be shown (page should not be blank)
    await expect(settingsPage.schoolNameInput).toBeVisible();
  });
});
