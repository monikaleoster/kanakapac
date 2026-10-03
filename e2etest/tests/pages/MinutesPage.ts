import { Page, Locator } from '@playwright/test';

export class MinutesPage {
  readonly page: Page;
  readonly pageHeading: Locator;
  readonly noMinutesMsg: Locator;
  readonly subscribeForm: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeading = page.getByRole('heading', { name: /meeting minutes/i }).first();
    this.noMinutesMsg = page.getByText(/no meeting minutes have been posted/i);
    this.subscribeForm = page.locator('form').filter({ has: page.getByRole('button', { name: /subscribe/i }) });
  }

  async goto() {
    await this.page.goto('/minutes');
  }

  getMinutesCards() {
    return this.page.locator('[data-testid="minutes-card"]');
  }

  getViewDocumentLinks() {
    return this.page.getByRole('link', { name: /view document/i });
  }
}
