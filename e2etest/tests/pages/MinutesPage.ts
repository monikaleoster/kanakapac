import { Page, Locator } from '@playwright/test';

export class MinutesPage {
  readonly page: Page;
  readonly pageHeading: Locator;
  readonly noMinutesMsg: Locator;
  readonly subscribeForm: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeading = page.getByRole('heading', { name: /meeting minutes/i }).first();
    this.noMinutesMsg = page.getByText(/no minutes/i);
    this.subscribeForm = page.locator('form').filter({ has: page.getByRole('button', { name: /subscribe/i }) });
  }

  async goto() {
    await this.page.goto('/minutes');
  }

  getMinutesCards() {
    return this.page.locator('article, [data-testid="minutes-card"], .minutes-card, li').filter({
      has: this.page.locator('h2, h3'),
    });
  }

  getDownloadButtons() {
    return this.page.getByRole('link', { name: /download minutes/i });
  }
}
