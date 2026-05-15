import { Page, Locator } from '@playwright/test';

export class EventsPage {
  readonly page: Page;
  readonly upcomingHeading: Locator;
  readonly pastHeading: Locator;
  readonly noUpcomingMsg: Locator;
  readonly noPastMsg: Locator;
  readonly subscribeForm: Locator;

  constructor(page: Page) {
    this.page = page;
    this.upcomingHeading = page.getByRole('heading', { name: /upcoming events/i });
    this.pastHeading = page.getByRole('heading', { name: /past events/i });
    this.noUpcomingMsg = page.getByText(/no upcoming events/i);
    this.noPastMsg = page.getByText(/no past events/i);
    this.subscribeForm = page.locator('form').filter({ has: page.getByRole('button', { name: /subscribe/i }) });
  }

  async goto() {
    await this.page.goto('/events');
  }

  getUpcomingEventCards() {
    return this.page.locator('[data-testid="event-card"]').or(
      this.page.locator('article, .event-card')
    );
  }

  getPastEventCards() {
    return this.page.locator('[class*="opacity"], [style*="opacity"]');
  }
}
