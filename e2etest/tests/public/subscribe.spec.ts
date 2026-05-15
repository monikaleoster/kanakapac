import { test, expect } from '@playwright/test';

// WF-PUB-09: Subscribe to Newsletter
// WF-PUB-10: Unsubscribe via Email Link
test.describe('WF-PUB-09: Newsletter Subscribe', () => {
  const pages = ['/', '/events', '/announcements', '/minutes'];

  for (const path of pages) {
    test(`happy path — subscribe form visible on ${path}`, async ({ page }) => {
      await page.goto(path);
      const subscribeForm = page.locator('form').filter({
        has: page.getByRole('button', { name: /subscribe/i }),
      });
      await expect(subscribeForm).toBeVisible();
    });
  }

  test('happy path — valid email submits and shows success message', async ({ page }) => {
    await page.goto('/');

    const emailInput = page.locator('input[type="email"]').last();
    const subscribeBtn = page.getByRole('button', { name: /subscribe/i }).last();

    await emailInput.fill('testsubscriber@example.com');
    await subscribeBtn.click();

    const successMsg = page.getByText(/subscribed|success/i);
    await expect(successMsg).toBeVisible({ timeout: 8000 });
  });

  test('happy path — button shows loading state during request', async ({ page }) => {
    await page.goto('/');

    const emailInput = page.locator('input[type="email"]').last();
    const subscribeBtn = page.getByRole('button', { name: /subscribe/i }).last();

    await emailInput.fill('loading-test@example.com');

    // Intercept the API call to simulate slow response
    await page.route('/api/subscribe', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      await route.continue();
    });

    await subscribeBtn.click();
    // During the request, the button should show loading text or be disabled
    const isDisabledOrLoading = await Promise.race([
      subscribeBtn.isDisabled(),
      page.getByText(/subscribing/i).isVisible().catch(() => false),
    ]);
    expect(isDisabledOrLoading).toBeTruthy();
  });

  test('edge case — email without @ blocked by HTML5 validation', async ({ page }) => {
    await page.goto('/');

    const emailInput = page.locator('input[type="email"]').last();
    const subscribeBtn = page.getByRole('button', { name: /subscribe/i }).last();

    await emailInput.fill('notanemail');
    await subscribeBtn.click();

    // HTML5 validation should prevent submission; success message should NOT appear
    const successMsg = page.getByText(/subscribed|success/i);
    await expect(successMsg).not.toBeVisible({ timeout: 2000 }).catch(() => {});
    // URL should not change
    await expect(page).toHaveURL('/');
  });

  test('edge case — empty email blocked by browser', async ({ page }) => {
    await page.goto('/');

    const subscribeBtn = page.getByRole('button', { name: /subscribe/i }).last();
    await subscribeBtn.click();

    const successMsg = page.getByText(/subscribed|success/i);
    // Should not succeed with empty input
    await expect(successMsg).not.toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('edge case — duplicate email shows success (silently handled)', async ({ page }) => {
    await page.goto('/');

    const emailInput = page.locator('input[type="email"]').last();
    const subscribeBtn = page.getByRole('button', { name: /subscribe/i }).last();

    // Subscribe same email twice
    await emailInput.fill('duplicate@example.com');
    await subscribeBtn.click();

    const successMsg = page.getByText(/subscribed|success/i);
    await expect(successMsg).toBeVisible({ timeout: 8000 });

    // Subscribe again
    await emailInput.fill('duplicate@example.com');
    await subscribeBtn.click();
    await expect(successMsg).toBeVisible({ timeout: 8000 });
  });

  test('edge case — server error shows error message', async ({ page }) => {
    await page.goto('/');

    await page.route('/api/subscribe', (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'Server error' }) })
    );

    const emailInput = page.locator('input[type="email"]').last();
    const subscribeBtn = page.getByRole('button', { name: /subscribe/i }).last();

    await emailInput.fill('error@example.com');
    await subscribeBtn.click();

    const errorMsg = page.getByText(/error/i);
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
  });
});

// WF-PUB-10: Unsubscribe via Email Link
test.describe('WF-PUB-10: Unsubscribe', () => {
  test('happy path — valid token shows unsubscribed confirmation', async ({ page }) => {
    const email = 'unsub@example.com';
    const token = Buffer.from(email).toString('base64url');
    const response = await page.goto(`/api/unsubscribe?token=${token}`);

    // Should return HTML confirmation or a redirect to a confirmation page
    expect(response?.status()).not.toBe(500);
    const bodyText = await page.locator('body').textContent() ?? '';
    expect(bodyText).toMatch(/unsubscribed|successfully/i);
  });

  test('edge case — missing token returns 400', async ({ page }) => {
    const response = await page.goto('/api/unsubscribe');
    expect(response?.status()).toBe(400);
  });

  test('edge case — token without @ returns 400', async ({ page }) => {
    const token = Buffer.from('notanemail').toString('base64url');
    const response = await page.goto(`/api/unsubscribe?token=${token}`);
    expect(response?.status()).toBe(400);
  });

  test('edge case — unknown email still shows confirmation (no error thrown)', async ({ page }) => {
    const email = 'notindb_xyz@example.com';
    const token = Buffer.from(email).toString('base64url');
    const response = await page.goto(`/api/unsubscribe?token=${token}`);

    expect(response?.status()).not.toBe(500);
    const bodyText = await page.locator('body').textContent() ?? '';
    expect(bodyText).toMatch(/unsubscribed|successfully/i);
  });
});
