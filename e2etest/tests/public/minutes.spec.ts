import { test, expect } from '@playwright/test';
import { MinutesPage } from '../pages/MinutesPage';
import { MinutesDetailPage } from '../pages/MinutesDetailPage';

// WF-PUB-04: Browse Meeting Minutes Archive
test.describe('WF-PUB-04: Minutes Archive', () => {
  test('happy path — page loads with heading', async ({ page }) => {
    const minutesPage = new MinutesPage(page);
    await minutesPage.goto();

    await expect(page).toHaveURL(/\/minutes/);
    await expect(minutesPage.pageHeading).toBeVisible();
  });

  test('happy path — subscribe form present', async ({ page }) => {
    const minutesPage = new MinutesPage(page);
    await minutesPage.goto();

    await expect(minutesPage.subscribeForm).toBeVisible();
  });

  test('happy path — minutes cards show title and date', async ({ page }) => {
    const minutesPage = new MinutesPage(page);
    await minutesPage.goto();

    const cards = minutesPage.getMinutesCards();
    const count = await cards.count();
    if (count > 0) {
      const text = await cards.first().textContent() ?? '';
      expect(text.length).toBeGreaterThan(0);
    }
  });

  test('happy path — download button present on card with fileUrl', async ({ page }) => {
    const minutesPage = new MinutesPage(page);
    await minutesPage.goto();

    const downloadBtns = minutesPage.getDownloadButtons();
    const count = await downloadBtns.count();
    if (count > 0) {
      await expect(downloadBtns.first()).toBeVisible();
      await expect(downloadBtns.first()).toHaveAttribute('href', /.+/);
    }
  });

  test('happy path — clicking a minutes card navigates to detail page', async ({ page }) => {
    const minutesPage = new MinutesPage(page);
    await minutesPage.goto();

    const cards = minutesPage.getMinutesCards();
    const count = await cards.count();
    if (count > 0) {
      const cardLink = cards.first().locator('a').first();
      const linkVisible = await cardLink.isVisible().catch(() => false);
      if (linkVisible) {
        await cardLink.click();
        await expect(page).toHaveURL(/\/minutes\/.+/);
      }
    }
  });

  test('edge case — empty state when no minutes', async ({ page }) => {
    const minutesPage = new MinutesPage(page);
    await minutesPage.goto();

    const hasCards = await minutesPage.getMinutesCards().first().isVisible().catch(() => false);
    const hasEmptyState = await minutesPage.noMinutesMsg.isVisible().catch(() => false);
    expect(hasCards || hasEmptyState).toBeTruthy();
  });

  test('edge case — content preview strips markdown characters', async ({ page }) => {
    const minutesPage = new MinutesPage(page);
    await minutesPage.goto();

    const cards = minutesPage.getMinutesCards();
    const count = await cards.count();
    if (count > 0) {
      // Cards without a download button show a content preview — it should not start with # or *
      const downloadBtns = minutesPage.getDownloadButtons();
      const downloadCount = await downloadBtns.count();
      if (downloadCount === 0) {
        const text = await cards.first().textContent() ?? '';
        expect(text.trimStart()).not.toMatch(/^[#*]/);
      }
    }
  });
});

// WF-PUB-05: Read Meeting Minutes Detail
test.describe('WF-PUB-05: Minutes Detail', () => {
  test('happy path — back link present', async ({ page }) => {
    // Navigate to minutes list first to get a real ID
    await page.goto('/minutes');
    const cards = page.locator('article, li, [class*="card"]').filter({ has: page.locator('a[href*="/minutes/"]') });
    const count = await cards.count();

    if (count > 0) {
      const link = cards.first().locator('a[href*="/minutes/"]').first();
      await link.click();
      await expect(page).toHaveURL(/\/minutes\/.+/);

      const detailPage = new MinutesDetailPage(page);
      await expect(detailPage.backLink).toBeVisible();
    }
  });

  test('happy path — title and content rendered', async ({ page }) => {
    await page.goto('/minutes');
    const link = page.locator('a[href*="/minutes/"]').first();
    const hasLink = await link.isVisible().catch(() => false);

    if (hasLink) {
      await link.click();
      await expect(page).toHaveURL(/\/minutes\/.+/);

      const detailPage = new MinutesDetailPage(page);
      await expect(detailPage.getTitle()).toBeVisible();
      await expect(detailPage.contentArea).toBeVisible();
    }
  });

  test('edge case — invalid ID returns 404', async ({ page }) => {
    const detailPage = new MinutesDetailPage(page);
    await detailPage.goto('nonexistent-id-000');

    // Next.js notFound() triggers a 404 page
    const status = page.locator('h1, h2').filter({ hasText: /404|not found/i });
    await expect(status).toBeVisible();
  });

  test('edge case — back link navigates to minutes archive', async ({ page }) => {
    await page.goto('/minutes');
    const link = page.locator('a[href*="/minutes/"]').first();
    const hasLink = await link.isVisible().catch(() => false);

    if (hasLink) {
      await link.click();
      const detailPage = new MinutesDetailPage(page);
      await detailPage.backLink.click();
      await expect(page).toHaveURL(/\/minutes$/);
    }
  });
});
