import { Page, Locator } from '@playwright/test';

export class AdminSettingsPage {
  readonly page: Page;
  readonly schoolNameInput: Locator;
  readonly pacNameInput: Locator;
  readonly emailInput: Locator;
  readonly addressInput: Locator;
  readonly cityProvinceInput: Locator;
  readonly meetingTimeInput: Locator;
  readonly logoFileInput: Locator;
  readonly submitBtn: Locator;
  readonly successMsg: Locator;

  constructor(page: Page) {
    this.page = page;
    this.schoolNameInput = page.getByLabel(/school name/i);
    this.pacNameInput = page.getByLabel(/pac name/i);
    this.emailInput = page.getByLabel(/email/i);
    this.addressInput = page.getByLabel(/address/i);
    this.cityProvinceInput = page.getByLabel(/city|province/i);
    this.meetingTimeInput = page.getByLabel(/meeting time/i);
    this.logoFileInput = page.locator('input[type="file"]');
    this.submitBtn = page.getByRole('button', { name: /save|submit/i });
    this.successMsg = page.getByText(/saved|success/i);
  }

  async goto() {
    await this.page.goto('/admin/settings');
  }
}
