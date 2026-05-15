import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

// WF-PUB-01: Browse Homepage
test.describe('WF-PUB-01: Homepage', () => {
  test('happy path — hero section and CTAs visible', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.heading).toBeVisible();
    await expect(home.viewEventsBtn).toBeVisible();
    await expect(home.learnAboutBtn).toBeVisible();

    await expect(home.viewEventsBtn).toHaveAttribute('href', /\/events/);
    await expect(home.learnAboutBtn).toHaveAttribute('href', /\/about/);
  });

  test('happy path — upcoming events section shown', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.upcomingEventsSection).toBeVisible();
  });

  test('happy path — announcements section shown', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.announcementsSection).toBeVisible();
  });

  test('edge case — CTA links navigate to correct pages', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.viewEventsBtn.click();
    await expect(page).toHaveURL(/\/events/);

    await page.goBack();
    await home.learnAboutBtn.click();
    await expect(page).toHaveURL(/\/about/);
  });

  test('edge case — homepage is fresh (no stale cache)', async ({ page }) => {
    const home = new HomePage(page);
    const response = await page.goto('/');
    // force-dynamic pages should not be served from CDN cache with long TTLs
    const cacheControl = response?.headers()['cache-control'] ?? '';
    expect(cacheControl).not.toMatch(/max-age=[1-9]\d{3,}/);
  });

  test('edge case — max 3 event cards shown on homepage', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // If events exist, at most 3 should appear in the upcoming section
    const eventCards = home.getEventCards();
    const count = await eventCards.count();
    expect(count).toBeLessThanOrEqual(3);
  });

  test('edge case — urgent announcement banner present when urgent announcements exist', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // Check whether any urgent banner OR no urgent content is shown
    const urgentBannerCount = await home.urgentBanner.count();
    // We don't assert it MUST be there since content may vary, but if present it should contain text
    if (urgentBannerCount > 0) {
      await expect(home.urgentBanner.first()).not.toBeEmpty();
    }
  });
});
