import { Page, Locator } from '@playwright/test';

export class ContactPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly subjectInput: Locator;
  readonly messageInput: Locator;
  readonly submitBtn: Locator;
  readonly emailLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByLabel(/name/i);
    this.emailInput = page.getByLabel(/email/i);
    this.subjectInput = page.getByLabel(/subject/i);
    this.messageInput = page.getByLabel(/message/i);
    this.submitBtn = page.getByRole('button', { name: /send/i });
    this.emailLink = page.locator('a[href^="mailto:"]').first();
  }

  async goto() {
    await this.page.goto('/contact');
  }
}
