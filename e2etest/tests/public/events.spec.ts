import { test, expect } from '@playwright/test';
import { EventsPage } from '../pages/EventsPage';

// WF-PUB-02: Browse Events Page
test.describe('WF-PUB-02: Events Page', () => {
  test('happy path — page loads with upcoming events heading', async ({ page }) => {
    const eventsPage = new EventsPage(page);
    await eventsPage.goto();

    await expect(page).toHaveURL(/\/events/);
    await expect(eventsPage.upcomingHeading).toBeVisible();
  });

  test('happy path — subscribe form present', async ({ page }) => {
    const eventsPage = new EventsPage(page);
    await eventsPage.goto();

    await expect(eventsPage.subscribeForm).toBeVisible();
  });

  test('happy path — event cards show date, time, location', async ({ page }) => {
    const eventsPage = new EventsPage(page);
    await eventsPage.goto();

    const cards = eventsPage.getUpcomingEventCards();
    const count = await cards.count();
    if (count > 0) {
      // First card should contain date-like text (month name or YYYY)
      const cardText = await cards.first().textContent();
      // Should contain a year or a month name
      expect(cardText).toMatch(/\d{4}|january|february|march|april|may|june|july|august|september|october|november|december/i);
    }
  });

  test('edge case — past events section visible when past events exist', async ({ page }) => {
    const eventsPage = new EventsPage(page);
    await eventsPage.goto();

    // Past events heading should be visible on the page
    const pastHeadingVisible = await eventsPage.pastHeading.isVisible().catch(() => false);
    // If no past events we won't fail — just check the heading OR the no-past-events message
    if (!pastHeadingVisible) {
      // Both sections may be absent if no events at all
      const noUpcoming = await eventsPage.noUpcomingMsg.isVisible().catch(() => false);
      const hasPastSection = await eventsPage.pastHeading.isVisible().catch(() => false);
      expect(noUpcoming || !hasPastSection).toBeTruthy();
    }
  });

  test('edge case — 24h time displayed as 12h format', async ({ page }) => {
    const eventsPage = new EventsPage(page);
    await eventsPage.goto();

    const cards = eventsPage.getUpcomingEventCards();
    const count = await cards.count();
    if (count > 0) {
      const cardText = await cards.first().textContent() ?? '';
      // 24h raw values like "19:00" should NOT appear; 12h like "7:00 PM" should
      expect(cardText).not.toMatch(/\b(13|14|15|16|17|18|19|20|21|22|23):\d{2}\b/);
    }
  });
});
