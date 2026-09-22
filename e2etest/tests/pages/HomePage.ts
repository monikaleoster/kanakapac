import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly viewEventsBtn: Locator;
  readonly learnAboutBtn: Locator;
  readonly urgentBanner: Locator;
  readonly upcomingEventsSection: Locator;
  readonly announcementsSection: Locator;
  readonly noUpcomingEventsMsg: Locator;

  readonly articlesSection: Locator;
  readonly noNewsMsg: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1 });
    this.viewEventsBtn = page.getByRole('link', { name: /view events/i });
    this.learnAboutBtn = page.getByRole('link', { name: /about pac/i });
    this.urgentBanner = page.locator('[class*="bg-red"], [class*="urgent"]').first();
    this.upcomingEventsSection = page.getByRole('heading', { name: /upcoming events/i }).first();
    this.announcementsSection = page.getByRole('heading', { name: /^announcements$/i }).first();
    this.noUpcomingEventsMsg = page.getByText(/no upcoming events at this time/i);
    this.articlesSection = page.getByRole('heading', { name: /latest news/i }).first();
    this.noNewsMsg = page.getByText(/no news posted yet/i);
  }

  async goto() {
    await this.page.goto('/');
  }

  getEventCards() {
    return this.page.locator('[data-testid="event-card"], .event-card, article').filter({
      has: this.page.locator('h2, h3').first(),
    });
  }

  getAnnouncementCards() {
    return this.page.locator('[data-testid="announcement-card"], .announcement-card, article').filter({
      has: this.page.locator('h2, h3').first(),
    });
  }
}
