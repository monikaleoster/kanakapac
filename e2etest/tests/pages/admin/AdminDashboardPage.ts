import { Page, Locator } from '@playwright/test';

export class AdminDashboardPage {
  readonly page: Page;
  readonly signOutBtn: Locator;
  readonly dashboardHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signOutBtn = page.getByRole('button', { name: /sign out|logout/i });
    this.dashboardHeading = page.getByRole('heading', { name: /dashboard/i });
  }

  async goto() {
    await this.page.goto('/admin/dashboard');
  }

  async signOut() {
    await this.signOutBtn.click();
  }
}
