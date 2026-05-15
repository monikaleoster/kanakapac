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

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /welcome to kanaka pac/i });
    this.viewEventsBtn = page.getByRole('link', { name: /view upcoming events/i });
    this.learnAboutBtn = page.getByRole('link', { name: /learn about pac/i });
    this.urgentBanner = page.locator('[class*="bg-red"], [class*="urgent"]').first();
    this.upcomingEventsSection = page.getByRole('heading', { name: /upcoming events/i }).first();
    this.announcementsSection = page.getByRole('heading', { name: /recent announcements/i }).first();
    this.noUpcomingEventsMsg = page.getByText(/no upcoming events scheduled/i);
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
