import { Page, Locator } from '@playwright/test';

export class AdminSubscribersPage {
  readonly page: Page;
  readonly copyEmailsBtn: Locator;
  readonly sendUpdateBtn: Locator;
  readonly subscriberCountText: Locator;
  readonly confirmDeleteBtn: Locator;
  readonly cancelDeleteBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.copyEmailsBtn = page.getByRole('button', { name: /copy all emails/i });
    this.sendUpdateBtn = page.getByRole('button', { name: /send update/i });
    this.subscriberCountText = page.getByText(/\d+ subscriber/i);
    this.confirmDeleteBtn = page.getByRole('button', { name: /confirm|yes|remove/i }).last();
    this.cancelDeleteBtn = page.getByRole('button', { name: /cancel|no/i });
  }

  async goto() {
    await this.page.goto('/admin/subscribers');
  }

  getSubscriberRows() {
    return this.page.locator('tr, li').filter({
      has: this.page.getByRole('button', { name: /remove/i }),
    });
  }

  getRemoveBtns() {
    return this.page.getByRole('button', { name: /remove/i });
  }
}
