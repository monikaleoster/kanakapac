import { Page, Locator } from '@playwright/test';

export class AnnouncementsPage {
  readonly page: Page;
  readonly pageHeading: Locator;
  readonly noAnnouncementsMsg: Locator;
  readonly subscribeForm: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeading = page.getByRole('heading', { name: /announcements/i }).first();
    this.noAnnouncementsMsg = page.getByText(/no announcements/i);
    this.subscribeForm = page.locator('form').filter({ has: page.getByRole('button', { name: /subscribe/i }) });
  }

  async goto() {
    await this.page.goto('/announcements');
  }

  getUrgentCards() {
    return this.page.locator('[class*="bg-red"], [class*="urgent"]').filter({
      has: this.page.locator('[class*="badge"], span').filter({ hasText: /urgent/i }),
    });
  }

  getNormalCards() {
    return this.page.locator('[class*="bg-white"], [class*="border-gray"]').filter({
      has: this.page.locator('h2, h3'),
    });
  }

  getUrgentBadges() {
    return this.page.getByText(/urgent/i);
  }
}
