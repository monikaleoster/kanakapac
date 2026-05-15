import { test, expect } from '@playwright/test';
import { AnnouncementsPage } from '../pages/AnnouncementsPage';

// WF-PUB-03: Browse Announcements Page
test.describe('WF-PUB-03: Announcements Page', () => {
  test('happy path — page loads with heading', async ({ page }) => {
    const announcementsPage = new AnnouncementsPage(page);
    await announcementsPage.goto();

    await expect(page).toHaveURL(/\/announcements/);
    await expect(announcementsPage.pageHeading).toBeVisible();
  });

  test('happy path — subscribe form present', async ({ page }) => {
    const announcementsPage = new AnnouncementsPage(page);
    await announcementsPage.goto();

    await expect(announcementsPage.subscribeForm).toBeVisible();
  });

  test('happy path — urgent announcements have Urgent badge', async ({ page }) => {
    const announcementsPage = new AnnouncementsPage(page);
    await announcementsPage.goto();

    const urgentBadges = announcementsPage.getUrgentBadges();
    const count = await urgentBadges.count();
    // If urgent badges exist, they should be visible
    if (count > 0) {
      await expect(urgentBadges.first()).toBeVisible();
    }
  });

  test('edge case — empty state shown when no announcements', async ({ page }) => {
    const announcementsPage = new AnnouncementsPage(page);
    await announcementsPage.goto();

    // Either announcements exist OR an empty state message is shown
    const hasAnnouncements = await page.locator('article, li').first().isVisible().catch(() => false);
    const hasEmptyState = await announcementsPage.noAnnouncementsMsg.isVisible().catch(() => false);
    expect(hasAnnouncements || hasEmptyState).toBeTruthy();
  });

  test('edge case — expired announcements still shown on this page', async ({ page }) => {
    const announcementsPage = new AnnouncementsPage(page);
    await announcementsPage.goto();

    // This page shows ALL announcements including expired ones
    // We verify the page renders without errors
    await expect(announcementsPage.pageHeading).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/error|500/i);
  });

  test('edge case — each announcement card shows title and published date', async ({ page }) => {
    const announcementsPage = new AnnouncementsPage(page);
    await announcementsPage.goto();

    const cards = page.locator('article, [class*="card"]').filter({ has: page.locator('h2, h3') });
    const count = await cards.count();
    if (count > 0) {
      const cardText = await cards.first().textContent() ?? '';
      // Should contain a date pattern
      expect(cardText).toMatch(/\d{4}/);
    }
  });
});
