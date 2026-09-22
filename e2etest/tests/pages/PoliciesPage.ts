import { Page, Locator } from '@playwright/test';

export class PoliciesPage {
  readonly page: Page;
  readonly pageHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeading = page.getByRole('heading', { name: /policies/i }).first();
  }

  async goto() {
    await this.page.goto('/policies');
  }

  getDynamicPolicies() {
    return this.page.getByRole('link', { name: /download/i });
  }
}
